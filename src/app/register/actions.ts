"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type GenderValue = "male" | "female";

export async function registerAnggota(formData: FormData) {
  const name = toTitleCase(String(formData.get("name") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const gender = parseGender(formData.get("gender"));
  const agreedToTerms = formData.get("terms") === "on";

  if (!name || !email || !password || !phone || !gender || !agreedToTerms) {
    redirect("/register?status=incomplete");
  }

  if (!isValidName(name)) {
    redirect("/register?status=invalid-name");
  }

  if (!isValidEmail(email)) {
    redirect("/register?status=invalid-email");
  }

  if (!isValidPassword(password)) {
    redirect("/register?status=invalid-password");
  }

  if (!isValidPhone(phone)) {
    redirect("/register?status=invalid-phone");
  }

  const phoneLookupValues = createPhoneLookupValues(phone);
  const [existingEmailRows, existingPhoneRows] = await Promise.all([
    prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM anggota WHERE email = ${email}
      UNION ALL
      SELECT id FROM admin WHERE email = ${email}
      UNION ALL
      SELECT id FROM super_admin WHERE email = ${email}
      LIMIT 1
    `,
    prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM anggota WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
      UNION ALL
      SELECT id FROM admin WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
      UNION ALL
      SELECT id FROM super_admin WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
      LIMIT 1
    `,
  ]);

  if (existingEmailRows[0]) {
    redirect("/register?status=email-exists");
  }

  if (existingPhoneRows[0]) {
    redirect("/register?status=phone-exists");
  }

  const id = await createNextMemberId();
  const jenisKelamin = gender === "male" ? "LAKI_LAKI" : "PEREMPUAN";

  await prisma.$executeRaw`
    INSERT INTO anggota (
      id,
      nama,
      email,
      "kataSandi",
      "nomorSeluler",
      "jenisKelamin",
      status,
      created_at,
      updated_at
    )
    VALUES (
      ${id},
      ${name},
      ${email},
      ${password},
      ${phone},
      ${jenisKelamin}::"JenisKelamin",
      'MENUNGGU'::"AccountStatus",
      NOW(),
      NOW()
    )
  `;

  redirect("/register?status=waiting");
}

async function createNextMemberId() {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `ANG${year}`;
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM anggota
    WHERE id LIKE ${`${prefix}%`}
    ORDER BY id DESC
    LIMIT 1
  `;
  const lastSequence = rows[0]?.id
    ? Number(rows[0].id.slice(prefix.length)) || 0
    : 0;

  return `${prefix}${String(lastSequence + 1).padStart(4, "0")}`;
}

function parseGender(value: FormDataEntryValue | null): GenderValue | null {
  if (value === "male" || value === "female") {
    return value;
  }

  return null;
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
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

function isValidName(value: string) {
  const letterCount = [...value].filter((character) =>
    /\p{L}/u.test(character),
  ).length;

  return letterCount >= 3 && /^[\p{L}\s]+$/u.test(value);
}

function isValidEmail(value: string) {
  const [localPart, domainPart] = value.split("@");
  const localCharactersCount = localPart.length;

  return (
    localCharactersCount >= 6 &&
    Boolean(domainPart) &&
    /^[A-Za-z0-9._%+-]{6,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)
  );
}

function isValidPassword(value: string) {
  return /^[A-Za-z0-9]{8}$/.test(value);
}

function isValidPhone(value: string) {
  return /^\d{10,12}$/.test(value);
}
