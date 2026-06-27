import { NextResponse } from "next/server";
import { recordAdminActivity } from "@/lib/adminActivity";
import { prisma } from "@/lib/prisma";
import { getSessionIdentity } from "@/lib/session";

type PaymentStatus = "TERVERIFIKASI" | "DITOLAK";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionIdentity();

  if (session?.role !== "ADMIN" && session?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = parsePaymentStatus(body?.status);

  if (!status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const rows = await prisma.$queryRaw<{ status: string }[]>`
    SELECT status
    FROM pembayaran_pinjaman
    WHERE id = ${id}
    LIMIT 1
  `;
  const payment = rows[0];

  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (payment.status !== "MENUNGGU") {
    return NextResponse.json(
      { error: "Payment already processed" },
      { status: 409 },
    );
  }

  await prisma.$executeRaw`
    UPDATE pembayaran_pinjaman
    SET status = ${status}::"StatusPembayaranPinjaman",
        updated_at = NOW()
    WHERE id = ${id}
  `;

  await recordAdminActivity(
    session,
    status === "TERVERIFIKASI"
      ? "Menyetujui Pembayaran Pinjaman"
      : "Menolak Pembayaran Pinjaman",
    `ID Pembayaran ${id}`,
  );

  return NextResponse.json({ status });
}

function parsePaymentStatus(value: unknown): PaymentStatus | null {
  if (value === "TERVERIFIKASI" || value === "DITOLAK") {
    return value;
  }

  return null;
}
