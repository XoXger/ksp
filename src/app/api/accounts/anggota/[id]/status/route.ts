import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAdminActivity } from "@/lib/adminActivity";
import { ensureDefaultSavingsForMember } from "@/lib/defaultSavings";
import { getSessionIdentity } from "@/lib/session";

type AccountStatus = "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentSession = await getPrivilegedCookieSession();

  if (!currentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const nextStatus = parseAccountStatus(body?.status);

  if (!nextStatus) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const currentStatus = await getCurrentMemberStatus(id);

  if (!currentStatus) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canChangeStatus(currentStatus, nextStatus)) {
    return NextResponse.json({ error: "Invalid transition" }, { status: 400 });
  }

  await updateMemberStatus(id, nextStatus);
  if (nextStatus === "AKTIF") {
    await ensureDefaultSavingsForMember(id);
  }

  await recordAdminActivity(
    currentSession,
    getMemberStatusActivityTitle(nextStatus),
    `ID Anggota ${id}`,
  );

  return NextResponse.json({ status: nextStatus });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentSession = await getPrivilegedCookieSession();

  if (!currentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const currentStatus = await getCurrentMemberStatus(id);

  if (!currentStatus) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (currentStatus !== "DITOLAK" && currentStatus !== "NONAKTIF") {
    return NextResponse.json(
      { error: "Only rejected or inactive accounts can be deleted" },
      { status: 400 },
    );
  }

  await prisma.$executeRaw`
    DELETE FROM anggota WHERE id = ${id}
  `;

  await recordAdminActivity(
    currentSession,
    "Menghapus Akun Anggota",
    `ID Anggota ${id}`,
  );

  return NextResponse.json({ deleted: true });
}

async function getPrivilegedCookieSession() {
  const currentSession = await getSessionIdentity();

  if (
    currentSession?.role === "ADMIN" ||
    currentSession?.role === "SUPER_ADMIN"
  ) {
    return currentSession;
  }

  return null;
}

function parseAccountStatus(value: unknown): AccountStatus | null {
  if (
    value === "AKTIF" ||
    value === "NONAKTIF" ||
    value === "MENUNGGU" ||
    value === "DITOLAK"
  ) {
    return value;
  }

  return null;
}

function canChangeStatus(currentStatus: AccountStatus, nextStatus: AccountStatus) {
  if (currentStatus === "AKTIF") {
    return nextStatus === "NONAKTIF";
  }

  if (currentStatus === "MENUNGGU") {
    return nextStatus === "AKTIF" || nextStatus === "DITOLAK";
  }

  if (currentStatus === "NONAKTIF") {
    return nextStatus === "AKTIF";
  }

  return false;
}

async function getCurrentMemberStatus(id: string) {
  const rows = await prisma.$queryRaw<Array<{ status: AccountStatus }>>`
    SELECT status FROM anggota WHERE id = ${id} LIMIT 1
  `;

  return rows[0]?.status ?? null;
}

async function updateMemberStatus(id: string, status: AccountStatus) {
  await prisma.$executeRaw`
    UPDATE anggota SET status = ${status}::"AccountStatus", updated_at = NOW() WHERE id = ${id}
  `;
}

function getMemberStatusActivityTitle(status: AccountStatus) {
  if (status === "AKTIF") {
    return "Mengaktifkan Akun Anggota";
  }

  if (status === "DITOLAK") {
    return "Menolak Akun Anggota";
  }

  if (status === "NONAKTIF") {
    return "Menonaktifkan Akun Anggota";
  }

  return "Memperbarui Status Akun Anggota";
}
