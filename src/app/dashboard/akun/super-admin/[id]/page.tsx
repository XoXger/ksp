import { notFound, redirect } from "next/navigation";
import {
  AdminProfileView,
  type AdminProfileData,
} from "@/components/ui/AdminProfileView";
import { getAdminActivities } from "@/lib/adminActivity";
import { prisma } from "@/lib/prisma";
import {
  getAdminSessionIdentityFromParams,
  getSessionIdentity,
} from "@/lib/session";

type AccountStatus = "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK";

export default async function DashboardSuperAdminDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    adminId?: string;
    sessionId?: string;
    superAdminId?: string;
  }>;
}) {
  const currentSession =
    getAdminSessionIdentityFromParams(await searchParams) ??
    (await getSessionIdentity());

  if (!currentSession) {
    redirect("/login");
  }

  if (currentSession.role !== "SUPER_ADMIN") {
    redirect("/dashboard/akun");
  }

  const { id } = await params;
  const [superAdmin, statusRows, activityRows] = await Promise.all([
    prisma.superAdmin.findUnique({
      where: { id },
      select: {
        createdAt: true,
        email: true,
        id: true,
        jenisKelamin: true,
        nama: true,
        nomorSeluler: true,
      },
    }),
    prisma.$queryRaw<Array<{ status: AccountStatus }>>`
      SELECT status FROM super_admin WHERE id = ${id} LIMIT 1
    `,
    getAdminActivities(id, "SUPER_ADMIN", 5),
  ]);

  if (!superAdmin) {
    notFound();
  }

  const superAdminData: AdminProfileData = {
    email: superAdmin.email,
    id: superAdmin.id,
    jenisKelamin:
      superAdmin.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan",
    nama: superAdmin.nama,
    nomorSeluler: superAdmin.nomorSeluler,
    peran: "Super Admin",
    status: getStatusLabel(statusRows[0]?.status ?? "AKTIF"),
    tanggalBergabung: formatDate(superAdmin.createdAt),
  };
  const activities = activityRows.map((activity) => ({
    detail: activity.detail ?? "",
    id: activity.id,
    time: formatActivityDateTime(activity.created_at),
    title: activity.title,
  }));

  return (
    <AdminProfileView
      activities={activities}
      admin={superAdminData}
      canEditPassword={currentSession.role === "SUPER_ADMIN"}
      mode="detail"
    />
  );
}

function getStatusLabel(status: AccountStatus) {
  return {
    AKTIF: "AKTIF",
    DITOLAK: "DITOLAK",
    MENUNGGU: "MENUNGGU",
    NONAKTIF: "NONAKTIF",
  }[status];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(date);
}

function formatActivityDateTime(value: Date | string) {
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
