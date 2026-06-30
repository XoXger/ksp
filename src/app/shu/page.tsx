import { redirect } from "next/navigation";
import {
  MemberShuView,
  type MemberShuHistoryRowData,
  type MemberShuSummaryData,
} from "@/components/ui/MemberShuView";
import { getMemberIdFromSessionParam } from "@/lib/memberSession";
import { prisma } from "@/lib/prisma";

type ShuRecipientRecord = {
  id: string;
  total_savings: number | string | null;
  total_interest: number | string | null;
};

type ShuDistributionRecord = {
  nominal: number | string;
  tanggal_transfer: Date | string;
};

type ShuDistributionSummary = {
  total_distributed: number | string | null;
};

export default async function ShuPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; anggotaId?: string }>;
}) {
  const { sessionId, anggotaId: anggotaIdParam } = await searchParams;
  const anggotaId = await getMemberIdFromSessionParam(sessionId, anggotaIdParam);

  if (!anggotaId) {
    redirect("/login");
  }

  const [recipientRecords, distributionSummary, distributionRecords] = await Promise.all([
    prisma.$queryRaw<ShuRecipientRecord[]>`
      SELECT
        a.id,
        COALESCE(s.total_savings, 0) AS total_savings,
        COALESCE(p.total_interest, 0) AS total_interest
      FROM anggota a
      LEFT JOIN (
        SELECT
          anggota_id,
          SUM(nominal) AS total_savings
        FROM simpanan
        WHERE status = 'TERVERIFIKASI'::"StatusSimpanan"
          AND bukti_transfer IS DISTINCT FROM 'Distribusi SHU'
        GROUP BY anggota_id
      ) s ON s.anggota_id = a.id
      LEFT JOIN (
        SELECT
          anggota_id,
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
      WHERE a.status = 'AKTIF'
      ORDER BY a.created_at ASC, a.id ASC
    `,
    prisma.$queryRaw<ShuDistributionSummary[]>`
      SELECT COALESCE(SUM(nominal), 0) AS total_distributed
      FROM simpanan
      WHERE jenis_simpanan = 'SUKARELA'::"JenisSimpanan"
        AND bukti_transfer = 'Distribusi SHU'
        AND status = 'TERVERIFIKASI'::"StatusSimpanan"
    `,
    prisma.$queryRaw<ShuDistributionRecord[]>`
      SELECT nominal, tanggal_transfer
      FROM simpanan
      WHERE anggota_id = ${anggotaId}
        AND jenis_simpanan = ${"SUKARELA"}::"JenisSimpanan"
        AND bukti_transfer = 'Distribusi SHU'
      ORDER BY tanggal_transfer DESC, created_at DESC
    `,
  ]);
  const totalLoanInterest = recipientRecords.reduce(
    (total, recipient) => total + parseNumericAmount(recipient.total_interest),
    0,
  );
  const totalDistributedShu = parseNumericAmount(
    distributionSummary[0]?.total_distributed,
  );
  const remainingShu = totalLoanInterest - 3_000_000 - totalDistributedShu;
  const memberFund = Math.max(0, remainingShu) * 0.6;
  const savingsServiceFund = memberFund * 0.7;
  const loanServiceFund = memberFund * 0.3;
  const totalSavings = recipientRecords.reduce(
    (total, recipient) => total + parseNumericAmount(recipient.total_savings),
    0,
  );
  const totalInterest = recipientRecords.reduce(
    (total, recipient) => total + parseNumericAmount(recipient.total_interest),
    0,
  );
  const memberRecord = recipientRecords.find(
    (recipient) => recipient.id === anggotaId,
  );
  const memberSavings = parseNumericAmount(memberRecord?.total_savings);
  const memberInterest = parseNumericAmount(memberRecord?.total_interest);
  const savingsShu =
    totalSavings > 0 ? (memberSavings / totalSavings) * savingsServiceFund : 0;
  const loanShu =
    totalInterest > 0 ? (memberInterest / totalInterest) * loanServiceFund : 0;
  const summary: MemberShuSummaryData = {
    savingsShu: formatRupiah(savingsShu),
    loanShu: formatRupiah(loanShu),
    totalShu: formatRupiah(Math.max(0, savingsShu + loanShu)),
  };
  const historyRows: MemberShuHistoryRowData[] = distributionRecords.map(
    (distribution) => ({
      amount: formatRupiah(parseNumericAmount(distribution.nominal)),
      category: "SHU Reguler",
      date: formatDate(distribution.tanggal_transfer),
      status: "DIKIRIM",
      year: getBookYear(distribution.tanggal_transfer),
    }),
  );

  return <MemberShuView historyRows={historyRows} summary={summary} />;
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
  const prefix = value < 0 ? "- Rp " : "Rp ";

  return `${prefix}${new Intl.NumberFormat("id-ID").format(
    Math.abs(Math.round(value)),
  )}`;
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getBookYear(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return String(date.getFullYear());
}
