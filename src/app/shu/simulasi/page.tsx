import {
  MemberShuSimulationView,
  type MemberShuSimulationContext,
} from "@/components/ui/MemberShuSimulationView";
import { prisma } from "@/lib/prisma";

type ShuRecipientRecord = {
  total_interest: number | string | null;
  total_savings: number | string | null;
};

type ShuDistributionSummary = {
  total_distributed: number | string | null;
};

export default async function MemberShuSimulationPage() {
  const [recipientRecords, distributionSummary] = await Promise.all([
    prisma.$queryRaw<ShuRecipientRecord[]>`
    SELECT
      COALESCE(s.total_savings, 0) AS total_savings,
      COALESCE(p.total_interest, 0) AS total_interest
    FROM anggota a
    LEFT JOIN (
      SELECT
        anggota_id,
        SUM(nominal) AS total_savings
      FROM simpanan
      WHERE status = 'TERVERIFIKASI'::"StatusSimpanan"
        AND bukti_transfer IS DISTINCT FROM 'Distribusi SHU'
      GROUP BY anggota_id
    ) s ON s.anggota_id = a.id
    LEFT JOIN (
      SELECT
        anggota_id,
        SUM(
          CASE
            WHEN tipe_bunga = 'FLAT'::"TipeBungaPinjaman" THEN nominal * bunga / 100 * tenor
            ELSE nominal * bunga / 100
          END
        ) AS total_interest
      FROM pinjaman
      WHERE status = 'DISETUJUI'::"StatusPinjaman"
      GROUP BY anggota_id
    ) p ON p.anggota_id = a.id
    WHERE a.status = 'AKTIF'
    ORDER BY a.created_at ASC, a.id ASC
  `,
    prisma.$queryRaw<ShuDistributionSummary[]>`
      SELECT COALESCE(SUM(nominal), 0) AS total_distributed
      FROM simpanan
      WHERE jenis_simpanan = 'SUKARELA'::"JenisSimpanan"
        AND bukti_transfer = 'Distribusi SHU'
        AND status = 'TERVERIFIKASI'::"StatusSimpanan"
    `,
  ]);
  const totalLoanInterest = recipientRecords.reduce(
    (total, recipient) => total + parseNumericAmount(recipient.total_interest),
    0,
  );
  const totalDistributedShu = parseNumericAmount(
    distributionSummary[0]?.total_distributed,
  );
  const netProfit = totalLoanInterest - 3_000_000 - totalDistributedShu;
  const memberFund = Math.max(0, netProfit) * 0.6;
  const context: MemberShuSimulationContext = {
    loanServiceFund: memberFund * 0.3,
    savingsServiceFund: memberFund * 0.7,
    totalInterest: totalLoanInterest,
    totalSavings: recipientRecords.reduce(
      (total, recipient) => total + parseNumericAmount(recipient.total_savings),
      0,
    ),
  };

  return <MemberShuSimulationView context={context} />;
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
