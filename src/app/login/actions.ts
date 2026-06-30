"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isAccountLoginActive, startActiveLogin } from "@/lib/activeLogin";

const SESSION_MAX_AGE = 60 * 60 * 24;

export async function loginAnggota(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const anggota = await prisma.anggota.findFirst({
    where: { email },
    select: { id: true, kataSandi: true },
  });

  if (anggota && anggota.kataSandi !== password) {
    redirect("/login?error=invalid");
  }

  const anggotaStatus = anggota
    ? await getAccountStatus("anggota", anggota.id)
    : null;

  if (anggota && anggotaStatus === "AKTIF") {
    if (await isAccountLoginActive("anggota", anggota.id)) {
      redirect("/login?error=already-login");
    }

    const cookieStore = await cookies();
    const sessionId = crypto.randomUUID();
    cookieStore.set("accountRole", "ANGGOTA", {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("anggotaId", anggota.id, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("sessionId", sessionId, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("memberSessionId", sessionId, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    await startActiveLogin("anggota", anggota.id, sessionId);
    redirect(
      `/anggota?sessionId=${encodeURIComponent(sessionId)}&anggotaId=${encodeURIComponent(anggota.id)}`,
    );
  }

  if (anggota && anggotaStatus === "DITOLAK") {
    redirect("/login?error=rejected");
  }

  if (anggota) {
    redirect("/login?error=inactive");
  }

  const admin = await prisma.admin.findFirst({
    where: { email },
    select: { id: true, kataSandi: true },
  });

  if (admin && admin.kataSandi !== password) {
    redirect("/login?error=invalid");
  }

  const adminStatus = admin ? await getAccountStatus("admin", admin.id) : null;

  if (admin && adminStatus === "AKTIF") {
    if (await isAccountLoginActive("admin", admin.id)) {
      redirect("/login?error=already-login");
    }

    const cookieStore = await cookies();
    const sessionId = crypto.randomUUID();
    cookieStore.set("accountRole", "ADMIN", {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("adminId", admin.id, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("sessionId", sessionId, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("adminSessionId", sessionId, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    await startActiveLogin("admin", admin.id, sessionId);
    redirect(
      `/dashboard?sessionId=${encodeURIComponent(sessionId)}&adminId=${encodeURIComponent(admin.id)}`,
    );
  }

  if (admin) {
    redirect("/login?error=inactive");
  }

  const superAdmin = await prisma.superAdmin.findFirst({
    where: { email },
    select: { id: true, kataSandi: true },
  });

  if (superAdmin && superAdmin.kataSandi !== password) {
    redirect("/login?error=invalid");
  }

  const superAdminStatus = superAdmin
    ? await getAccountStatus("super_admin", superAdmin.id)
    : null;

  if (superAdmin && superAdminStatus === "AKTIF") {
    if (await isAccountLoginActive("super_admin", superAdmin.id)) {
      redirect("/login?error=already-login");
    }

    const cookieStore = await cookies();
    const sessionId = crypto.randomUUID();
    cookieStore.set("accountRole", "SUPER_ADMIN", {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("superAdminId", superAdmin.id, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("sessionId", sessionId, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("superAdminSessionId", sessionId, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    await startActiveLogin("super_admin", superAdmin.id, sessionId);
    redirect(
      `/dashboard?sessionId=${encodeURIComponent(sessionId)}&superAdminId=${encodeURIComponent(superAdmin.id)}`,
    );
  }

  if (superAdmin) {
    redirect("/login?error=inactive");
  }

  redirect("/login?error=invalid");
}

async function getAccountStatus(
  tableName: "anggota" | "admin" | "super_admin",
  id: string,
) {
  if (tableName === "anggota") {
    const rows = await prisma.$queryRaw<Array<{ status: "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK" }>>`
      SELECT status FROM anggota WHERE id = ${id} LIMIT 1
    `;
    return rows[0]?.status ?? "AKTIF";
  }

  if (tableName === "admin") {
    const rows = await prisma.$queryRaw<Array<{ status: "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK" }>>`
      SELECT status FROM admin WHERE id = ${id} LIMIT 1
    `;
    return rows[0]?.status ?? "AKTIF";
  }

  const rows = await prisma.$queryRaw<Array<{ status: "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK" }>>`
    SELECT status FROM super_admin WHERE id = ${id} LIMIT 1
  `;
  return rows[0]?.status ?? "AKTIF";
}
