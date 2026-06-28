import {
  AdminLoansView,
  type LoanRowData,
} from "@/components/ui/AdminLoansView";
import { prisma } from "@/lib/prisma";

export default async function DashboardLoansPage() {
  const [loans, pendingPaymentRows] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        id: string;
        bunga: number | string;
        nominal: number | string;
        tenor: number;
        tipe_bunga: "MENURUN" | "FLAT";
        status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
        member_name: string;
      }>
    >`
      SELECT
        p.id,
        p.bunga,
        p.nominal,
        p.tenor,
        p.tipe_bunga,
        p.status,
        a.nama AS member_name
      FROM pinjaman p
      JOIN anggota a ON a.id = p.anggota_id
      ORDER BY p.created_at DESC
    `,
    prisma.$queryRaw<Array<{ total: number | string }>>`
      SELECT COUNT(*) AS total
      FROM pembayaran_pinjaman
      WHERE status = 'MENUNGGU'::"StatusPembayaranPinjaman"
    `,
  ]);
  const avatarTones: LoanRowData["avatarTone"][] = [
    "green",
    "cream",
    "brown",
    "pink",
  ];
  const loanRows: LoanRowData[] = loans.map((loan, index) => ({
    initials: getInitials(loan.member_name),
    name: loan.member_name,
    id: loan.id,
    amount: formatRupiah(Number(loan.nominal)),
    interest: `${formatPercent(Number(loan.bunga))}% per bulan`,
    interestType: formatLoanInterestType(loan.tipe_bunga),
    tenor: `${loan.tenor} Bulan`,
    status: getLoanStatusLabel(loan.status),
    statusTone: getLoanStatusTone(loan.status),
    avatarTone: avatarTones[index % avatarTones.length],
  }));

  return (
    <AdminLoansView
      loanRows={loanRows}
      pendingPaymentVerificationCount={Number(pendingPaymentRows[0]?.total ?? 0)}
    />
  );
}

function getLoanStatusLabel(status: "MENUNGGU" | "DISETUJUI" | "DITOLAK") {
  const labels = {
    MENUNGGU: "Menunggu",
    DISETUJUI: "Disetujui",
    DITOLAK: "Ditolak",
  };

  return labels[status];
}

function formatLoanInterestType(type: "MENURUN" | "FLAT") {
  return type === "FLAT" ? "Tetap (Flat)" : "Menurun";
}

function getLoanStatusTone(
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK",
): LoanRowData["statusTone"] {
  const tones = {
    MENUNGGU: "waiting",
    DISETUJUI: "approved",
    DITOLAK: "rejected",
  } as const;

  return tones[status];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}
