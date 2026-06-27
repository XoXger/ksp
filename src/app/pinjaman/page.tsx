import { redirect } from "next/navigation";
import {
  MemberLoanView,
  type MemberLoanActivityData,
  type MemberLoanRowData,
  type MemberLoanSummaryData,
} from "@/components/ui/MemberLoanView";
import { createLoanSimulation } from "@/lib/loanSimulation";
import { getMemberIdFromSessionParam } from "@/lib/memberSession";
import { prisma } from "@/lib/prisma";

const MAX_MEMBER_LOAN_COUNT = 2;
const MAX_MEMBER_LOAN_TOTAL = 10_000_000;

type MemberLoanRecord = {
  id: string;
  bunga: number | string;
  nominal: number | string;
  tenor: number;
  tipe_bunga: "MENURUN" | "FLAT";
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
  created_at: Date | string;
};

type PaymentCountRecord = {
  pinjaman_id: string;
  paid_installment_count: number | string;
};

export default async function PinjamanPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; anggotaId?: string }>;
}) {
  const { sessionId, anggotaId: anggotaIdParam } = await searchParams;
  const anggotaId = await getMemberIdFromSessionParam(sessionId, anggotaIdParam);

  if (!anggotaId) {
    redirect("/login");
  }

  const [loanRecords, paymentCountRows] = await Promise.all([
    prisma.$queryRaw<MemberLoanRecord[]>`
      SELECT
        id,
        bunga,
        nominal,
        tenor,
        tipe_bunga,
        status,
        created_at
      FROM pinjaman
      WHERE anggota_id = ${anggotaId}
      ORDER BY created_at DESC, id DESC
    `,
    prisma.$queryRaw<PaymentCountRecord[]>`
      SELECT pp.pinjaman_id, COUNT(*) AS paid_installment_count
      FROM pembayaran_pinjaman pp
      JOIN pinjaman p ON p.id = pp.pinjaman_id
      WHERE p.anggota_id = ${anggotaId}
        AND pp.status <> 'DITOLAK'::"StatusPembayaranPinjaman"
      GROUP BY pp.pinjaman_id
    `,
  ]);
  const paymentCountByLoanId = new Map(
    paymentCountRows.map((row) => [
      row.pinjaman_id,
      Number(row.paid_installment_count),
    ]),
  );

  const loans: MemberLoanRowData[] = loanRecords.map((loan) => ({
    id: loan.id,
    date: formatDate(loan.created_at),
    amount: formatRupiah(parseNumericAmount(loan.nominal)),
    interest: `${formatPercent(parseNumericAmount(loan.bunga))}% per bulan`,
    tenor: `${loan.tenor} Bln`,
    status: getMemberLoanStatus(loan.status),
  }));

  const approvedLoans = loanRecords.filter((loan) => loan.status === "DISETUJUI");
  const totalApprovedLoanAmount = approvedLoans.reduce(
    (total, loan) => total + parseNumericAmount(loan.nominal),
    0,
  );
  const nextPaymentAmount = approvedLoans.reduce((total, loan) => {
    const installmentIndex = paymentCountByLoanId.get(loan.id) ?? 0;
    const currentInstallment = createLoanSimulation({
      duration: loan.tenor,
      interestRate: parseNumericAmount(loan.bunga),
      interestType: loan.tipe_bunga === "FLAT" ? "flat" : "menurun",
      principal: parseNumericAmount(loan.nominal),
    }).installmentRows[installmentIndex];

    return total + (currentInstallment?.totalPayment ?? 0);
  }, 0);
  const nextPaymentDueDate = approvedLoans[0]
    ? formatDate(calculateNextPaymentDueDate(approvedLoans[0].created_at))
    : "";
  const countedLoans = loanRecords.filter((loan) => loan.status !== "DITOLAK");
  const countedLoanAmount = countedLoans.reduce(
    (total, loan) => total + parseNumericAmount(loan.nominal),
    0,
  );
  const remainingLoanLimit = Math.max(0, MAX_MEMBER_LOAN_TOTAL - countedLoanAmount);
  const hasReachedLoanCount = countedLoans.length >= MAX_MEMBER_LOAN_COUNT;
  const hasReachedLoanTotal = remainingLoanLimit < 1_000_000;
  const summary: MemberLoanSummaryData = {
    activeLoanCount: approvedLoans.length,
    hasNextPayment: nextPaymentAmount > 0,
    nextPaymentDueDate,
    nextPaymentAmount: formatRupiah(nextPaymentAmount),
    totalLoanAmount: formatRupiah(totalApprovedLoanAmount),
  };
  const activities: MemberLoanActivityData[] = loanRecords.slice(0, 5).map((loan) => ({
    title: getLoanActivityTitle(loan.status),
    detail: `${formatDate(loan.created_at)} • ${formatRupiah(
      parseNumericAmount(loan.nominal),
    )}`,
    done: loan.status === "DISETUJUI",
  }));

  return (
    <MemberLoanView
      activities={activities}
      canApplyNewLoan={!hasReachedLoanCount && !hasReachedLoanTotal}
      newLoanBlockedMessage={
        hasReachedLoanCount
          ? "Anda sudah memiliki 2 pengajuan/pinjaman. Batas maksimal pinjaman adalah dua kali per anggota."
          : `Sisa plafon pinjaman Anda ${formatRupiah(remainingLoanLimit)}, kurang dari minimal pengajuan Rp 1.000.000.`
      }
      loans={loans}
      summary={summary}
    />
  );
}

function getLoanActivityTitle(status: MemberLoanRecord["status"]) {
  const titles = {
    MENUNGGU: "Pengajuan Pinjaman Menunggu",
    DISETUJUI: "Pencairan Pinjaman",
    DITOLAK: "Pengajuan Pinjaman Ditolak",
  };

  return titles[status];
}

function getMemberLoanStatus(
  status: MemberLoanRecord["status"],
): MemberLoanRowData["status"] {
  const labels = {
    MENUNGGU: "Menunggu",
    DISETUJUI: "Terutang",
    DITOLAK: "Ditolak",
  } as const;

  return labels[status];
}

function parseNumericAmount(value: number | string) {
  if (typeof value === "number") {
    return value;
  }

  const parsedValue = Number(value.toString().replace(",", "."));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(value))}`;
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function calculateNextPaymentDueDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const dueMonthOffset = date.getDate() >= 23 ? 2 : 1;

  return new Date(date.getFullYear(), date.getMonth() + dueMonthOffset, 1);
}
