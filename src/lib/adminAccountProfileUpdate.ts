import { NextResponse } from "next/server";
import type { AccountRole } from "@/generated/prisma/enums";
import { recordAdminActivity } from "@/lib/adminActivity";
import { prisma } from "@/lib/prisma";
import { getSessionIdentity } from "@/lib/session";

type EditableAdminField = "email" | "name" | "password" | "phone";
type EditableAdminRole = Extract<AccountRole, "ADMIN" | "SUPER_ADMIN">;

export async function updateAdminAccountProfile(
  request: Request,
  accountRole: EditableAdminRole,
  accountId: string,
) {
  const currentSession = await getSessionIdentity();

  if (currentSession?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const field = parseEditableField(body?.field);
  const value = normalizeValue(field, body?.value);

  if (!field) {
    return NextResponse.json({ error: "Field tidak valid." }, { status: 400 });
  }

  if (!value) {
    return NextResponse.json({ error: "Data tidak boleh kosong." }, { status: 400 });
  }

  const accountExists = await getAdminAccountExists(accountRole, accountId);

  if (!accountExists) {
    return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
  }

  const validationError = await validateAdminField(
    accountRole,
    accountId,
    field,
    value,
  );

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  await updateAdminField(accountRole, accountId, field, value);
  await recordAdminActivity(
    currentSession,
    getActivityTitle(accountRole, field),
    `ID Akun ${accountId}`,
  );

  return NextResponse.json({
    ok: true,
    value: field === "password" ? undefined : value,
  });
}

function parseEditableField(value: unknown): EditableAdminField | null {
  if (
    value === "email" ||
    value === "name" ||
    value === "password" ||
    value === "phone"
  ) {
    return value;
  }

  return null;
}

function normalizeValue(field: EditableAdminField | null, value: unknown) {
  const rawValue = String(value ?? "").trim();

  if (field === "email") {
    return rawValue.toLowerCase();
  }

  if (field === "phone") {
    return rawValue.replace(/\D/g, "");
  }

  if (field === "name") {
    return toTitleCase(rawValue.replace(/[^\p{L}\s]/gu, ""));
  }

  return rawValue;
}

async function getAdminAccountExists(
  accountRole: EditableAdminRole,
  accountId: string,
) {
  if (accountRole === "ADMIN") {
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM admin WHERE id = ${accountId} LIMIT 1
    `;

    return Boolean(rows[0]);
  }

  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM super_admin WHERE id = ${accountId} LIMIT 1
  `;

  return Boolean(rows[0]);
}

async function validateAdminField(
  accountRole: EditableAdminRole,
  accountId: string,
  field: EditableAdminField,
  value: string,
) {
  if (field === "name" && !isValidName(value)) {
    return "Nama hanya boleh berisi huruf dan spasi, maksimal 50 karakter.";
  }

  if (field === "email") {
    if (!isValidEmail(value)) {
      return "Email tidak valid.";
    }

    if (await emailExists(accountRole, accountId, value)) {
      return "Email sudah digunakan.";
    }
  }

  if (field === "phone") {
    if (!isValidPhone(value)) {
      return "Nomor seluler harus berisi 10 sampai 12 digit angka.";
    }

    if (await phoneExists(accountRole, accountId, value)) {
      return "Nomor ini sudah digunakan.";
    }
  }

  if (field === "password" && !isValidPassword(value)) {
    return "Kata sandi harus berisi 8 karakter huruf atau angka.";
  }

  return "";
}

async function emailExists(
  accountRole: EditableAdminRole,
  accountId: string,
  email: string,
) {
  const rows =
    accountRole === "ADMIN"
      ? await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM anggota WHERE email = ${email}
          UNION ALL
          SELECT id FROM admin WHERE email = ${email} AND id <> ${accountId}
          UNION ALL
          SELECT id FROM super_admin WHERE email = ${email}
          LIMIT 1
        `
      : await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM anggota WHERE email = ${email}
          UNION ALL
          SELECT id FROM admin WHERE email = ${email}
          UNION ALL
          SELECT id FROM super_admin WHERE email = ${email} AND id <> ${accountId}
          LIMIT 1
        `;

  return Boolean(rows[0]);
}

async function phoneExists(
  accountRole: EditableAdminRole,
  accountId: string,
  phone: string,
) {
  const phoneLookupValues = createPhoneLookupValues(phone);
  const rows =
    accountRole === "ADMIN"
      ? await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM anggota
          WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
          UNION ALL
          SELECT id FROM admin
          WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
            AND id <> ${accountId}
          UNION ALL
          SELECT id FROM super_admin
          WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
          LIMIT 1
        `
      : await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM anggota
          WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
          UNION ALL
          SELECT id FROM admin
          WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
          UNION ALL
          SELECT id FROM super_admin
          WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
            AND id <> ${accountId}
          LIMIT 1
        `;

  return Boolean(rows[0]);
}

async function updateAdminField(
  accountRole: EditableAdminRole,
  accountId: string,
  field: EditableAdminField,
  value: string,
) {
  if (accountRole === "ADMIN") {
    await updateAdminTableField(accountId, field, value);
    return;
  }

  await updateSuperAdminTableField(accountId, field, value);
}

async function updateAdminTableField(
  accountId: string,
  field: EditableAdminField,
  value: string,
) {
  if (field === "name") {
    await prisma.$executeRaw`
      UPDATE admin SET nama = ${value}, updated_at = NOW() WHERE id = ${accountId}
    `;
    return;
  }

  if (field === "email") {
    await prisma.$executeRaw`
      UPDATE admin SET email = ${value}, updated_at = NOW() WHERE id = ${accountId}
    `;
    return;
  }

  if (field === "phone") {
    await prisma.$executeRaw`
      UPDATE admin SET "nomorSeluler" = ${value}, updated_at = NOW() WHERE id = ${accountId}
    `;
    return;
  }

  await prisma.$executeRaw`
    UPDATE admin SET "kataSandi" = ${value}, updated_at = NOW() WHERE id = ${accountId}
  `;
}

async function updateSuperAdminTableField(
  accountId: string,
  field: EditableAdminField,
  value: string,
) {
  if (field === "name") {
    await prisma.$executeRaw`
      UPDATE super_admin SET nama = ${value}, updated_at = NOW() WHERE id = ${accountId}
    `;
    return;
  }

  if (field === "email") {
    await prisma.$executeRaw`
      UPDATE super_admin SET email = ${value}, updated_at = NOW() WHERE id = ${accountId}
    `;
    return;
  }

  if (field === "phone") {
    await prisma.$executeRaw`
      UPDATE super_admin SET "nomorSeluler" = ${value}, updated_at = NOW() WHERE id = ${accountId}
    `;
    return;
  }

  await prisma.$executeRaw`
    UPDATE super_admin SET "kataSandi" = ${value}, updated_at = NOW() WHERE id = ${accountId}
  `;
}

function createPhoneLookupValues(value: string) {
  const digits = value.replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("62")
    ? digits.slice(2)
    : digits;
  const withoutLeadingZero = withoutCountryCode.startsWith("0")
    ? withoutCountryCode.slice(1)
    : withoutCountryCode;

  return Array.from(
    new Set([
      digits,
      withoutCountryCode,
      withoutLeadingZero,
      withoutLeadingZero ? `0${withoutLeadingZero}` : "",
      withoutLeadingZero ? `62${withoutLeadingZero}` : "",
    ].filter(Boolean)),
  );
}

function getActivityTitle(
  accountRole: EditableAdminRole,
  field: EditableAdminField,
) {
  const target = accountRole === "ADMIN" ? "Admin" : "Super Admin";

  if (field === "name") {
    return `Mengubah Nama ${target}`;
  }

  if (field === "email") {
    return `Mengubah Email ${target}`;
  }

  if (field === "phone") {
    return `Mengubah Nomor Telepon ${target}`;
  }

  return `Mengubah Kata Sandi ${target}`;
}

function isValidEmail(value: string) {
  return /^[A-Za-z0-9._%+-]{6,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}

function isValidName(value: string) {
  return (
    value.length > 0 &&
    value.length <= 50 &&
    /^[\p{L}\s]+$/u.test(value) &&
    [...value].filter((character) => /\p{L}/u.test(character)).length >= 3
  );
}

function isValidPassword(value: string) {
  return /^[A-Za-z0-9]{8}$/.test(value);
}

function isValidPhone(value: string) {
  return /^\d{10,12}$/.test(value);
}

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
