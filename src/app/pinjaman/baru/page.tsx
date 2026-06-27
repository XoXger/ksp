import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MemberNewLoanView } from "@/components/ui/MemberNewLoanView";
import { prisma } from "@/lib/prisma";
import { getMemberIdFromSessionParam } from "@/lib/memberSession";

export default async function MemberNewLoanPage({
  searchParams,
}: {
  searchParams: Promise<{ anggotaId?: string; error?: string }>;
}) {
  const params = await searchParams;
  const anggotaId =
    (await getMemberIdFromSessionParam(undefined, params.anggotaId)) ??
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

  return (
    <MemberNewLoanView
      errorMessage={getErrorMessage(params.error)}
      memberId={anggota.id}
    />
  );
}

function getErrorMessage(error?: string) {
  if (error === "min-principal") {
    return "Minimal nominal pinjaman adalah Rp 1.000.000.";
  }

  if (error === "invalid-tenor") {
    return "Jangka waktu pinjaman minimal 4 bulan dan maksimal 12 bulan.";
  }

  if (error === "invalid-interest") {
    return "Bunga pinjaman minimal 0.5% dan maksimal 1.5% per bulan.";
  }

  if (error === "invalid-document") {
    return "Dokumen pendukung wajib diunggah dalam format JPG atau PNG maksimal 5MB.";
  }

  if (error === "max-count") {
    return "Anda sudah memiliki 2 pengajuan/pinjaman. Batas maksimal pinjaman adalah dua kali per anggota.";
  }

  if (error === "max-total") {
    return "Akumulasi pinjaman maksimal adalah Rp 10.000.000. Nominal pengajuan melebihi sisa plafon pinjaman Anda.";
  }

  if (error === "invalid") {
    return "Mohon isi nominal pinjaman, jangka waktu, dan bunga dengan benar.";
  }

  return null;
}
