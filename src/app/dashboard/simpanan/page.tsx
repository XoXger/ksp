import {
  type AdminSavingsRowData,
  AdminSavingsView,
  type AdminSavingsSummary,
} from "@/components/ui/AdminSavingsView";
import { prisma } from "@/lib/prisma";

type SavingsHistoryRow = {
  id: string;
  member_name: string;
  jenis_simpanan: "POKOK" | "WAJIB" | "SUKARELA";
  nominal: number | string;
  tanggal_transfer: Date;
  bukti_transfer: string | null;
  status: "MENUNGGU" | "TERVERIFIKASI" | "DITOLAK";
};

export default async function DashboardSavingsPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [thisMonthRows, allSavingsRows, activeMemberRows, pendingRows, historyRows] =
    await Promise.all([
      prisma.$queryRaw<Array<{ total: number | string | null }>>`
        SELECT COALESCE(SUM(nominal), 0) AS total
        FROM simpanan
        WHERE id NOT LIKE 'DEFAULT-%'
          AND status = 'TERVERIFIKASI'::"StatusSimpanan"
          AND tanggal_transfer >= ${monthStart}
          AND tanggal_transfer < ${nextMonthStart}
      `,
      prisma.$queryRaw<Array<{ total: number | string | null }>>`
        SELECT COALESCE(SUM(nominal), 0) AS total
        FROM simpanan
        WHERE id NOT LIKE 'DEFAULT-%'
          AND status = 'TERVERIFIKASI'::"StatusSimpanan"
      `,
      prisma.$queryRaw<Array<{ total: number | string }>>`
        SELECT COUNT(*) AS total
        FROM anggota
        WHERE status = 'AKTIF'::"AccountStatus"
      `,
      prisma.$queryRaw<Array<{ total: number | string }>>`
        SELECT COUNT(*) AS total
        FROM simpanan
        WHERE id NOT LIKE 'DEFAULT-%'
          AND status = 'MENUNGGU'::"StatusSimpanan"
      `,
      prisma.$queryRaw<SavingsHistoryRow[]>`
        SELECT
          s.id,
          a.nama AS member_name,
          s.jenis_simpanan,
          s.nominal,
          s.tanggal_transfer,
          s.bukti_transfer,
          s.status
        FROM simpanan s
        JOIN anggota a ON a.id = s.anggota_id
        WHERE s.id NOT LIKE 'DEFAULT-%'
        ORDER BY s.tanggal_transfer DESC, s.id DESC
      `,
    ]);
  const summary: AdminSavingsSummary = {
    activeMembersCount: Number(activeMemberRows[0]?.total ?? 0),
    pendingVerificationCount: Number(pendingRows[0]?.total ?? 0),
    totalSavingsAll: formatRupiah(Number(allSavingsRows[0]?.total ?? 0)),
    totalSavingsThisMonth: formatRupiah(Number(thisMonthRows[0]?.total ?? 0)),
  };

  const savingsRows: AdminSavingsRowData[] = historyRows.map((row) => {
    const status = getSavingsStatusLabel(row.status);

    return {
      id: row.id,
      initials: getInitials(row.member_name),
      name: row.member_name,
      type: getSavingsTypeLabel(row.jenis_simpanan),
      amount: formatRupiah(Number(row.nominal)),
      date: formatDate(row.tanggal_transfer),
      status,
      statusTone:
        status === "Menunggu"
          ? "yellow"
          : status === "Ditolak"
            ? "red"
            : "green",
      avatarTone: getAvatarToneBySavingsStatus(status),
      isAutomatic: row.bukti_transfer === null,
    };
  });

  return <AdminSavingsView savingsRows={savingsRows} summary={summary} />;
}

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getSavingsTypeLabel(type: "POKOK" | "WAJIB" | "SUKARELA") {
  const labels = {
    POKOK: "Simpanan Pokok",
    WAJIB: "Simpanan Wajib",
    SUKARELA: "Simpanan Sukarela",
  };

  return labels[type];
}

function getSavingsStatusLabel(
  status: SavingsHistoryRow["status"],
): "Terverifikasi" | "Menunggu" | "Ditolak" {
  if (status === "MENUNGGU") {
    return "Menunggu";
  }

  if (status === "DITOLAK") {
    return "Ditolak";
  }

  return "Terverifikasi";
}

function getAvatarToneBySavingsStatus(
  status: "Terverifikasi" | "Menunggu" | "Ditolak",
): AdminSavingsRowData["avatarTone"] {
  const tones = {
    Terverifikasi: "green",
    Menunggu: "cream",
    Ditolak: "pink",
  } as const;

  return tones[status];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
