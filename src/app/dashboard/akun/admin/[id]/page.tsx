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

export default async function DashboardAdminDetailPage({
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
  const [admin, statusRows, activityRows] = await Promise.all([
    prisma.admin.findUnique({
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
      SELECT status FROM admin WHERE id = ${id} LIMIT 1
    `,
    getAdminActivities(id, "ADMIN", 5),
  ]);

  if (!admin) {
    notFound();
  }

  const adminData: AdminProfileData = {
    email: admin.email,
    id: admin.id,
    jenisKelamin:
      admin.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan",
    nama: admin.nama,
    nomorSeluler: admin.nomorSeluler,
    peran: "Admin",
    status: getStatusLabel(statusRows[0]?.status ?? "AKTIF"),
    tanggalBergabung: formatDate(admin.createdAt),
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
      admin={adminData}
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
