"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { uploadPublicFile } from "@/lib/uploadFile";

export async function tambahSimpanan(formData: FormData) {
  const anggotaId =
    String(formData.get("anggotaId") ?? "").trim() ||
    (await cookies()).get("anggotaId")?.value;

  if (!anggotaId) {
    redirect("/login");
  }

  const anggota = await prisma.anggota.findUnique({
    where: { id: anggotaId },
    select: { id: true },
  });

  if (!anggota) {
    redirect("/login");
  }

  const savingsType = String(formData.get("savingsType") ?? "").toLowerCase();
  const amountRaw = String(formData.get("amount") ?? "0").replace(/[^\d]/g, "");
  const transferDateRaw = String(formData.get("transferDate") ?? "").trim();
  const proof = formData.get("proof");

  const nominal = Number(amountRaw);
  const tanggalTransfer = parseInputDate(transferDateRaw);
  const minimumNominal = savingsType === "sukarela" ? 100_000 : 300_000;
  const isMandatorySavings = savingsType !== "sukarela";
  const today = startOfDay(new Date());
  const minimumTransferDate = new Date(today);

  minimumTransferDate.setDate(today.getDate() - 7);

  if (isMandatorySavings && nominal !== 300_000) {
    redirect(`/simpanan/tambah?anggotaId=${encodeURIComponent(anggotaId)}&error=nominal`);
  }

  if (!isMandatorySavings && nominal < minimumNominal) {
    redirect(`/simpanan/tambah?anggotaId=${encodeURIComponent(anggotaId)}&error=nominal`);
  }

  if (isMandatorySavings && (await hasPaidMandatorySavingsThisMonth(anggota.id))) {
    redirect(`/simpanan/tambah?anggotaId=${encodeURIComponent(anggotaId)}&error=wajib-paid`);
  }

  if (
    Number.isNaN(tanggalTransfer.getTime()) ||
    tanggalTransfer < minimumTransferDate ||
    tanggalTransfer > today
  ) {
    redirect(`/simpanan/tambah?anggotaId=${encodeURIComponent(anggotaId)}&error=tanggal`);
  }

  if (
    !(proof instanceof File) ||
    proof.size === 0 ||
    proof.size > 5 * 1024 * 1024 ||
    !["image/png", "image/jpeg"].includes(proof.type)
  ) {
    redirect(`/simpanan/tambah?anggotaId=${encodeURIComponent(anggotaId)}&error=bukti`);
  }

  const jenisSimpanan = savingsType === "sukarela" ? "SUKARELA" : "WAJIB";
  const proofPublicPath = await uploadPublicFile({
    directory: "simpanan",
    file: proof,
  });

  await prisma.$transaction(async (transaction) => {
    const transactionId = await getNextTransactionId(transaction, tanggalTransfer);

    await transaction.$executeRaw`
      INSERT INTO simpanan (
        id,
        anggota_id,
        jenis_simpanan,
        nominal,
        tanggal_transfer,
        bukti_transfer,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${transactionId},
        ${anggota.id},
        ${jenisSimpanan}::"JenisSimpanan",
        ${nominal},
        ${transferDateRaw}::date,
        ${proofPublicPath},
        ${"MENUNGGU"}::"StatusSimpanan",
        NOW(),
        NOW()
      )
    `;
  });

  redirect(`/simpanan/tambah?anggotaId=${encodeURIComponent(anggotaId)}&success=1`);
}

async function hasPaidMandatorySavingsThisMonth(anggotaId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const rows = await prisma.$queryRaw<Array<{ total: number | string }>>`
    SELECT COUNT(*) AS total
    FROM simpanan
    WHERE anggota_id = ${anggotaId}
      AND jenis_simpanan = 'WAJIB'::"JenisSimpanan"
      AND status = 'TERVERIFIKASI'::"StatusSimpanan"
      AND nominal = 300000
      AND tanggal_transfer >= ${monthStart}
      AND tanggal_transfer < ${nextMonthStart}
  `;

  return Number(rows[0]?.total ?? 0) > 0;
}

async function getNextTransactionId(
  transaction: Pick<typeof prisma, "$queryRaw">,
  transactionDate: Date,
) {
  const year = String(transactionDate.getFullYear()).slice(-2);
  const rows = await transaction.$queryRaw<Array<{ id: string | null }>>`
    SELECT id
    FROM simpanan
    WHERE id LIKE ${`TRX${year}%`}
    ORDER BY id DESC
    LIMIT 1
  `;
  const lastSequence = rows[0]?.id ? Number(rows[0].id.slice(5)) : 0;

  return `TRX${year}${String(lastSequence + 1).padStart(4, "0")}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date(Number.NaN);
  }

  return new Date(year, month - 1, day);
}
