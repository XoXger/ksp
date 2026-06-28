import { NextResponse } from "next/server";
import { recordAdminActivity } from "@/lib/adminActivity";
import { prisma } from "@/lib/prisma";
import { getSessionIdentity } from "@/lib/session";

type EditableMemberField = "email" | "name" | "phone" | "password";

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
  const field = parseEditableField(body?.field);
  const value = normalizeValue(field, body?.value);

  if (!field) {
    return NextResponse.json({ error: "Field tidak valid." }, { status: 400 });
  }

  if (!value) {
    return NextResponse.json({ error: "Data tidak boleh kosong." }, { status: 400 });
  }

  const member = await getMember(id);

  if (!member) {
    return NextResponse.json({ error: "Anggota tidak ditemukan." }, { status: 404 });
  }

  const validationError = await validateMemberField(id, field, value);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  await updateMemberField(id, field, value);
  await recordAdminActivity(
    currentSession,
    getActivityTitle(field),
    `ID Anggota ${id}`,
  );

  return NextResponse.json({
    ok: true,
    value: field === "password" ? undefined : value,
  });
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

function parseEditableField(value: unknown): EditableMemberField | null {
  if (
    value === "email" ||
    value === "name" ||
    value === "phone" ||
    value === "password"
  ) {
    return value;
  }

  return null;
}

function normalizeValue(field: EditableMemberField | null, value: unknown) {
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

async function getMember(id: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM anggota WHERE id = ${id} LIMIT 1
  `;

  return rows[0] ?? null;
}

async function validateMemberField(
  memberId: string,
  field: EditableMemberField,
  value: string,
) {
  if (field === "name" && !isValidName(value)) {
    return "Nama hanya boleh berisi huruf dan spasi, maksimal 50 karakter.";
  }

  if (field === "email") {
    if (!isValidEmail(value)) {
      return "Email tidak valid.";
    }

    if (await emailExists(memberId, value)) {
      return "Email sudah digunakan.";
    }
  }

  if (field === "phone") {
    if (!isValidPhone(value)) {
      return "Nomor seluler harus berisi 10 sampai 12 digit angka.";
    }

    if (await phoneExists(memberId, value)) {
      return "Nomor ini sudah digunakan.";
    }
  }

  if (field === "password" && !isValidPassword(value)) {
    return "Kata sandi harus berisi 8 karakter huruf atau angka.";
  }

  return "";
}

async function emailExists(memberId: string, email: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM anggota WHERE email = ${email} AND id <> ${memberId}
    UNION ALL
    SELECT id FROM admin WHERE email = ${email}
    UNION ALL
    SELECT id FROM super_admin WHERE email = ${email}
    LIMIT 1
  `;

  return Boolean(rows[0]);
}

async function phoneExists(memberId: string, phone: string) {
  const phoneLookupValues = createPhoneLookupValues(phone);
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM anggota
    WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
      AND id <> ${memberId}
    UNION ALL
    SELECT id FROM admin
    WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
    UNION ALL
    SELECT id FROM super_admin
    WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
    LIMIT 1
  `;

  return Boolean(rows[0]);
}

async function updateMemberField(
  memberId: string,
  field: EditableMemberField,
  value: string,
) {
  if (field === "email") {
    await prisma.$executeRaw`
      UPDATE anggota SET email = ${value}, updated_at = NOW() WHERE id = ${memberId}
    `;
    return;
  }

  if (field === "phone") {
    await prisma.$executeRaw`
      UPDATE anggota SET "nomorSeluler" = ${value}, updated_at = NOW() WHERE id = ${memberId}
    `;
    return;
  }

  if (field === "name") {
    await prisma.$executeRaw`
      UPDATE anggota SET nama = ${value}, updated_at = NOW() WHERE id = ${memberId}
    `;
    return;
  }

  await prisma.$executeRaw`
    UPDATE anggota SET "kataSandi" = ${value}, updated_at = NOW() WHERE id = ${memberId}
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

function getActivityTitle(field: EditableMemberField) {
  if (field === "name") {
    return "Mengubah Nama Anggota";
  }

  if (field === "email") {
    return "Mengubah Email Anggota";
  }

  if (field === "phone") {
    return "Mengubah Nomor Telepon Anggota";
  }

  return "Mengubah Kata Sandi Anggota";
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
