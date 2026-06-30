import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MemberAddSavingsView } from "@/components/ui/MemberAddSavingsView";
import { tambahSimpanan } from "@/app/simpanan/tambah/actions";
import { prisma } from "@/lib/prisma";
import { getMemberIdFromSessionParam } from "@/lib/memberSession";

export default async function MemberAddSavingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; anggotaId?: string }>;
}) {
  const params = await searchParams;
  const status =
    params.success === "1" ? "success" : params.error ? "error" : undefined;

  const anggotaId =
    (await getMemberIdFromSessionParam(undefined, params.anggotaId)) ??
    (await cookies()).get("anggotaId")?.value;

  if (!anggotaId) {
    redirect("/login");
  }

  const anggota = await prisma.anggota.findUnique({
    where: { id: anggotaId },
    select: { nama: true },
  });

  if (!anggota) {
    redirect("/login");
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const paidMandatoryRows = await prisma.$queryRaw<Array<{ total: number | string }>>`
    SELECT COUNT(*) AS total
    FROM simpanan
    WHERE anggota_id = ${anggotaId}
      AND jenis_simpanan = 'WAJIB'::"JenisSimpanan"
      AND status = 'TERVERIFIKASI'::"StatusSimpanan"
      AND nominal = 300000
      AND tanggal_transfer >= ${monthStart}
      AND tanggal_transfer < ${nextMonthStart}
  `;
  const hasPaidMandatorySavingsThisMonth =
    Number(paidMandatoryRows[0]?.total ?? 0) > 0;

  return (
    <MemberAddSavingsView
      error={params.error}
      formAction={tambahSimpanan}
      hasPaidMandatorySavingsThisMonth={hasPaidMandatorySavingsThisMonth}
      memberId={anggotaId}
      memberName={anggota.nama}
      status={status}
    />
  );
}
