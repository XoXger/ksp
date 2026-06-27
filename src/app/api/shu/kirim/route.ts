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

  const transactionDate = new Date();

  await prisma.$transaction(async (transaction) => {
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
  });

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
