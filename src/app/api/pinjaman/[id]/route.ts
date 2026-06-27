import { NextResponse } from "next/server";
import { recordAdminActivity } from "@/lib/adminActivity";
import { prisma } from "@/lib/prisma";
import { getSessionIdentity } from "@/lib/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionIdentity();

  if (session?.role !== "ADMIN" && session?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const rows = await prisma.$queryRaw<
    Array<{ member_name: string; status: "MENUNGGU" | "DISETUJUI" | "DITOLAK" }>
  >`
    SELECT a.nama AS member_name, p.status
    FROM pinjaman p
    JOIN anggota a ON a.id = p.anggota_id
    WHERE p.id = ${id}
    LIMIT 1
  `;
  const loan = rows[0];

  if (!loan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (loan.status !== "DISETUJUI") {
    return NextResponse.json(
      { error: "Only approved loans can be deleted" },
      { status: 400 },
    );
  }

  await prisma.$executeRaw`
    DELETE FROM pinjaman
    WHERE id = ${id}
      AND status = 'DISETUJUI'::"StatusPinjaman"
  `;

  await recordAdminActivity(
    session,
    "Menghapus Pinjaman",
    `ID Pinjaman ${id} - ${loan.member_name}`,
  );

  return NextResponse.json({ status: "deleted" });
}
