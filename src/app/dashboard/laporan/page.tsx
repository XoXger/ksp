import {
  AdminReportsView,
  type ReportCashFlowSummary,
  type ReportRowData,
} from "@/components/ui/AdminReportsView";
import { prisma } from "@/lib/prisma";

type SavingsReportRow = {
  jenis_simpanan: "POKOK" | "WAJIB" | "SUKARELA";
  total_transaksi: number | string;
  total_nominal: number | string | null;
};

type LoanReportRow = {
  total_transaksi: number | string;
  total_nominal: number | string | null;
};

export default async function DashboardReportsPage() {
  const [savingsRows, disbursedLoanRows] = await Promise.all([
    prisma.$queryRaw<SavingsReportRow[]>`
      SELECT
        jenis_simpanan,
        COUNT(*) AS total_transaksi,
        COALESCE(SUM(nominal), 0) AS total_nominal
      FROM simpanan
      WHERE id NOT LIKE 'DEFAULT-%'
      GROUP BY jenis_simpanan
    `,
    prisma.$queryRaw<LoanReportRow[]>`
      SELECT
        COUNT(*) AS total_transaksi,
        COALESCE(SUM(nominal), 0) AS total_nominal
      FROM pinjaman
      WHERE status = 'DISETUJUI'::"StatusPinjaman"
    `,
  ]);
  const savingsMap = new Map(
    savingsRows.map((row) => [
      row.jenis_simpanan,
      {
        transactions: Number(row.total_transaksi ?? 0),
        amount: Number(row.total_nominal ?? 0),
      },
    ]),
  );
  const disbursedLoans = disbursedLoanRows[0] ?? {
    total_transaksi: 0,
    total_nominal: 0,
  };
  const reportRows: ReportRowData[] = [
    createSavingsReportRow("Simpanan Pokok", savingsMap.get("POKOK")),
    createSavingsReportRow("Simpanan Wajib", savingsMap.get("WAJIB")),
    createSavingsReportRow("Simpanan Sukarela", savingsMap.get("SUKARELA")),
    {
      category: "Angsuran Pinjaman",
      transactions: "0",
      amount: "+ 0",
      tone: "green",
    },
    {
      category: "Pencairan Pinjaman",
      transactions: formatNumber(Number(disbursedLoans.total_transaksi ?? 0)),
      amount: `- ${formatNumber(Number(disbursedLoans.total_nominal ?? 0))}`,
      tone: "red",
    },
  ];
  const savingsCashIn = ["POKOK", "WAJIB", "SUKARELA"].reduce(
    (total, key) => total + (savingsMap.get(key as "POKOK" | "WAJIB" | "SUKARELA")?.amount ?? 0),
    0,
  );
  const loanInstallmentCashIn = 0;
  const cashIn = savingsCashIn + loanInstallmentCashIn;
  const cashOut = Number(disbursedLoans.total_nominal ?? 0);
  const netBalance = cashIn - cashOut;
  const cashFlowSummary: ReportCashFlowSummary = {
    cashIn: formatRupiah(cashIn),
    cashOut: formatRupiah(cashOut),
    netBalance: formatRupiah(netBalance),
    netBalancePercentage:
      cashIn > 0 ? Math.max(0, Math.min(100, Math.round((netBalance / cashIn) * 100))) : 0,
  };

  return (
    <AdminReportsView
      cashFlowSummary={cashFlowSummary}
      reportRows={reportRows}
    />
  );
}

function createSavingsReportRow(
  category: ReportRowData["category"],
  value: { transactions: number; amount: number } | undefined,
): ReportRowData {
  return {
    category,
    transactions: formatNumber(value?.transactions ?? 0),
    amount: `+ ${formatNumber(value?.amount ?? 0)}`,
    tone: "green",
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatRupiah(value: number) {
  const prefix = value < 0 ? "- Rp " : "Rp ";

  return `${prefix}${formatNumber(Math.abs(value))}`;
}
