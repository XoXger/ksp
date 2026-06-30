import { AdminAccountsView } from "@/components/ui/AdminAccountsView";
import { prisma } from "@/lib/prisma";
import {
  getAdminSessionIdentityFromParams,
  getSessionIdentity,
} from "@/lib/session";

export default async function DashboardAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{
    adminId?: string;
    sessionId?: string;
    superAdminId?: string;
  }>;
}) {
  const currentSession =
    getAdminSessionIdentityFromParams(await searchParams) ??
    (await getSessionIdentity());

  const [
    anggotas,
    admins,
    superAdmins,
    anggotaStatuses,
    adminStatuses,
    superAdminStatuses,
  ] = await Promise.all([
    prisma.anggota.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nama: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.admin.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nama: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.superAdmin.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nama: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.$queryRaw<Array<{ id: string; status: "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK" }>>`
      SELECT id, status FROM anggota
    `,
    prisma.$queryRaw<Array<{ id: string; status: "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK" }>>`
      SELECT id, status FROM admin
    `,
    prisma.$queryRaw<Array<{ id: string; status: "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK" }>>`
      SELECT id, status FROM super_admin
    `,
  ]);

  const anggotaStatusMap = new Map(
    anggotaStatuses.map((account) => [account.id, account.status]),
  );
  const adminStatusMap = new Map(
    adminStatuses.map((account) => [account.id, account.status]),
  );
  const superAdminStatusMap = new Map(
    superAdminStatuses.map((account) => [account.id, account.status]),
  );

  const accountRows = [
    ...anggotas.map((account) => ({
      ...account,
      role: "ANGGOTA" as const,
      status: anggotaStatusMap.get(account.id) ?? "AKTIF",
      isActive: false,
    })),
    ...admins.map((account) => ({
      ...account,
      role: "ADMIN" as const,
      status: adminStatusMap.get(account.id) ?? "AKTIF",
      isActive: false,
    })),
    ...superAdmins.map((account) => ({
      ...account,
      role: "SUPER ADMIN" as const,
      status: superAdminStatusMap.get(account.id) ?? "AKTIF",
      isActive: false,
    })),
  ].sort((first, second) => first.createdAt.getTime() - second.createdAt.getTime());

  const currentRole = getViewRole(currentSession?.role ?? null);

  const currentViewerSession = currentSession
    ? {
        id: currentSession.id,
        role: currentRole,
        userId: currentSession.userId,
      }
    : null;

  return (
    <AdminAccountsView
      accounts={accountRows}
      currentSession={currentViewerSession}
    />
  );
}

function getViewRole(role: "ANGGOTA" | "ADMIN" | "SUPER_ADMIN" | null) {
  if (role === "SUPER_ADMIN") {
    return "SUPER ADMIN" as const;
  }

  if (role === "ADMIN" || role === "ANGGOTA") {
    return role;
  }

  return null;
}
