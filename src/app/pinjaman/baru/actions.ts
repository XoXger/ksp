"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createLoanSimulation,
  isValidLoanSimulationInput,
  MAX_LOAN_INTEREST_RATE,
  MAX_LOAN_DURATION,
  MIN_LOAN_INTEREST_RATE,
  MIN_LOAN_DURATION,
  MIN_LOAN_PRINCIPAL,
  type LoanInterestType,
} from "@/lib/loanSimulation";
import { prisma } from "@/lib/prisma";
import { uploadPublicFile } from "@/lib/uploadFile";

type LastLoanIdRow = {
  id: string | null;
};

const MAX_MEMBER_LOAN_COUNT = 2;
const MAX_MEMBER_LOAN_TOTAL = 10_000_000;
const ALLOWED_IDENTITY_DOCUMENT_TYPES = ["image/jpeg", "image/png"];
const MAX_IDENTITY_DOCUMENT_SIZE = 5 * 1024 * 1024;

export async function ajukanPinjaman(formData: FormData) {
  const anggotaId =
    String(formData.get("memberId") ?? "").trim() ||
    (await cookies()).get("anggotaId")?.value;

  if (!anggotaId) {
    redirect("/login");
  }

  const anggota = await prisma.anggota.findUnique({
    where: { id: anggotaId },
    select: { id: true },
  });

  if (!anggota) {
    redirect("/login");
  }

  const nominal = Number(
    String(formData.get("amount") ?? "0").replace(/[^\d]/g, ""),
  );
  const tenor = Number(String(formData.get("tenor") ?? "0").replace(/[^\d]/g, ""));
  const bunga = Number(String(formData.get("interest") ?? "0").replace(",", "."));
  const interestType = String(formData.get("interestType") ?? "menurun");
  const loanInterestType: LoanInterestType =
    interestType === "flat" ? "flat" : "menurun";
  const keperluan = String(formData.get("purpose") ?? "").trim() || null;
  const identityDocument = formData.get("identityDocument");
  const existingLoanRows = await prisma.$queryRaw<
    Array<{ loan_count: number | string; total_amount: number | string | null }>
  >`
    WITH verified_payments AS (
      SELECT pinjaman_id, COUNT(*) AS paid_installment_count
      FROM pembayaran_pinjaman
      WHERE status = 'TERVERIFIKASI'::"StatusPembayaranPinjaman"
      GROUP BY pinjaman_id
    )
    SELECT COUNT(*) AS loan_count, COALESCE(SUM(p.nominal), 0) AS total_amount
    FROM pinjaman p
    LEFT JOIN verified_payments vp ON vp.pinjaman_id = p.id
    WHERE p.anggota_id = ${anggota.id}
      AND p.status <> 'DITOLAK'::"StatusPinjaman"
      AND NOT (
        p.status = 'DISETUJUI'::"StatusPinjaman"
        AND COALESCE(vp.paid_installment_count, 0) >= p.tenor
      )
  `;
  const existingLoanCount = Number(existingLoanRows[0]?.loan_count ?? 0);
  const existingLoanTotal = parseNumericAmount(
    existingLoanRows[0]?.total_amount ?? 0,
  );

  if (existingLoanCount >= MAX_MEMBER_LOAN_COUNT) {
    redirect(
      `/pinjaman/baru?anggotaId=${encodeURIComponent(anggotaId)}&error=max-count`,
    );
  }

  if (!(identityDocument instanceof File) || identityDocument.size === 0) {
    redirect(
      `/pinjaman/baru?anggotaId=${encodeURIComponent(anggotaId)}&error=invalid-document`,
    );
  }

  if (
    !ALLOWED_IDENTITY_DOCUMENT_TYPES.includes(identityDocument.type) ||
    identityDocument.size > MAX_IDENTITY_DOCUMENT_SIZE
  ) {
    redirect(
      `/pinjaman/baru?anggotaId=${encodeURIComponent(anggotaId)}&error=invalid-document`,
    );
  }

  if (nominal > 0 && nominal < MIN_LOAN_PRINCIPAL) {
    redirect(
      `/pinjaman/baru?anggotaId=${encodeURIComponent(anggotaId)}&error=min-principal`,
    );
  }

  if (nominal > MAX_MEMBER_LOAN_TOTAL - existingLoanTotal) {
    redirect(
      `/pinjaman/baru?anggotaId=${encodeURIComponent(anggotaId)}&error=max-total`,
    );
  }

  if (tenor > 0 && (tenor < MIN_LOAN_DURATION || tenor > MAX_LOAN_DURATION)) {
    redirect(
      `/pinjaman/baru?anggotaId=${encodeURIComponent(anggotaId)}&error=invalid-tenor`,
    );
  }

  if (
    bunga > 0 &&
    (bunga < MIN_LOAN_INTEREST_RATE || bunga > MAX_LOAN_INTEREST_RATE)
  ) {
    redirect(
      `/pinjaman/baru?anggotaId=${encodeURIComponent(anggotaId)}&error=invalid-interest`,
    );
  }

  if (
    !isValidLoanSimulationInput({
      duration: tenor,
      interestRate: bunga,
      interestType: loanInterestType,
      principal: nominal,
    })
  ) {
    redirect(`/pinjaman/baru?anggotaId=${encodeURIComponent(anggotaId)}&error=invalid`);
  }

  createLoanSimulation({
    duration: tenor,
    interestRate: bunga,
    interestType: loanInterestType,
    principal: nominal,
  });

  const documentPublicPath = await uploadPublicFile({
    directory: "pinjaman",
    file: identityDocument,
  });

  await prisma.$transaction(async (transaction) => {
    const rows = await transaction.$queryRaw<LastLoanIdRow[]>`
      SELECT id
      FROM pinjaman
      WHERE id ~ '^PJ[0-9]{6}$'
      ORDER BY id DESC
      LIMIT 1
    `;
    const lastNumber = rows[0]?.id ? Number(rows[0].id.slice(2)) : 0;
    const nextLoanId = `PJ${String(lastNumber + 1).padStart(6, "0")}`;
    const tipeBunga = loanInterestType === "flat" ? "FLAT" : "MENURUN";

    await transaction.$executeRaw`
      INSERT INTO pinjaman (
        id,
        anggota_id,
        nominal,
        tenor,
        bunga,
        tipe_bunga,
        keperluan,
        dokumen,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${nextLoanId},
        ${anggota.id},
        ${nominal},
        ${tenor},
        ${bunga},
        ${tipeBunga}::"TipeBungaPinjaman",
        ${keperluan},
        ${documentPublicPath},
        'MENUNGGU'::"StatusPinjaman",
        NOW(),
        NOW()
      )
    `;
  });

  redirect(`/pinjaman?anggotaId=${encodeURIComponent(anggotaId)}&success=1`);
}

function parseNumericAmount(value: number | string | null) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value.replace(",", "."));

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}
