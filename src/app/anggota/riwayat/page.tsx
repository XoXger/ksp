import { redirect } from "next/navigation";
import {
  MemberTransactionHistoryView,
  type MemberTransactionRow,
} from "@/components/ui/MemberTransactionHistoryView";
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
  status_tone: "green" | "cream" | "red";
};

export default async function MemberTransactionHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; anggotaId?: string }>;
}) {
  const { sessionId, anggotaId: anggotaIdParam } = await searchParams;
  const anggotaId = await getMemberIdFromSessionParam(sessionId, anggotaIdParam);

  if (!anggotaId) {
    redirect("/login");
  }

  const memberRows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM anggota WHERE id = ${anggotaId} AND status = 'AKTIF'::"AccountStatus" LIMIT 1
  `;

  if (!memberRows[0]) {
    redirect("/login");
  }

  await ensureDefaultSavingsForActiveMembers();
  await ensureDefaultSavingsForMember(anggotaId);

  const memberTransactions = await prisma.$queryRaw<MemberTransaction[]>`
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
        'Berhasil' AS status_label,
        'green' AS status_tone
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
        END AS status_label,
        CASE status
          WHEN 'DISETUJUI' THEN 'green'
          WHEN 'DITOLAK' THEN 'red'
          ELSE 'cream'
        END AS status_tone
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
        END AS status_label,
        CASE pp.status
          WHEN 'TERVERIFIKASI' THEN 'green'
          WHEN 'DITOLAK' THEN 'red'
          ELSE 'cream'
        END AS status_tone
      FROM pembayaran_pinjaman pp
      JOIN pinjaman p ON p.id = pp.pinjaman_id
      WHERE p.anggota_id = ${anggotaId}
    ) transactions
    ORDER BY created_at DESC, id DESC
  `;
  const transactions: MemberTransactionRow[] = memberTransactions.map(
    (transaction, index) => ({
      date: formatDate(transaction.created_at),
      id: transaction.id,
      rowKey: `${transaction.id}-${transaction.created_at.toISOString()}-${transaction.description}-${index}`,
      description: transaction.description,
      amount: `${transaction.amount_tone === "green" ? "+" : "-"} ${formatNumber(Number(transaction.nominal))}`,
      amountTone: transaction.amount_tone,
      status: transaction.status_label,
      statusTone: transaction.status_tone,
    }),
  );

  return <MemberTransactionHistoryView transactions={transactions} />;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}
