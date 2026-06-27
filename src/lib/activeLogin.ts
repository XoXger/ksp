import type { AccountRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { SessionIdentity } from "@/lib/session";

const ACTIVE_LOGIN_TIMEOUT_MS = 15_000;

type AccountTable = "anggota" | "admin" | "super_admin";

export async function isAccountLoginActive(
  tableName: AccountTable,
  userId: string,
) {
  const rows = await getActiveLoginRows(tableName, userId);
  const activeSessionId = rows[0]?.active_session_id;
  const activeSessionSeenAt = rows[0]?.active_session_seen_at;

  if (!activeSessionId || !activeSessionSeenAt) {
    return false;
  }

  const isActive =
    activeSessionSeenAt.getTime() > Date.now() - ACTIVE_LOGIN_TIMEOUT_MS;

  if (!isActive) {
    await clearExpiredActiveLogin(tableName, userId);
  }

  return isActive;
}

export async function startActiveLogin(
  tableName: AccountTable,
  userId: string,
  sessionId: string,
) {
  if (tableName === "anggota") {
    await prisma.$executeRaw`
      UPDATE anggota
      SET active_session_id = ${sessionId}, active_session_seen_at = NOW()
      WHERE id = ${userId}
    `;
    return;
  }

  if (tableName === "admin") {
    await prisma.$executeRaw`
      UPDATE admin
      SET active_session_id = ${sessionId}, active_session_seen_at = NOW()
      WHERE id = ${userId}
    `;
    return;
  }

  await prisma.$executeRaw`
    UPDATE super_admin
    SET active_session_id = ${sessionId}, active_session_seen_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function touchActiveLogin(identity: SessionIdentity) {
  const tableName = getTableFromRole(identity.role);

  if (tableName === "anggota") {
    await prisma.$executeRaw`
      UPDATE anggota
      SET active_session_id = ${identity.id}, active_session_seen_at = NOW()
      WHERE id = ${identity.userId}
        AND (active_session_id = ${identity.id} OR active_session_id IS NULL)
    `;
    return;
  }

  if (tableName === "admin") {
    await prisma.$executeRaw`
      UPDATE admin
      SET active_session_id = ${identity.id}, active_session_seen_at = NOW()
      WHERE id = ${identity.userId}
        AND (active_session_id = ${identity.id} OR active_session_id IS NULL)
    `;
    return;
  }

  await prisma.$executeRaw`
    UPDATE super_admin
    SET active_session_id = ${identity.id}, active_session_seen_at = NOW()
    WHERE id = ${identity.userId}
      AND (active_session_id = ${identity.id} OR active_session_id IS NULL)
  `;
}

export async function releaseActiveLogin(identity: SessionIdentity) {
  const tableName = getTableFromRole(identity.role);

  if (tableName === "anggota") {
    await prisma.$executeRaw`
      UPDATE anggota
      SET active_session_id = NULL, active_session_seen_at = NULL
      WHERE id = ${identity.userId} AND active_session_id = ${identity.id}
    `;
    return;
  }

  if (tableName === "admin") {
    await prisma.$executeRaw`
      UPDATE admin
      SET active_session_id = NULL, active_session_seen_at = NULL
      WHERE id = ${identity.userId} AND active_session_id = ${identity.id}
    `;
    return;
  }

  await prisma.$executeRaw`
    UPDATE super_admin
    SET active_session_id = NULL, active_session_seen_at = NULL
    WHERE id = ${identity.userId} AND active_session_id = ${identity.id}
  `;
}

export async function clearActiveLogin(identity: SessionIdentity) {
  const tableName = getTableFromRole(identity.role);

  if (tableName === "anggota") {
    await prisma.$executeRaw`
      UPDATE anggota
      SET active_session_id = NULL, active_session_seen_at = NULL
      WHERE id = ${identity.userId}
    `;
    return;
  }

  if (tableName === "admin") {
    await prisma.$executeRaw`
      UPDATE admin
      SET active_session_id = NULL, active_session_seen_at = NULL
      WHERE id = ${identity.userId}
    `;
    return;
  }

  await prisma.$executeRaw`
    UPDATE super_admin
    SET active_session_id = NULL, active_session_seen_at = NULL
    WHERE id = ${identity.userId}
  `;
}

export function getTableFromRole(role: AccountRole): AccountTable {
  if (role === "ANGGOTA") {
    return "anggota";
  }

  if (role === "ADMIN") {
    return "admin";
  }

  return "super_admin";
}

async function getActiveLoginRows(tableName: AccountTable, userId: string) {
  if (tableName === "anggota") {
    return prisma.$queryRaw<
      Array<{ active_session_id: string | null; active_session_seen_at: Date | null }>
    >`
      SELECT active_session_id, active_session_seen_at
      FROM anggota
      WHERE id = ${userId}
      LIMIT 1
    `;
  }

  if (tableName === "admin") {
    return prisma.$queryRaw<
      Array<{ active_session_id: string | null; active_session_seen_at: Date | null }>
    >`
      SELECT active_session_id, active_session_seen_at
      FROM admin
      WHERE id = ${userId}
      LIMIT 1
    `;
  }

  return prisma.$queryRaw<
    Array<{ active_session_id: string | null; active_session_seen_at: Date | null }>
  >`
    SELECT active_session_id, active_session_seen_at
    FROM super_admin
    WHERE id = ${userId}
    LIMIT 1
  `;
}

async function clearExpiredActiveLogin(tableName: AccountTable, userId: string) {
  if (tableName === "anggota") {
    await prisma.$executeRaw`
      UPDATE anggota
      SET active_session_id = NULL, active_session_seen_at = NULL
      WHERE id = ${userId}
        AND active_session_seen_at <= NOW() - INTERVAL '15 seconds'
    `;
    return;
  }

  if (tableName === "admin") {
    await prisma.$executeRaw`
      UPDATE admin
      SET active_session_id = NULL, active_session_seen_at = NULL
      WHERE id = ${userId}
        AND active_session_seen_at <= NOW() - INTERVAL '15 seconds'
    `;
    return;
  }

  await prisma.$executeRaw`
    UPDATE super_admin
    SET active_session_id = NULL, active_session_seen_at = NULL
    WHERE id = ${userId}
      AND active_session_seen_at <= NOW() - INTERVAL '15 seconds'
  `;
}
