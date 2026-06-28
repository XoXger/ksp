import { notFound, redirect } from "next/navigation";
import { AdminMemberDetailView } from "@/components/ui/AdminMemberDetailView";
import { prisma } from "@/lib/prisma";
import {
  getAdminSessionIdentityFromParams,
  getSessionIdentity,
} from "@/lib/session";

export default async function DashboardMemberDetailPage({
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
  const currentSession = await getPrivilegedCookieSession(await searchParams);

  if (!currentSession) {
    redirect("/login");
  }

  const { id } = await params;
  const [
    anggota,
    totalSimpananRows,
    approvedLoanRows,
    verifiedPaymentRows,
    recentSimpanan,
    recentPinjaman,
    recentPembayaran,
  ] =
    await Promise.all([
      prisma.anggota.findUnique({
        where: { id },
        select: {
          id: true,
          nama: true,
          email: true,
          nomorSeluler: true,
          jenisKelamin: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.$queryRaw<Array<{ total: unknown }>>`
        SELECT COALESCE(SUM(nominal), 0) AS total
        FROM simpanan
        WHERE anggota_id = ${id}
          AND status = 'TERVERIFIKASI'::"StatusSimpanan"
      `,
      prisma.$queryRaw<Array<{ total: unknown; count: unknown }>>`
        SELECT COUNT(*) AS count, COALESCE(SUM(nominal), 0) AS total
        FROM pinjaman
        WHERE anggota_id = ${id}
          AND status = 'DISETUJUI'::"StatusPinjaman"
      `,
      prisma.$queryRaw<Array<{ total: unknown }>>`
        SELECT COALESCE(SUM(pp.nominal), 0) AS total
        FROM pembayaran_pinjaman pp
        JOIN pinjaman p ON p.id = pp.pinjaman_id
        WHERE p.anggota_id = ${id}
          AND pp.status = 'TERVERIFIKASI'::"StatusPembayaranPinjaman"
      `,
      prisma.$queryRaw<
        Array<{
          id: string;
          jenis_simpanan: "POKOK" | "WAJIB" | "SUKARELA";
          nominal: unknown;
          status: "MENUNGGU" | "TERVERIFIKASI" | "DITOLAK";
          tanggal_transfer: Date;
        }>
      >`
        SELECT id, jenis_simpanan, nominal, status, tanggal_transfer
        FROM simpanan
        WHERE anggota_id = ${id}
        ORDER BY tanggal_transfer DESC, created_at DESC
      `,
      prisma.$queryRaw<
        Array<{
          id: string;
          nominal: unknown;
          status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
          created_at: Date;
        }>
      >`
        SELECT id, nominal, status, created_at
        FROM pinjaman
        WHERE anggota_id = ${id}
        ORDER BY created_at DESC
      `,
      prisma.$queryRaw<
        Array<{
          id: string;
          nominal: unknown;
          status: "MENUNGGU" | "TERVERIFIKASI" | "DITOLAK";
          tanggal_bayar: Date;
        }>
      >`
        SELECT pp.id, pp.nominal, pp.status, pp.tanggal_bayar
        FROM pembayaran_pinjaman pp
        JOIN pinjaman p ON p.id = pp.pinjaman_id
        WHERE p.anggota_id = ${id}
        ORDER BY pp.tanggal_bayar DESC, pp.created_at DESC
      `,
    ]);

  if (!anggota) {
    notFound();
  }

  const remainingLoan = Math.max(
    0,
    parseNumericAmount(approvedLoanRows[0]?.total ?? 0) -
      parseNumericAmount(verifiedPaymentRows[0]?.total ?? 0),
  );
  const activeLoanCount = parseNumericAmount(approvedLoanRows[0]?.count ?? 0);
  const transactions =
    anggota.status === "AKTIF"
      ? [
          ...recentSimpanan.map((transaction) => ({
            id: transaction.id,
            date: transaction.tanggal_transfer,
            type: getSavingsTypeLabel(transaction.jenis_simpanan),
            description: getSavingsDescription(transaction.jenis_simpanan),
            amount: parseNumericAmount(transaction.nominal),
            status: getSavingsStatusLabel(transaction.status),
          })),
          ...recentPinjaman.map((loan) => ({
            id: loan.id,
            date: loan.created_at,
            type: "Pengajuan Pinjaman",
            description: `Pengajuan pinjaman ${loan.id}`,
            amount: parseNumericAmount(loan.nominal),
            status: getLoanStatusLabel(loan.status),
          })),
          ...recentPembayaran.map((payment) => ({
            id: payment.id,
            date: payment.tanggal_bayar,
            type: "Pembayaran Pinjaman",
            description: `Pembayaran angsuran pinjaman ${payment.id}`,
            amount: parseNumericAmount(payment.nominal),
            status: getPaymentStatusLabel(payment.status),
          })),
        ].sort((first, second) => second.date.getTime() - first.date.getTime())
      : [];

  return (
    <AdminMemberDetailView
      viewerSessionId={currentSession.id}
      member={{
        id: anggota.id,
        name: anggota.nama,
        email: anggota.email,
        phone: anggota.nomorSeluler,
        status: await getMemberStatus(anggota.id),
        gender:
          anggota.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan",
        joinDate: anggota.createdAt,
        isActive: anggota.status === "AKTIF",
        remainingLoan,
        remainingLoanDetail:
          remainingLoan > 0
            ? `${activeLoanCount} pinjaman aktif`
            : "Tidak ada pinjaman aktif",
        totalSavings: parseNumericAmount(totalSimpananRows[0]?.total ?? 0),
      }}
      transactions={transactions}
    />
  );
}

async function getPrivilegedCookieSession(params: {
  adminId?: string;
  sessionId?: string;
  superAdminId?: string;
}) {
  const currentSession =
    getAdminSessionIdentityFromParams(params) ?? (await getSessionIdentity());

  if (
    currentSession?.role === "ADMIN" ||
    currentSession?.role === "SUPER_ADMIN"
  ) {
    return currentSession;
  }

  return null;
}

async function getMemberStatus(id: string) {
  const rows = await prisma.$queryRaw<Array<{ status: "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK" }>>`
    SELECT status FROM anggota WHERE id = ${id} LIMIT 1
  `;

  return rows[0]?.status ?? "AKTIF";
}

function getSavingsTypeLabel(type: "POKOK" | "WAJIB" | "SUKARELA") {
  const labels = {
    POKOK: "Simpanan Pokok",
    WAJIB: "Simpanan Wajib",
    SUKARELA: "Simpanan Sukarela",
  };

  return labels[type];
}

function getSavingsDescription(type: "POKOK" | "WAJIB" | "SUKARELA") {
  const descriptions = {
    POKOK: "Setoran simpanan pokok anggota",
    WAJIB: "Setoran simpanan wajib anggota",
    SUKARELA: "Setoran simpanan sukarela anggota",
  };

  return descriptions[type];
}

function getSavingsStatusLabel(
  status: "MENUNGGU" | "TERVERIFIKASI" | "DITOLAK",
) {
  if (status === "TERVERIFIKASI") {
    return "Selesai";
  }

  if (status === "DITOLAK") {
    return "Ditolak";
  }

  return "Pending";
}

function getLoanStatusLabel(status: "MENUNGGU" | "DISETUJUI" | "DITOLAK") {
  if (status === "DISETUJUI") {
    return "Selesai";
  }

  if (status === "DITOLAK") {
    return "Ditolak";
  }

  return "Pending";
}

function getPaymentStatusLabel(
  status: "MENUNGGU" | "TERVERIFIKASI" | "DITOLAK",
) {
  if (status === "TERVERIFIKASI") {
    return "Selesai";
  }

  if (status === "DITOLAK") {
    return "Ditolak";
  }

  return "Pending";
}

function parseNumericAmount(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const parsedValue = Number(value.replace(",", "."));

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  if (value && typeof value === "object" && "toString" in value) {
    const parsedValue = Number(value.toString().replace(",", "."));

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}
