import {
  AdminActivitiesView,
} from "@/components/ui/AdminActivitiesView";
import type { AdminDashboardActivity } from "@/components/ui/AdminDashboardView";
import { prisma } from "@/lib/prisma";
import {
  getAdminSessionIdentityFromParams,
  getSessionIdentity,
} from "@/lib/session";
import { redirect } from "next/navigation";

type ActivityRow = {
  activity_type: "SAVINGS" | "LOAN" | "MEMBER";
  activity_title: string;
  amount: number | string | null;
  created_at: Date;
  member_id: string;
  member_name: string;
};

export default async function DashboardActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    adminId?: string;
    sessionId?: string;
    superAdminId?: string;
  }>;
}) {
  const session =
    getAdminSessionIdentityFromParams(await searchParams) ??
    (await getSessionIdentity());

  if (session?.role !== "ADMIN" && session?.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const activityRows = await prisma.$queryRaw<ActivityRow[]>`
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
    LIMIT 100
  `;
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

  return <AdminActivitiesView activities={activities} />;
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

function formatRupiahShort(value: number) {
  if (value >= 1_000_000) {
    const millionValue = value / 1_000_000;

    return `Rp ${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 1,
    }).format(millionValue)}jt`;
  }

  if (value >= 1_000) {
    return `Rp ${new Intl.NumberFormat("id-ID").format(value / 1_000)}rb`;
  }

  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
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
