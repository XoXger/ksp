import {
  AdminShuView,
  type AdminShuRecipientData,
  type AdminShuSummaryData,
} from "@/components/ui/AdminShuView";
import { prisma } from "@/lib/prisma";

type LoanInterestSummary = {
  total_interest: number | string | null;
};

type ShuRecipientRecord = {
  id: string;
  name: string;
  total_loan: number | string | null;
  total_savings: number | string | null;
  total_interest: number | string | null;
};

export default async function DashboardShuPage() {
  const [loanInterestSummary, recipientRecords] = await Promise.all([
    prisma.$queryRaw<LoanInterestSummary[]>`
      SELECT COALESCE(SUM(nominal * bunga / 100), 0) AS total_interest
      FROM pinjaman
      WHERE status = 'DISETUJUI'::"StatusPinjaman"
    `,
    prisma.$queryRaw<ShuRecipientRecord[]>`
      SELECT
        a.id,
        a.nama AS name,
        COALESCE(p.total_loan, 0) AS total_loan,
        COALESCE(s.total_savings, 0) AS total_savings,
        COALESCE(p.total_interest, 0) AS total_interest
      FROM anggota a
      LEFT JOIN (
        SELECT
          anggota_id,
          SUM(nominal) AS total_savings
        FROM simpanan
        WHERE id NOT LIKE 'DEFAULT-%'
        GROUP BY anggota_id
      ) s ON s.anggota_id = a.id
      LEFT JOIN (
        SELECT
          anggota_id,
          SUM(nominal) AS total_loan,
          SUM(nominal * bunga / 100) AS total_interest
        FROM pinjaman
        WHERE status = 'DISETUJUI'::"StatusPinjaman"
        GROUP BY anggota_id
      ) p ON p.anggota_id = a.id
      WHERE a.status = 'AKTIF'
      ORDER BY a.created_at ASC, a.id ASC
    `,
  ]);

  const totalLoanInterest = parseNumericAmount(
    loanInterestSummary[0]?.total_interest,
  );
  const netProfit = totalLoanInterest - 7_000_000;
  const distributableNetProfit = Math.max(0, netProfit);
  const reserveFund = distributableNetProfit * 0.4;
  const memberFund = distributableNetProfit * 0.6;
  const savingsServiceFund = memberFund * 0.7;
  const loanServiceFund = memberFund * 0.3;
  const totalSavings = recipientRecords.reduce(
    (total, recipient) => total + parseNumericAmount(recipient.total_savings),
    0,
  );
  const totalInterest = recipientRecords.reduce(
    (total, recipient) => total + parseNumericAmount(recipient.total_interest),
    0,
  );
  const summary: AdminShuSummaryData = {
    netProfit: formatRupiah(netProfit),
    reserveFund: formatRupiah(reserveFund),
    memberFund: formatRupiah(memberFund),
  };
  const recipients: AdminShuRecipientData[] = recipientRecords.map(
    (recipient) => {
      const memberSavings = parseNumericAmount(recipient.total_savings);
      const memberLoan = parseNumericAmount(recipient.total_loan);
      const memberInterest = parseNumericAmount(recipient.total_interest);
      const savingsShu =
        totalSavings > 0
          ? (memberSavings / totalSavings) * savingsServiceFund
          : 0;
      const loanShu =
        totalInterest > 0
          ? (memberInterest / totalInterest) * loanServiceFund
          : 0;

      return {
        id: recipient.id,
        name: recipient.name,
        rawEstimated: Math.max(0, savingsShu + loanShu),
        savings: formatRupiah(memberSavings),
        loan: formatRupiah(memberLoan),
        estimated: formatRupiah(Math.max(0, savingsShu + loanShu)),
      };
    },
  );

  return <AdminShuView recipients={recipients} summary={summary} />;
}

function parseNumericAmount(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  const parsedValue = Number(value.toString().replace(",", "."));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatRupiah(value: number) {
  const prefix = value < 0 ? "- Rp " : "Rp ";

  return `${prefix}${new Intl.NumberFormat("id-ID").format(
    Math.abs(Math.round(value)),
  )}`;
}
