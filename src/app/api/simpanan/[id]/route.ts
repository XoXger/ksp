import { prisma } from "@/lib/prisma";
import { recordAdminActivity } from "@/lib/adminActivity";
import { getSessionIdentity } from "@/lib/session";
import { NextResponse } from "next/server";

type SavingsStatus = "TERVERIFIKASI" | "DITOLAK";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionIdentity();

  if (session?.role !== "ADMIN" && session?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    status?: SavingsStatus;
  } | null;
  const status = body?.status;

  if (status !== "TERVERIFIKASI" && status !== "DITOLAK") {
    return NextResponse.json(
      { message: "Status simpanan tidak valid." },
      { status: 400 },
    );
  }

  const { count: updatedCount } = await prisma.simpanan.updateMany({
    data: { status },
    where: { id },
  });

  if (updatedCount === 0) {
    return NextResponse.json(
      { message: "Riwayat simpanan tidak ditemukan." },
      { status: 404 },
    );
  }

  await recordAdminActivity(
    session,
    status === "TERVERIFIKASI" ? "Menyetujui Simpanan" : "Menolak Simpanan",
    `ID Transaksi ${id}`,
  );

  return NextResponse.json({ status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionIdentity();

  if (session?.role !== "ADMIN" && session?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });
  }

  const { id } = await params;
  const deletedCount = await prisma.$executeRaw`
    DELETE FROM simpanan
    WHERE id = ${id}
      AND status IN ('TERVERIFIKASI'::"StatusSimpanan", 'DITOLAK'::"StatusSimpanan")
  `;

  if (deletedCount === 0) {
    return NextResponse.json(
      { message: "Riwayat simpanan tidak ditemukan atau belum diputuskan admin." },
      { status: 404 },
    );
  }

  await recordAdminActivity(session, "Menghapus Riwayat Simpanan", `ID Transaksi ${id}`);

  return NextResponse.json({ deleted: true });
}
