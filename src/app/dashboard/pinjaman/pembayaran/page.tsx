import { AdminLoanPaymentsView } from "@/components/ui/AdminLoanPaymentsView";
import { prisma } from "@/lib/prisma";

type LoanPaymentQueryRow = {
  amount: unknown;
  installment_number: number;
  interest_type: "MENURUN" | "FLAT";
  loan_id: string;
  member_name: string;
  payment_id: string;
  status: "MENUNGGU" | "TERVERIFIKASI" | "DITOLAK";
  transaction_id: string;
};

export default async function DashboardLoanPaymentsPage() {
  const paymentRows = await prisma.$queryRaw<LoanPaymentQueryRow[]>`
    SELECT
      pembayaran_pinjaman.id AS payment_id,
      pembayaran_pinjaman.transaksi_id AS transaction_id,
      pembayaran_pinjaman.pinjaman_id AS loan_id,
      pembayaran_pinjaman.angsuran_ke AS installment_number,
      pembayaran_pinjaman.nominal AS amount,
      pembayaran_pinjaman.status AS status,
      pinjaman.tipe_bunga AS interest_type,
      anggota.nama AS member_name
    FROM pembayaran_pinjaman
    INNER JOIN pinjaman ON pinjaman.id = pembayaran_pinjaman.pinjaman_id
    INNER JOIN anggota ON anggota.id = pinjaman.anggota_id
    ORDER BY pembayaran_pinjaman.created_at DESC
  `;

  return (
    <AdminLoanPaymentsView
      paymentRows={paymentRows.map((row) => ({
        amount: formatRupiah(parseNumericAmount(row.amount)),
        installmentLabel: `Angsuran Ke-${row.installment_number}`,
        interestType: formatLoanInterestType(row.interest_type),
        loanId: row.loan_id,
        memberName: row.member_name,
        paymentId: row.payment_id,
        status: mapPaymentStatus(row.status),
        transactionId: row.transaction_id,
      }))}
    />
  );
}

function mapPaymentStatus(status: LoanPaymentQueryRow["status"]) {
  if (status === "TERVERIFIKASI") {
    return "Terverifikasi";
  }

  if (status === "DITOLAK") {
    return "Ditolak";
  }

  return "Menunggu";
}

function formatLoanInterestType(type: LoanPaymentQueryRow["interest_type"]) {
  return type === "FLAT" ? "Tetap (Flat)" : "Menurun";
}

function parseNumericAmount(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  if (value && typeof value === "object" && "toString" in value) {
    const parsedValue = Number(value.toString());

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}

function formatRupiah(value: number) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}
