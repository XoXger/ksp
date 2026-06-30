import { cookies } from "next/headers";
import { headers } from "next/headers";
import type { AccountRole } from "@/generated/prisma/enums";

export type SessionIdentity = {
  id: string;
  userId: string;
  role: AccountRole;
};

export function parseSessionIdentity(value: unknown): SessionIdentity | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const session = value as Partial<SessionIdentity>;
  const roleIsValid =
    session.role === "ANGGOTA" ||
    session.role === "ADMIN" ||
    session.role === "SUPER_ADMIN";

  if (
    typeof session.id !== "string" ||
    typeof session.userId !== "string" ||
    !roleIsValid
  ) {
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    role: session.role as AccountRole,
  };
}

export async function getSessionIdentity(): Promise<SessionIdentity | null> {
  const headerSession = await getSessionIdentityFromHeaders();

  if (headerSession) {
    return headerSession;
  }

  const cookieStore = await cookies();
  const id = cookieStore.get("sessionId")?.value;
  const role = cookieStore.get("accountRole")?.value;
  const anggotaId = cookieStore.get("anggotaId")?.value;
  const adminId = cookieStore.get("adminId")?.value;
  const superAdminId = cookieStore.get("superAdminId")?.value;
  const memberSessionId = cookieStore.get("memberSessionId")?.value;
  const adminSessionId = cookieStore.get("adminSessionId")?.value;
  const superAdminSessionId = cookieStore.get("superAdminSessionId")?.value;

  if (superAdminId && superAdminSessionId) {
    return { id: superAdminSessionId, userId: superAdminId, role: "SUPER_ADMIN" };
  }

  if (adminId && adminSessionId) {
    return { id: adminSessionId, userId: adminId, role: "ADMIN" };
  }

  if (anggotaId && memberSessionId && role === "ANGGOTA") {
    return { id: memberSessionId, userId: anggotaId, role: "ANGGOTA" };
  }

  if (!id) {
    return null;
  }

  if (role === "SUPER_ADMIN" && superAdminId) {
    return { id, userId: superAdminId, role: "SUPER_ADMIN" };
  }

  if (role === "ADMIN" && adminId) {
    return { id, userId: adminId, role: "ADMIN" };
  }

  if (role === "ANGGOTA" && anggotaId) {
    return { id, userId: anggotaId, role: "ANGGOTA" };
  }

  if (superAdminId) {
    return { id, userId: superAdminId, role: "SUPER_ADMIN" };
  }

  if (adminId) {
    return { id, userId: adminId, role: "ADMIN" };
  }

  if (anggotaId) {
    return { id, userId: anggotaId, role: "ANGGOTA" };
  }

  return null;
}

export function getAdminSessionIdentityFromParams({
  adminId,
  sessionId,
  superAdminId,
}: {
  adminId?: string;
  sessionId?: string;
  superAdminId?: string;
}): SessionIdentity | null {
  if (!sessionId) {
    return null;
  }

  if (superAdminId) {
    return { id: sessionId, userId: superAdminId, role: "SUPER_ADMIN" };
  }

  if (adminId) {
    return { id: sessionId, userId: adminId, role: "ADMIN" };
  }

  return null;
}

async function getSessionIdentityFromHeaders() {
  const headerStore = await headers();
  const sessionId = headerStore.get("x-koperasi-session-id") ?? undefined;
  const adminId = headerStore.get("x-koperasi-admin-id") ?? undefined;
  const superAdminId =
    headerStore.get("x-koperasi-super-admin-id") ?? undefined;

  return getAdminSessionIdentityFromParams({
    adminId,
    sessionId,
    superAdminId,
  });
}
