import { MemberLoanPaymentView } from "@/components/ui/MemberLoanPaymentView";
import { createLoanSimulation } from "@/lib/loanSimulation";
import { getMemberIdFromSessionParam } from "@/lib/memberSession";
import { prisma } from "@/lib/prisma";

type ActiveLoanRow = {
  bunga: number | string;
  id: string;
  nominal: number | string;
  tenor: number;
  tipe_bunga: "MENURUN" | "FLAT";
};

type PaymentHistoryRow = {
  angsuran_ke: number;
  id: string;
  nominal: number | string;
  pinjaman_id: string;
  status: "MENUNGGU" | "TERVERIFIKASI" | "DITOLAK";
  tanggal_bayar: Date | string;
};

export default async function MemberLoanPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{
    anggotaId?: string;
    error?: string;
    sessionId?: string;
    success?: string;
  }>;
}) {
  const {
    anggotaId: anggotaIdParam,
    error,
    sessionId,
    success,
  } = await searchParams;
  const anggotaId = await getMemberIdFromSessionParam(sessionId, anggotaIdParam);

  if (!anggotaId) {
    return <MemberLoanPaymentView memberId="" paymentHistory={[]} />;
  }

  const [activeLoans, paymentRows] = await Promise.all([
    prisma.$queryRaw<ActiveLoanRow[]>`
      SELECT id, nominal, tenor, bunga, tipe_bunga
      FROM pinjaman
      WHERE anggota_id = ${anggotaId}
        AND status = 'DISETUJUI'::"StatusPinjaman"
      ORDER BY created_at ASC, id ASC
    `,
    prisma.$queryRaw<PaymentHistoryRow[]>`
      SELECT pp.id, pp.pinjaman_id, pp.angsuran_ke, pp.tanggal_bayar, pp.nominal, pp.status
      FROM pembayaran_pinjaman pp
      JOIN pinjaman p ON p.id = pp.pinjaman_id
      WHERE p.anggota_id = ${anggotaId}
      ORDER BY pp.created_at DESC, pp.id DESC
    `,
  ]);
  const paidInstallmentCountByLoanId = new Map<string, number>();

  paymentRows.forEach((payment) => {
    if (payment.status !== "TERVERIFIKASI") {
      return;
    }

    paidInstallmentCountByLoanId.set(
      payment.pinjaman_id,
      (paidInstallmentCountByLoanId.get(payment.pinjaman_id) ?? 0) + 1,
    );
  });

  const payableLoans = activeLoans
    .map((loan) => {
      const installmentIndex = paidInstallmentCountByLoanId.get(loan.id) ?? 0;
      const currentPayment = createLoanSimulation({
        duration: loan.tenor,
        interestRate: parseNumericAmount(loan.bunga),
        interestType: loan.tipe_bunga === "FLAT" ? "flat" : "menurun",
        principal: parseNumericAmount(loan.nominal),
      }).installmentRows[installmentIndex];

      return currentPayment
        ? {
            ...loan,
            currentPayment,
          }
        : null;
    })
    .filter((loan) => loan !== null);
  const totalPaymentAmount = payableLoans.reduce(
    (total, loan) => total + loan.currentPayment.totalPayment,
    0,
  );
  const totalLoanAmount = activeLoans.reduce(
    (total, loan) => total + parseNumericAmount(loan.nominal),
    0,
  );

  return (
    <MemberLoanPaymentView
      activePayment={
        payableLoans.length > 0
          ? {
              amount: formatRupiah(totalPaymentAmount),
              loanId: payableLoans.map((loan) => loan.id).join(","),
              memberId: anggotaId,
              rawAmount: String(totalPaymentAmount),
              totalLoan: formatRupiah(totalLoanAmount),
              dueDate: "-",
            }
          : null
      }
      memberId={anggotaId}
      paymentError={mapPaymentError(error)}
      paymentSuccess={success === "1"}
      paymentHistory={paymentRows.map((payment, index) => ({
        amount: formatRupiah(parseNumericAmount(payment.nominal)),
        date: formatDate(payment.tanggal_bayar),
        id: payment.id,
        installment: `Angsuran ke-${payment.angsuran_ke}`,
        no: index + 1,
        status: mapPaymentStatus(payment.status),
        tenor: "1 Bulan",
      }))}
    />
  );
}

function mapPaymentError(error: string | undefined) {
  if (error === "pending") {
    return "Pembayaran angsuran ini sedang menunggu konfirmasi Admin Koperasi.";
  }

  if (error === "bukti") {
    return "Mohon upload bukti transfer";
  }

  if (error === "invalid") {
    return "Tagihan pinjaman tidak valid.";
  }

  return "";
}

function mapPaymentStatus(status: PaymentHistoryRow["status"]) {
  if (status === "TERVERIFIKASI") {
    return "Terverifikasi";
  }

  if (status === "DITOLAK") {
    return "Ditolak";
  }

  return "Menunggu";
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

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
