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
  updated_at: Date | string;
};

type PaymentCountRecord = {
  pinjaman_id: string;
  paid_installment_count: number | string;
  last_payment_at: Date | string | null;
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
        created_at,
        updated_at
      FROM pinjaman
      WHERE anggota_id = ${anggotaId}
      ORDER BY created_at DESC, id DESC
    `,
    prisma.$queryRaw<PaymentCountRecord[]>`
      SELECT
        pp.pinjaman_id,
        COUNT(*) AS paid_installment_count,
        MAX(pp.created_at) AS last_payment_at
      FROM pembayaran_pinjaman pp
      JOIN pinjaman p ON p.id = pp.pinjaman_id
      WHERE p.anggota_id = ${anggotaId}
        AND pp.status = 'TERVERIFIKASI'::"StatusPembayaranPinjaman"
      GROUP BY pp.pinjaman_id
    `,
  ]);
  const paymentCountByLoanId = new Map(
    paymentCountRows.map((row) => [
      row.pinjaman_id,
      Number(row.paid_installment_count),
    ]),
  );
  const lastPaymentDateByLoanId = new Map(
    paymentCountRows.map((row) => [
      row.pinjaman_id,
      row.last_payment_at ? toDate(row.last_payment_at) : null,
    ]),
  );

  const approvedLoans = loanRecords.filter((loan) => loan.status === "DISETUJUI");
  const activeApprovedLoans = approvedLoans.filter(
    (loan) => (paymentCountByLoanId.get(loan.id) ?? 0) < loan.tenor,
  );
  const loans: MemberLoanRowData[] = loanRecords.map((loan) => ({
    id: loan.id,
    date: formatDate(loan.created_at),
    amount: formatRupiah(parseNumericAmount(loan.nominal)),
    interest: `${formatPercent(parseNumericAmount(loan.bunga))}% per bulan`,
    interestType: formatLoanInterestType(loan.tipe_bunga),
    tenor: `${loan.tenor} Bln`,
    status: getMemberLoanStatus(
      loan.status,
      paymentCountByLoanId.get(loan.id) ?? 0,
      loan.tenor,
    ),
  }));
  const totalApprovedLoanAmount = activeApprovedLoans.reduce(
    (total, loan) => total + parseNumericAmount(loan.nominal),
    0,
  );
  const nextPaymentPlans = activeApprovedLoans
    .map((loan) => {
      const paidInstallmentCount = paymentCountByLoanId.get(loan.id) ?? 0;
      const currentInstallment = createLoanSimulation({
      duration: loan.tenor,
      interestRate: parseNumericAmount(loan.bunga),
      interestType: loan.tipe_bunga === "FLAT" ? "flat" : "menurun",
      principal: parseNumericAmount(loan.nominal),
      }).installmentRows[paidInstallmentCount];

      if (!currentInstallment) {
        return null;
      }

      return {
        dueDate: calculateNextPaymentDueDate(
          loan.created_at,
          paidInstallmentCount,
        ),
        totalPayment: currentInstallment.totalPayment,
      };
    })
    .filter((plan): plan is { dueDate: Date; totalPayment: number } =>
      Boolean(plan),
    );
  const nextPaymentAmount = nextPaymentPlans.reduce(
    (total, plan) => total + plan.totalPayment,
    0,
  );
  const nextPaymentDueDate =
    nextPaymentPlans.length > 0
      ? formatDate(
          nextPaymentPlans.reduce((earliestDate, plan) =>
            plan.dueDate < earliestDate ? plan.dueDate : earliestDate,
          nextPaymentPlans[0].dueDate),
        )
      : "";
  const countedLoans = loanRecords.filter(
    (loan) => loan.status !== "DITOLAK" && !isLoanCompleted(loan, paymentCountByLoanId),
  );
  const countedLoanAmount = countedLoans.reduce(
    (total, loan) => total + parseNumericAmount(loan.nominal),
    0,
  );
  const remainingLoanLimit = Math.max(0, MAX_MEMBER_LOAN_TOTAL - countedLoanAmount);
  const hasReachedLoanCount = countedLoans.length >= MAX_MEMBER_LOAN_COUNT;
  const hasReachedLoanTotal = remainingLoanLimit < 1_000_000;
  const summary: MemberLoanSummaryData = {
    activeLoanCount: activeApprovedLoans.length,
    hasNextPayment: nextPaymentAmount > 0,
    nextPaymentDueDate,
    nextPaymentAmount: formatRupiah(nextPaymentAmount),
    totalLoanAmount: formatRupiah(totalApprovedLoanAmount),
  };
  const activities: MemberLoanActivityData[] = loanRecords
    .flatMap((loan) => {
      const paidInstallmentCount = paymentCountByLoanId.get(loan.id) ?? 0;
      const isCompleted =
        loan.status === "DISETUJUI" &&
        loan.tenor > 0 &&
        paidInstallmentCount >= loan.tenor;
      const baseActivityDate =
        loan.status === "MENUNGGU" ? toDate(loan.created_at) : toDate(loan.updated_at);
      const baseActivity = {
        activityAt: baseActivityDate.getTime(),
        id: `${loan.id}-status`,
        title: getLoanActivityTitle(loan.status),
        detail: `${formatDate(baseActivityDate)} • ${formatRupiah(
          parseNumericAmount(loan.nominal),
        )}`,
        done: loan.status === "DISETUJUI",
      };

      if (!isCompleted) {
        return [baseActivity];
      }

      const completedActivityDate =
        lastPaymentDateByLoanId.get(loan.id) ?? baseActivityDate;

      return [
        {
          activityAt: completedActivityDate.getTime(),
          id: `${loan.id}-completed`,
          title: "Pinjaman Selesai",
          detail: `${formatDate(completedActivityDate)} • ${formatRupiah(
            parseNumericAmount(loan.nominal),
          )}`,
          done: true,
        },
        baseActivity,
      ];
    })
    .sort((firstActivity, secondActivity) => {
      if (secondActivity.activityAt !== firstActivity.activityAt) {
        return secondActivity.activityAt - firstActivity.activityAt;
      }

      return secondActivity.id.localeCompare(firstActivity.id);
    })
    .map(({ activityAt: _activityAt, ...activity }) => activity);

  return (
    <MemberLoanView
      activities={activities}
      canApplyNewLoan={!hasReachedLoanCount && !hasReachedLoanTotal}
      newLoanBlockedMessage={
        hasReachedLoanCount
          ? "Anda sudah memiliki 2 pengajuan/pinjaman yang belum lunas. Lunasi salah satu pinjaman sebelum mengajukan pinjaman baru."
          : `Sisa plafon pinjaman Anda ${formatRupiah(remainingLoanLimit)}, kurang dari minimal pengajuan Rp 1.000.000.`
      }
      loans={loans}
      summary={summary}
    />
  );
}

function getLoanActivityTitle(
  status: MemberLoanRecord["status"],
  paidInstallmentCount = 0,
  tenor = 0,
) {
  if (status === "DISETUJUI" && tenor > 0 && paidInstallmentCount >= tenor) {
    return "Pinjaman Selesai";
  }

  const titles = {
    MENUNGGU: "Pengajuan Pinjaman Menunggu",
    DISETUJUI: "Pencairan Pinjaman",
    DITOLAK: "Pengajuan Pinjaman Ditolak",
  };

  return titles[status];
}

function isLoanCompleted(
  loan: Pick<MemberLoanRecord, "id" | "status" | "tenor">,
  paymentCountByLoanId: Map<string, number>,
) {
  return (
    loan.status === "DISETUJUI" &&
    loan.tenor > 0 &&
    (paymentCountByLoanId.get(loan.id) ?? 0) >= loan.tenor
  );
}

function getMemberLoanStatus(
  status: MemberLoanRecord["status"],
  paidInstallmentCount = 0,
  tenor = 0,
): MemberLoanRowData["status"] {
  if (status === "DISETUJUI" && tenor > 0 && paidInstallmentCount >= tenor) {
    return "Selesai";
  }

  const labels = {
    MENUNGGU: "Menunggu",
    DISETUJUI: "Terutang",
    DITOLAK: "Ditolak",
  } as const;

  return labels[status];
}

function formatLoanInterestType(type: MemberLoanRecord["tipe_bunga"]) {
  return type === "FLAT" ? "Tetap (Flat)" : "Menurun";
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
  const date = toDate(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function calculateNextPaymentDueDate(
  value: Date | string,
  paidInstallmentCount = 0,
) {
  const date = value instanceof Date ? value : new Date(value);
  const dueMonthOffset = date.getDate() >= 23 ? 2 : 1;

  return new Date(
    date.getFullYear(),
    date.getMonth() + dueMonthOffset + paidInstallmentCount,
    1,
  );
}
