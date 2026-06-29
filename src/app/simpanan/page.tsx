import {
  MemberSavingsView,
  type MemberSavingsHistoryRow,
} from "@/components/ui/MemberSavingsView";
import { redirect } from "next/navigation";
import {
  ensureDefaultSavingsForActiveMembers,
  ensureDefaultSavingsForMember,
} from "@/lib/defaultSavings";
import { getMemberIdFromSessionParam } from "@/lib/memberSession";
import { prisma } from "@/lib/prisma";

type SavingsTotalRow = {
  jenis_simpanan: "POKOK" | "WAJIB" | "SUKARELA";
  total: number | string | null;
};

type SavingsHistoryRecord = {
  id: string;
  jenis_simpanan: "POKOK" | "WAJIB" | "SUKARELA";
  nominal: number | string | null;
  tanggal_transfer: Date | string;
  bukti_transfer: string | null;
};

export default async function SimpananPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; anggotaId?: string }>;
}) {
  const { sessionId, anggotaId: anggotaIdParam } = await searchParams;
  const anggotaId = await getMemberIdFromSessionParam(sessionId, anggotaIdParam);

  if (!anggotaId) {
    redirect("/login");
  }

  const anggotaRows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM anggota WHERE id = ${anggotaId} AND status = 'AKTIF'::"AccountStatus" LIMIT 1
  `;

  if (!anggotaRows[0]) {
    redirect("/login");
  }

  await ensureDefaultSavingsForActiveMembers();
  await ensureDefaultSavingsForMember(anggotaId);

  const [memberSavingsRows, managedSavingsRows, savingsHistoryRecords] =
    await Promise.all([
      prisma.$queryRaw<SavingsTotalRow[]>`
      SELECT jenis_simpanan, COALESCE(SUM(nominal), 0) AS total
      FROM simpanan
      WHERE anggota_id = ${anggotaId}
        AND status = 'TERVERIFIKASI'::"StatusSimpanan"
      GROUP BY jenis_simpanan
    `,
      prisma.$queryRaw<Array<{ total: number | string | null }>>`
        SELECT COALESCE(SUM(s.nominal), 0) AS total
      FROM simpanan s
      WHERE s.anggota_id = ${anggotaId}
        AND s.status = 'TERVERIFIKASI'::"StatusSimpanan"
    `,
      prisma.$queryRaw<SavingsHistoryRecord[]>`
        SELECT id, jenis_simpanan, nominal, tanggal_transfer, bukti_transfer
        FROM simpanan
        WHERE anggota_id = ${anggotaId}
        ORDER BY tanggal_transfer DESC, created_at DESC, id DESC
      `,
    ]);
  const totals = new Map(
    memberSavingsRows.map((row) => [row.jenis_simpanan, Number(row.total ?? 0)]),
  );
  const historyRows: MemberSavingsHistoryRow[] = savingsHistoryRecords.map(
    (row) => ({
      id: row.id,
      type: formatSavingsType(row.jenis_simpanan),
      amount: formatRupiah(Number(row.nominal ?? 0)),
      date: formatDate(row.tanggal_transfer),
      proof: row.bukti_transfer ?? "-",
    }),
  );

  return (
    <MemberSavingsView
      balances={{
        pokok: formatRupiah(totals.get("POKOK") ?? 0),
        wajib: formatRupiah(totals.get("WAJIB") ?? 0),
        sukarela: formatRupiah(totals.get("SUKARELA") ?? 0),
      }}
      historyRows={historyRows}
      totalManagedSavings={formatNumber(Number(managedSavingsRows[0]?.total ?? 0))}
    />
  );
}

function formatRupiah(value: number) {
  return `Rp ${formatNumber(value)}`;
}

function formatSavingsType(type: SavingsHistoryRecord["jenis_simpanan"]) {
  return {
    POKOK: "Simpanan Pokok",
    WAJIB: "Simpanan Wajib",
    SUKARELA: "Simpanan Sukarela",
  }[type];
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}
