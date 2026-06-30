import { randomUUID } from "crypto";
import type { AccountRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { SessionIdentity } from "@/lib/session";

export type AdminActivityRecord = {
  created_at: Date | string;
  detail: string | null;
  id: string;
  title: string;
};

export async function recordAdminActivity(
  identity: SessionIdentity | null,
  title: string,
  detail?: string,
) {
  if (identity?.role !== "ADMIN" && identity?.role !== "SUPER_ADMIN") {
    return;
  }

  await ensureAdminActivityTable();

  await prisma.$executeRaw`
    INSERT INTO admin_activity (id, actor_id, actor_role, title, detail, created_at)
    VALUES (
      ${randomUUID()},
      ${identity.userId},
      ${identity.role},
      ${title},
      ${detail ?? null},
      NOW()
    )
  `;
}

export async function getAdminActivities(
  actorId: string,
  actorRole: Extract<AccountRole, "ADMIN" | "SUPER_ADMIN">,
  limit = 5,
) {
  await ensureAdminActivityTable();

  return prisma.$queryRaw<AdminActivityRecord[]>`
    SELECT id, title, detail, created_at
    FROM admin_activity
    WHERE actor_id = ${actorId}
      AND actor_role = ${actorRole}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

async function ensureAdminActivityTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS admin_activity (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS admin_activity_actor_created_idx
    ON admin_activity (actor_id, actor_role, created_at DESC)
  `;
}
