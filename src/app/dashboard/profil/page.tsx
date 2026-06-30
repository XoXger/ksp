import {
  AdminProfileView,
  type AdminProfileData,
} from "@/components/ui/AdminProfileView";
import { prisma } from "@/lib/prisma";
import {
  getAdminSessionIdentityFromParams,
  getSessionIdentity,
} from "@/lib/session";
import { getAdminActivities } from "@/lib/adminActivity";
import { redirect } from "next/navigation";

type AdminProfileRecord = {
  created_at: Date | string;
  email: string;
  id: string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  nama: string;
  nomorSeluler: string;
  status: string;
};

export default async function AdminProfilePage({
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

  const rows =
    session.role === "SUPER_ADMIN"
      ? await prisma.$queryRaw<AdminProfileRecord[]>`
          SELECT id, nama, email, "nomorSeluler", "jenisKelamin", status, created_at
          FROM super_admin
          WHERE id = ${session.userId}
          LIMIT 1
        `
      : await prisma.$queryRaw<AdminProfileRecord[]>`
          SELECT id, nama, email, "nomorSeluler", "jenisKelamin", status, created_at
          FROM admin
          WHERE id = ${session.userId}
          LIMIT 1
        `;

  const admin = rows[0];

  if (!admin) {
    redirect("/login");
  }

  const profile: AdminProfileData = {
    email: admin.email,
    id: admin.id,
    jenisKelamin: formatGender(admin.jenisKelamin),
    nama: admin.nama,
    nomorSeluler: admin.nomorSeluler,
    peran: session.role === "SUPER_ADMIN" ? "Super Admin" : "Admin",
    status: formatStatus(admin.status),
    tanggalBergabung: formatDate(admin.created_at),
  };
  const activityRows = await getAdminActivities(session.userId, session.role, 5);
  const activities = activityRows.map((activity) => ({
    detail: activity.detail ?? "",
    id: activity.id,
    time: formatActivityDateTime(activity.created_at),
    title: activity.title,
  }));

  return <AdminProfileView activities={activities} admin={profile} />;
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatGender(value: AdminProfileRecord["jenisKelamin"]) {
  return value === "PEREMPUAN" ? "Perempuan" : "Laki-laki";
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
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
