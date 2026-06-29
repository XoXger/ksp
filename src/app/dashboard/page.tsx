import {
  type AdminDashboardActivity,
  AdminDashboardView,
  type AdminDashboardMetrics,
} from "@/components/ui/AdminDashboardView";
import { prisma } from "@/lib/prisma";

type ActivityRow = {
  activity_type: "SAVINGS" | "LOAN" | "MEMBER";
  activity_title: string;
  member_id: string;
  member_name: string;
  amount: number | string | null;
  created_at: Date;
};

export default async function DashboardPage() {
  const [
    memberRows,
    savingsRows,
    loanRows,
    loanInterestRows,
    activityRows,
  ] = await Promise.all([
    prisma.$queryRaw<Array<{ total: number | string }>>`
      SELECT COUNT(*) AS total
      FROM anggota
      WHERE status = 'AKTIF'::"AccountStatus"
    `,
    prisma.$queryRaw<Array<{ total: number | string | null }>>`
      SELECT COALESCE(SUM(nominal), 0) AS total
      FROM simpanan
      WHERE id NOT LIKE 'DEFAULT-%'
        AND status = 'TERVERIFIKASI'::"StatusSimpanan"
    `,
    prisma.$queryRaw<Array<{ total: number | string | null }>>`
      SELECT COALESCE(SUM(nominal), 0) AS total
      FROM pinjaman
      WHERE status = 'DISETUJUI'::"StatusPinjaman"
    `,
    prisma.$queryRaw<Array<{ total: number | string | null }>>`
      SELECT COALESCE(SUM(
        CASE
          WHEN tipe_bunga = 'FLAT'::"TipeBungaPinjaman" THEN nominal * bunga / 100 * tenor
          ELSE nominal * bunga / 100
        END
      ), 0) AS total
      FROM pinjaman
      WHERE status = 'DISETUJUI'::"StatusPinjaman"
    `,
    prisma.$queryRaw<ActivityRow[]>`
      SELECT *
      FROM (
        SELECT
          'SAVINGS' AS activity_type,
          CASE s.jenis_simpanan
            WHEN 'POKOK' THEN 'Simpanan Pokok Masuk'
            WHEN 'WAJIB' THEN 'Simpanan Wajib Masuk'
            ELSE 'Simpanan Sukarela Masuk'
          END AS activity_title,
          a.id AS member_id,
          a.nama AS member_name,
          s.nominal AS amount,
          s.created_at
        FROM simpanan s
        JOIN anggota a ON a.id = s.anggota_id
        WHERE s.id NOT LIKE 'DEFAULT-%'
          AND s.status = 'TERVERIFIKASI'::"StatusSimpanan"

        UNION ALL

        SELECT
          'LOAN' AS activity_type,
          CASE p.status
            WHEN 'DISETUJUI' THEN 'Pencairan Pinjaman'
            WHEN 'DITOLAK' THEN 'Pengajuan Pinjaman Ditolak'
            ELSE 'Pengajuan Pinjaman Baru'
          END AS activity_title,
          a.id AS member_id,
          a.nama AS member_name,
          p.nominal AS amount,
          p.created_at
        FROM pinjaman p
        JOIN anggota a ON a.id = p.anggota_id

        UNION ALL

        SELECT
          'MEMBER' AS activity_type,
          'Anggota Baru Terdaftar' AS activity_title,
          a.id AS member_id,
          a.nama AS member_name,
          NULL::numeric AS amount,
          a.created_at::timestamp AS created_at
        FROM anggota a
      ) activities
      ORDER BY created_at DESC
      LIMIT 5
    `,
  ]);
  const netProfit = Math.max(
    0,
    parseNumericAmount(loanInterestRows[0]?.total) - 3_000_000,
  );
  const metrics: AdminDashboardMetrics = {
    netProfit: formatRupiah(netProfit),
    totalMembers: formatNumber(Number(memberRows[0]?.total ?? 0)),
    totalSavings: formatRupiah(Number(savingsRows[0]?.total ?? 0)),
    totalLoans: formatRupiah(Number(loanRows[0]?.total ?? 0)),
  };

  const activities: AdminDashboardActivity[] = activityRows.map((activity) => ({
    title: activity.activity_title,
    subtitle: `${activity.member_name} - ID ${activity.member_id}`,
    time: formatActivityDateTime(activity.created_at),
    amount:
      activity.amount === null
        ? ""
        : `${activity.activity_type === "LOAN" ? "-" : "+"}${formatRupiahShort(parseNumericAmount(activity.amount))}`,
    tone:
      activity.activity_type === "LOAN"
        ? "red"
        : activity.activity_type === "MEMBER"
          ? "neutral"
          : "green",
    iconType:
      activity.activity_type === "LOAN"
        ? "loan"
        : activity.activity_type === "MEMBER"
          ? "member"
          : "savings",
  }));

  return <AdminDashboardView activities={activities} metrics={metrics} />;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatRupiah(value: number) {
  const prefix = value < 0 ? "- Rp " : "Rp ";

  return `${prefix}${formatNumber(Math.abs(value))}`;
}

function parseNumericAmount(
  value: number | string | { toString(): string } | null | undefined,
) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalizedValue = value.toString().replace(",", ".");
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatRupiahShort(value: number) {
  if (value >= 1_000_000) {
    return `Rp ${formatNumber(value / 1_000_000)} Juta`;
  }

  if (value >= 1_000) {
    return `Rp ${formatNumber(value / 1_000)}rb`;
  }

  return formatRupiah(value);
}

function formatActivityDateTime(value: Date) {
  const date = new Date(value);
  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
  const day = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(date);

  return `${time} - ${day}`;
}
