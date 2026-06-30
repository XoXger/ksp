import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAdminActivity } from "@/lib/adminActivity";
import { getSessionIdentity } from "@/lib/session";

type SendShuPayload = {
  amount?: unknown;
  memberId?: unknown;
};

export async function POST(request: Request) {
  const identity = await getSessionIdentity();

  if (identity?.role !== "ADMIN" && identity?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Tidak diizinkan." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as SendShuPayload | null;
  const memberId = typeof payload?.memberId === "string" ? payload.memberId : "";
  const amount = Number(payload?.amount ?? 0);

  if (!memberId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { message: "Data pengiriman SHU tidak valid." },
      { status: 400 },
    );
  }

  const member = await prisma.anggota.findFirst({
    where: {
      id: memberId,
      status: "AKTIF",
    },
    select: {
      id: true,
    },
  });

  if (!member) {
    return NextResponse.json(
      { message: "Anggota aktif tidak ditemukan." },
      { status: 404 },
    );
  }

  const existingDistributionRows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM simpanan
    WHERE anggota_id = ${member.id}
      AND jenis_simpanan = ${"SUKARELA"}::"JenisSimpanan"
      AND bukti_transfer = 'Distribusi SHU'
    LIMIT 1
  `;

  if (existingDistributionRows[0]) {
    return NextResponse.json(
      { message: "SHU anggota ini sudah pernah dikirim." },
      { status: 409 },
    );
  }

  const transactionDate = new Date();

  const sendResult = await prisma.$transaction(async (transaction) => {
    const distributionRows = await transaction.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM simpanan
      WHERE anggota_id = ${member.id}
        AND jenis_simpanan = ${"SUKARELA"}::"JenisSimpanan"
        AND bukti_transfer = 'Distribusi SHU'
      LIMIT 1
    `;

    if (distributionRows[0]) {
      throw new Error("SHU_ALREADY_SENT");
    }

    const transactionId = await getNextTransactionId(
      transaction,
      transactionDate,
    );

    await transaction.$executeRaw`
      INSERT INTO simpanan (
        id,
        anggota_id,
        jenis_simpanan,
        nominal,
        tanggal_transfer,
        bukti_transfer,
        created_at,
        updated_at
      )
      VALUES (
        ${transactionId},
        ${member.id},
        ${"SUKARELA"}::"JenisSimpanan",
        ${amount},
        ${transactionDate},
        ${"Distribusi SHU"},
        NOW(),
        NOW()
      )
    `;
  }).catch((error) => {
    if (error instanceof Error && error.message === "SHU_ALREADY_SENT") {
      return "SHU_ALREADY_SENT" as const;
    }

    throw error;
  });

  if (sendResult === "SHU_ALREADY_SENT") {
    return NextResponse.json(
      { message: "SHU anggota ini sudah pernah dikirim." },
      { status: 409 },
    );
  }

  await recordAdminActivity(
    identity,
    "Mengirim SHU Anggota",
    `ID Anggota ${member.id}`,
  );

  return NextResponse.json({ success: true });
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
