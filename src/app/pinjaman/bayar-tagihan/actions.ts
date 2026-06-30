"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createLoanSimulation } from "@/lib/loanSimulation";
import { prisma } from "@/lib/prisma";
import { uploadPublicFile } from "@/lib/uploadFile";

type LastPaymentIdRow = {
  id: string | null;
};

type LastTransactionIdRow = {
  id: string | null;
};

type LastInstallmentRow = {
  last_installment: number | null;
};

type PendingInstallmentRow = {
  total: number | string;
};

type PayableLoanRow = {
  bunga: number | string;
  id: string;
  nominal: number | string;
  tenor: number;
  tipe_bunga: "MENURUN" | "FLAT";
};

const ALLOWED_PAYMENT_PROOF_TYPES = ["image/jpeg", "image/png"];
const MAX_PAYMENT_PROOF_SIZE = 5 * 1024 * 1024;

export async function kirimPembayaranPinjaman(formData: FormData) {
  const anggotaId =
    String(formData.get("memberId") ?? "").trim() ||
    (await cookies()).get("anggotaId")?.value;
  const loanIds = String(formData.get("loanId") ?? "")
    .split(",")
    .map((loanId) => loanId.trim())
    .filter(Boolean);
  const nominal = Number(
    String(formData.get("amount") ?? "0").replace(/[^\d]/g, ""),
  );
  const paymentProof = formData.get("paymentProof");

  if (!anggotaId || loanIds.length === 0 || !(nominal > 0)) {
    redirect("/login");
  }

  if (!(paymentProof instanceof File) || paymentProof.size === 0) {
    redirect(
      `/pinjaman/bayar-tagihan?anggotaId=${encodeURIComponent(anggotaId)}&error=bukti`,
    );
  }

  if (
    !ALLOWED_PAYMENT_PROOF_TYPES.includes(paymentProof.type) ||
    paymentProof.size > MAX_PAYMENT_PROOF_SIZE
  ) {
    redirect(
      `/pinjaman/bayar-tagihan?anggotaId=${encodeURIComponent(anggotaId)}&error=bukti`,
    );
  }

  const loans = await prisma.$queryRaw<PayableLoanRow[]>`
    SELECT id, nominal, tenor, bunga, tipe_bunga
    FROM pinjaman
    WHERE id = ANY(${loanIds})
      AND anggota_id = ${anggotaId}
      AND status = 'DISETUJUI'::"StatusPinjaman"
    ORDER BY created_at ASC, id ASC
  `;

  if (loans.length !== loanIds.length) {
    redirect(`/pinjaman/bayar-tagihan?anggotaId=${encodeURIComponent(anggotaId)}&error=invalid`);
  }

  for (const loan of loans) {
    const nextInstallment = await getNextInstallmentNumber(loan.id);
    const pendingRows = await prisma.$queryRaw<PendingInstallmentRow[]>`
      SELECT COUNT(*) AS total
      FROM pembayaran_pinjaman
      WHERE pinjaman_id = ${loan.id}
        AND angsuran_ke = ${nextInstallment}
        AND status = 'MENUNGGU'::"StatusPembayaranPinjaman"
    `;

    if (Number(pendingRows[0]?.total ?? 0) > 0) {
      redirect(
        `/pinjaman/bayar-tagihan?anggotaId=${encodeURIComponent(anggotaId)}&error=pending`,
      );
    }
  }

  const proofPublicPath = await uploadPublicFile({
    directory: "pembayaran-pinjaman",
    file: paymentProof,
  });

  await prisma.$transaction(async (transaction) => {
    const [paymentRows, transactionRows] = await Promise.all([
      transaction.$queryRaw<LastPaymentIdRow[]>`
        SELECT id
        FROM pembayaran_pinjaman
        WHERE id ~ '^BYR[0-9]{6}$'
        ORDER BY id DESC
        LIMIT 1
      `,
      transaction.$queryRaw<LastTransactionIdRow[]>`
        SELECT id
        FROM (
          SELECT id FROM simpanan WHERE id ~ '^TRX[0-9]{6}$'
          UNION ALL
          SELECT transaksi_id AS id FROM pembayaran_pinjaman WHERE transaksi_id ~ '^TRX[0-9]{6}$'
        ) trx
        ORDER BY id DESC
        LIMIT 1
      `,
    ]);
    const lastPaymentNumber = paymentRows[0]?.id
      ? Number(paymentRows[0].id.slice(3))
      : 0;
    const lastTransactionNumber = transactionRows[0]?.id
      ? Number(transactionRows[0].id.slice(3))
      : 260000;
    const nextTransactionId = `TRX${String(lastTransactionNumber + 1).padStart(6, "0")}`;

    for (const [index, loan] of loans.entries()) {
      const installmentRows = await transaction.$queryRaw<LastInstallmentRow[]>`
        SELECT COUNT(*) AS last_installment
        FROM pembayaran_pinjaman
        WHERE pinjaman_id = ${loan.id}
          AND status = 'TERVERIFIKASI'::"StatusPembayaranPinjaman"
      `;
      const nextInstallment = Number(installmentRows[0]?.last_installment ?? 0) + 1;
      const currentPayment = createLoanSimulation({
        duration: loan.tenor,
        interestRate: parseNumericAmount(loan.bunga),
        interestType: loan.tipe_bunga === "FLAT" ? "flat" : "menurun",
        principal: parseNumericAmount(loan.nominal),
      }).installmentRows[nextInstallment - 1];

      if (!currentPayment) {
        continue;
      }

      const nextPaymentId = `BYR${String(lastPaymentNumber + index + 1).padStart(
        6,
        "0",
      )}`;

      await transaction.$executeRaw`
        INSERT INTO pembayaran_pinjaman (
          id,
          transaksi_id,
          pinjaman_id,
          angsuran_ke,
          nominal,
          tanggal_bayar,
          bukti_transfer,
          status,
          created_at,
          updated_at
        )
        VALUES (
          ${nextPaymentId},
          ${nextTransactionId},
          ${loan.id},
          ${nextInstallment},
          ${currentPayment.totalPayment},
          CURRENT_DATE,
          ${proofPublicPath},
          'MENUNGGU'::"StatusPembayaranPinjaman",
          NOW(),
          NOW()
        )
      `;
    }
  });

  redirect(`/pinjaman/bayar-tagihan?anggotaId=${encodeURIComponent(anggotaId)}&success=1`);
}

async function getNextInstallmentNumber(loanId: string) {
  const installmentRows = await prisma.$queryRaw<LastInstallmentRow[]>`
    SELECT COUNT(*) AS last_installment
    FROM pembayaran_pinjaman
    WHERE pinjaman_id = ${loanId}
      AND status = 'TERVERIFIKASI'::"StatusPembayaranPinjaman"
  `;

  return Number(installmentRows[0]?.last_installment ?? 0) + 1;
}

function parseNumericAmount(value: number | string) {
  if (typeof value === "number") {
    return value;
  }

  const parsedValue = Number(value.toString().replace(",", "."));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}
