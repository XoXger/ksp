import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type EditableMemberField = "email" | "password" | "phone";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as {
    field?: EditableMemberField;
    value?: string;
  } | null;
  const field = payload?.field;
  const value = String(payload?.value ?? "").trim();

  if (!field || !value) {
    return NextResponse.json(
      { message: "Data perubahan tidak valid." },
      { status: 400 },
    );
  }

  if (field === "email") {
    const email = value.toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Email tidak valid." },
        { status: 400 },
      );
    }

    const existingRows = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM anggota WHERE email = ${email} AND id <> ${id}
      UNION ALL
      SELECT id FROM admin WHERE email = ${email}
      UNION ALL
      SELECT id FROM super_admin WHERE email = ${email}
      LIMIT 1
    `;

    if (existingRows[0]) {
      return NextResponse.json(
        { message: "Email sudah digunakan." },
        { status: 409 },
      );
    }

    await prisma.anggota.update({
      data: { email },
      where: { id },
    });

    return NextResponse.json({ value: email });
  }

  if (field === "phone") {
    const phone = value.replace(/\D/g, "");

    if (!/^\d{10,12}$/.test(phone)) {
      return NextResponse.json(
        {
          message:
            "Nomor telepon harus berisi 10 sampai 12 digit angka tanpa simbol atau huruf.",
        },
        { status: 400 },
      );
    }

    const phoneLookupValues = createPhoneLookupValues(phone);
    const existingRows = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM anggota
      WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
        AND id <> ${id}
      UNION ALL
      SELECT id FROM admin
      WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
      UNION ALL
      SELECT id FROM super_admin
      WHERE regexp_replace("nomorSeluler", '[^0-9]', '', 'g') = ANY(${phoneLookupValues})
      LIMIT 1
    `;

    if (existingRows[0]) {
      return NextResponse.json(
        { message: "Nomor ini sudah digunakan." },
        { status: 409 },
      );
    }

    await prisma.anggota.update({
      data: { nomorSeluler: phone },
      where: { id },
    });

    return NextResponse.json({ value: phone });
  }

  if (!/^[A-Za-z0-9]{8}$/.test(value)) {
    return NextResponse.json(
      { message: "Kata sandi harus berisi 8 karakter huruf atau angka." },
      { status: 400 },
    );
  }

  await prisma.anggota.update({
    data: { kataSandi: value },
    where: { id },
  });

  return NextResponse.json({ value: "********" });
}

function isValidEmail(value: string) {
  return /^[A-Za-z0-9._%+-]{6,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
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
