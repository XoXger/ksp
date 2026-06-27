import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAdminActivity } from "@/lib/adminActivity";
import { getSessionIdentity } from "@/lib/session";

type LoanStatus = "DISETUJUI" | "DITOLAK";

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
  const status = parseLoanStatus(body?.status);

  if (!status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await prisma.$executeRaw`
    UPDATE pinjaman
    SET status = ${status}::"StatusPinjaman",
        updated_at = NOW()
    WHERE id = ${id}
  `;

  await recordAdminActivity(
    session,
    status === "DISETUJUI" ? "Menyetujui Pinjaman" : "Menolak Pinjaman",
    `ID Pinjaman ${id}`,
  );

  return NextResponse.json({ status });
}

function parseLoanStatus(value: unknown): LoanStatus | null {
  if (value === "DISETUJUI" || value === "DITOLAK") {
    return value;
  }

  return null;
}
