import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { MemberReportData } from "@/components/PrintMemberReportButton";
import { MemberDashboardView } from "@/components/ui/MemberDashboardView";
import {
  ensureDefaultSavingsForActiveMembers,
  ensureDefaultSavingsForMember,
} from "@/lib/defaultSavings";
import { getMemberIdFromSessionParam } from "@/lib/memberSession";
import { prisma } from "@/lib/prisma";

type MemberTransaction = {
  amount_tone: "green" | "red";
  created_at: Date;
  description: string;
  id: string;
  nominal: number | string;
  status_label: string;
};

type ShuRecipientRecord = {
  id: string;
  total_interest: number | string | null;
  total_savings: number | string | null;
};

export default async function AnggotaPage({
  searchParams,
}: {
  searchParams: Promise<{ anggotaId?: string; sessionId?: string }>;
}) {
  const { sessionId, anggotaId: anggotaIdParam } = await searchParams;
  const anggotaId =
    (sessionId || anggotaIdParam
      ? await getMemberIdFromSessionParam(sessionId, anggotaIdParam)
      : null) ??
    (await cookies()).get("anggotaId")?.value;

  if (!anggotaId) {
    redirect("/login");
  }

  const memberRows = await prisma.$queryRaw<Array<{ id: string; nama: string }>>`
    SELECT id, nama FROM anggota WHERE id = ${anggotaId} AND status = 'AKTIF'::"AccountStatus" LIMIT 1
  `;

  if (!memberRows[0]) {
    redirect("/login");
  }

  await ensureDefaultSavingsForActiveMembers();
  await ensureDefaultSavingsForMember(anggotaId);

  const [
    savingsStatsRows,
    loanStatsRows,
    savingsByTypeRows,
    loanRows,
    transactionRows,
    shuRecipientRows,
  ] = await Promise.all([
    prisma.$queryRaw<
      Array<{ total_amount: number | string | null; total_count: number | string }>
    >`
      SELECT COUNT(*) AS total_count, COALESCE(SUM(nominal), 0) AS total_amount
      FROM simpanan
      WHERE anggota_id = ${anggotaId}
        AND status = 'TERVERIFIKASI'::"StatusSimpanan"
    `,
    prisma.$queryRaw<
      Array<{ total_amount: number | string | null; total_count: number | string }>
    >`
      SELECT COUNT(*) AS total_count, COALESCE(SUM(nominal), 0) AS total_amount
      FROM pinjaman
      WHERE anggota_id = ${anggotaId}
        AND status = 'DISETUJUI'::"StatusPinjaman"
    `,
    prisma.$queryRaw<
      Array<{
        jenis_simpanan: "POKOK" | "WAJIB" | "SUKARELA";
        total_amount: number | string | null;
      }>
    >`
      SELECT jenis_simpanan, COALESCE(SUM(nominal), 0) AS total_amount
      FROM simpanan
      WHERE anggota_id = ${anggotaId}
        AND status = 'TERVERIFIKASI'::"StatusSimpanan"
      GROUP BY jenis_simpanan
    `,
    prisma.$queryRaw<
      Array<{
        bunga: number | string;
        created_at: Date;
        id: string;
        nominal: number | string;
        status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
        tenor: number;
      }>
    >`
      SELECT id, nominal, bunga, tenor, status, created_at
      FROM pinjaman
      WHERE anggota_id = ${anggotaId}
      ORDER BY created_at DESC, id DESC
    `,
    prisma.$queryRaw<MemberTransaction[]>`
      SELECT *
      FROM (
        SELECT
          id,
          tanggal_transfer::timestamp AS created_at,
          CASE jenis_simpanan
            WHEN 'POKOK' THEN 'Setoran Simpanan Pokok'
            WHEN 'WAJIB' THEN 'Setoran Simpanan Wajib'
            ELSE 'Setoran Simpanan Sukarela'
          END AS description,
          nominal,
          'green' AS amount_tone,
          'Berhasil' AS status_label
        FROM simpanan
        WHERE anggota_id = ${anggotaId}
          AND id NOT LIKE 'DEFAULT-%'
          AND status = 'TERVERIFIKASI'::"StatusSimpanan"

        UNION ALL

        SELECT
          id,
          created_at,
          CASE status
            WHEN 'DISETUJUI' THEN 'Pengajuan Pinjaman Disetujui'
            WHEN 'DITOLAK' THEN 'Pengajuan Pinjaman Ditolak'
            ELSE 'Pengajuan Pinjaman Menunggu'
          END AS description,
          nominal,
          'green' AS amount_tone,
          CASE status
            WHEN 'DISETUJUI' THEN 'Disetujui'
            WHEN 'DITOLAK' THEN 'Ditolak'
            ELSE 'Menunggu'
          END AS status_label
        FROM pinjaman
        WHERE anggota_id = ${anggotaId}
          AND status = 'DISETUJUI'::"StatusPinjaman"

        UNION ALL

        SELECT
          pp.transaksi_id AS id,
          pp.created_at,
          CONCAT('Pembayaran Tagihan Pinjaman - Angsuran ke-', pp.angsuran_ke) AS description,
          pp.nominal,
          'red' AS amount_tone,
          CASE pp.status
            WHEN 'TERVERIFIKASI' THEN 'Berhasil'
            WHEN 'DITOLAK' THEN 'Ditolak'
            ELSE 'Menunggu'
          END AS status_label
        FROM pembayaran_pinjaman pp
        JOIN pinjaman p ON p.id = pp.pinjaman_id
        WHERE p.anggota_id = ${anggotaId}
      ) transactions
      ORDER BY created_at DESC, id DESC
    `,
    prisma.$queryRaw<ShuRecipientRecord[]>`
      SELECT
        a.id,
        COALESCE(s.total_savings, 0) AS total_savings,
        COALESCE(p.total_interest, 0) AS total_interest
      FROM anggota a
      LEFT JOIN (
        SELECT anggota_id, SUM(nominal) AS total_savings
        FROM simpanan
        WHERE status = 'TERVERIFIKASI'::"StatusSimpanan"
          AND bukti_transfer IS DISTINCT FROM 'Distribusi SHU'
        GROUP BY anggota_id
      ) s ON s.anggota_id = a.id
      LEFT JOIN (
        SELECT anggota_id,
          SUM(
            CASE
              WHEN tipe_bunga = 'FLAT'::"TipeBungaPinjaman" THEN nominal * bunga / 100 * tenor
              ELSE nominal * bunga / 100
            END
          ) AS total_interest
        FROM pinjaman
        WHERE status = 'DISETUJUI'::"StatusPinjaman"
        GROUP BY anggota_id
      ) p ON p.anggota_id = a.id
      WHERE a.status = 'AKTIF'::"AccountStatus"
      ORDER BY a.created_at ASC, a.id ASC
    `,
  ]);
  const savingsCount = Number(savingsStatsRows[0]?.total_count ?? 0);
  const loansCount = Number(loanStatsRows[0]?.total_count ?? 0);
  const totalSavingsAmount = parseNumericAmount(
    savingsStatsRows[0]?.total_amount,
  );
  const savingsByTypeMap = new Map(
    savingsByTypeRows.map((row) => [
      row.jenis_simpanan,
      parseNumericAmount(row.total_amount),
    ]),
  );
  const report: MemberReportData = {
    estimatedShu: formatRupiah(calculateEstimatedShu(shuRecipientRows, anggotaId)),
    loans: loanRows.map((loan) => ({
      amount: formatRupiah(parseNumericAmount(loan.nominal)),
      date: formatDate(loan.created_at),
      id: loan.id,
      interest: `${formatPercent(parseNumericAmount(loan.bunga))}% per bulan`,
      status: getLoanStatusLabel(loan.status),
      tenor: `${loan.tenor} Bulan`,
    })),
    member: {
      id: memberRows[0].id,
      name: memberRows[0].nama,
    },
    savings: [
      {
        amount: formatRupiah(savingsByTypeMap.get("POKOK") ?? 0),
        label: "Simpanan Pokok",
      },
      {
        amount: formatRupiah(savingsByTypeMap.get("WAJIB") ?? 0),
        label: "Simpanan Wajib",
      },
      {
        amount: formatRupiah(savingsByTypeMap.get("SUKARELA") ?? 0),
        label: "Simpanan Sukarela",
      },
    ],
    transactions: transactionRows.map((transaction) => ({
      amount: `${transaction.amount_tone === "green" ? "+" : "-"} ${formatRupiah(
        parseNumericAmount(transaction.nominal),
      )}`,
      date: formatDate(transaction.created_at),
      description: transaction.description,
      id: transaction.id,
      status: transaction.status_label,
    })),
  };

  return (
    <MemberDashboardView
      report={report}
      stats={{
        loansCount,
        savingsCount,
        totalSavings: formatRupiah(totalSavingsAmount),
        totalTransactions: savingsCount + loansCount,
      }}
    />
  );
}

function calculateEstimatedShu(records: ShuRecipientRecord[], anggotaId: string) {
  const totalLoanInterest = records.reduce(
    (total, recipient) => total + parseNumericAmount(recipient.total_interest),
    0,
  );
  const netProfit = totalLoanInterest - 3_000_000;
  const memberFund = Math.max(0, netProfit) * 0.6;
  const savingsServiceFund = memberFund * 0.7;
  const loanServiceFund = memberFund * 0.3;
  const totalSavings = records.reduce(
    (total, recipient) => total + parseNumericAmount(recipient.total_savings),
    0,
  );
  const memberRecord = records.find((recipient) => recipient.id === anggotaId);
  const memberSavings = parseNumericAmount(memberRecord?.total_savings);
  const memberInterest = parseNumericAmount(memberRecord?.total_interest);
  const savingsShu =
    totalSavings > 0 ? (memberSavings / totalSavings) * savingsServiceFund : 0;
  const loanShu =
    totalLoanInterest > 0
      ? (memberInterest / totalLoanInterest) * loanServiceFund
      : 0;

  return Math.max(0, savingsShu + loanShu);
}

function parseNumericAmount(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  const parsedValue = Number(value.toString().replace(",", "."));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(value))}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(date);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function getLoanStatusLabel(status: "MENUNGGU" | "DISETUJUI" | "DITOLAK") {
  return {
    DISETUJUI: "Disetujui",
    DITOLAK: "Ditolak",
    MENUNGGU: "Menunggu",
  }[status];
}
