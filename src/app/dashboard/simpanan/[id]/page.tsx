import { notFound, redirect } from "next/navigation";
import { AdminSavingsDetailView } from "@/components/ui/AdminSavingsDetailView";
import { prisma } from "@/lib/prisma";
import {
  getAdminSessionIdentityFromParams,
  getSessionIdentity,
} from "@/lib/session";

type SavingsDetailRecord = {
  bukti_transfer: string | null;
  id: string;
  jenis_simpanan: "POKOK" | "WAJIB" | "SUKARELA";
  member_name: string;
  nominal: number | string;
  status: "MENUNGGU" | "TERVERIFIKASI" | "DITOLAK";
  tanggal_transfer: Date;
};

export default async function DashboardSavingsDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    adminId?: string;
    sessionId?: string;
    superAdminId?: string;
  }>;
}) {
  const currentSession =
    getAdminSessionIdentityFromParams(await searchParams) ??
    (await getSessionIdentity());

  if (
    currentSession?.role !== "ADMIN" &&
    currentSession?.role !== "SUPER_ADMIN"
  ) {
    redirect("/login");
  }

  const { id } = await params;
  const rows = await prisma.$queryRaw<SavingsDetailRecord[]>`
    SELECT
      s.id,
      a.nama AS member_name,
      s.jenis_simpanan,
      s.nominal,
      s.status,
      s.tanggal_transfer,
      s.bukti_transfer
    FROM simpanan s
    JOIN anggota a ON a.id = s.anggota_id
    WHERE s.id = ${id}
    LIMIT 1
  `;
  const transaction = rows[0];

  if (!transaction) {
    notFound();
  }

  const isDefaultSavings = transaction.id.startsWith("DEFAULT-");
  const transferProofUrl =
    isPublicUploadUrl(transaction.bukti_transfer)
      ? transaction.bukti_transfer
      : null;
  const hasTransferProof = Boolean(transferProofUrl) && !isDefaultSavings;

  return (
    <AdminSavingsDetailView
      transaction={{
        amount: formatRupiah(Number(transaction.nominal)),
        date: formatDate(transaction.tanggal_transfer),
        hasTransferProof,
        id: transaction.id,
        memberName: transaction.member_name,
        savingsType: getSavingsTypeLabel(transaction.jenis_simpanan),
        status: getSavingsStatusLabel(transaction.status),
        transferProofUrl,
      }}
    />
  );
}

function isPublicUploadUrl(value: string | null) {
  if (!value) {
    return false;
  }

  return (
    value.startsWith("/uploads/") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  );
}

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(date);
}

function getSavingsTypeLabel(type: SavingsDetailRecord["jenis_simpanan"]) {
  return {
    POKOK: "Simpanan Pokok",
    WAJIB: "Simpanan Wajib",
    SUKARELA: "Simpanan Sukarela",
  }[type];
}

function getSavingsStatusLabel(
  status: SavingsDetailRecord["status"],
): "Terverifikasi" | "Menunggu" | "Ditolak" {
  if (status === "MENUNGGU") {
    return "Menunggu";
  }

  if (status === "DITOLAK") {
    return "Ditolak";
  }

  return "Terverifikasi";
}
