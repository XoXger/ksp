import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MemberProfileView } from "@/components/ui/MemberProfileView";
import { prisma } from "@/lib/prisma";
import { getMemberIdFromSessionParam } from "@/lib/memberSession";

export default async function MemberProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ memberSessionId?: string; anggotaId?: string }>;
}) {
  const { memberSessionId, anggotaId: anggotaIdParam } = await searchParams;
  const anggotaId =
    (memberSessionId || anggotaIdParam
      ? await getMemberIdFromSessionParam(memberSessionId, anggotaIdParam)
      : null) ??
    (await cookies()).get("anggotaId")?.value;

  if (!anggotaId) {
    redirect("/login");
  }

  const [anggota, savingsRows, loanRows, verifiedPaymentRows] =
    await Promise.all([
      prisma.anggota.findUnique({
        where: { id: anggotaId },
        select: {
          id: true,
          nama: true,
          email: true,
          nomorSeluler: true,
          jenisKelamin: true,
          createdAt: true,
        },
      }),
      prisma.$queryRaw<Array<{ total: number | string | null }>>`
        SELECT COALESCE(SUM(nominal), 0) AS total
        FROM simpanan
        WHERE anggota_id = ${anggotaId}
          AND status = 'TERVERIFIKASI'::"StatusSimpanan"
      `,
      prisma.$queryRaw<Array<{ total: number | string | null }>>`
        SELECT COALESCE(SUM(nominal), 0) AS total
        FROM pinjaman
        WHERE anggota_id = ${anggotaId}
          AND status = 'DISETUJUI'::"StatusPinjaman"
      `,
      prisma.$queryRaw<Array<{ total: number | string | null }>>`
        SELECT COALESCE(SUM(pp.nominal), 0) AS total
        FROM pembayaran_pinjaman pp
        JOIN pinjaman p ON p.id = pp.pinjaman_id
        WHERE p.anggota_id = ${anggotaId}
          AND pp.status = 'TERVERIFIKASI'::"StatusPembayaranPinjaman"
      `,
    ]);

  if (!anggota) {
    redirect("/login");
  }

  return (
    <MemberProfileView
      backHref={
        memberSessionId
          ? `/anggota?sessionId=${encodeURIComponent(memberSessionId)}&anggotaId=${encodeURIComponent(anggotaId)}`
          : anggotaIdParam
            ? `/anggota?anggotaId=${encodeURIComponent(anggotaId)}`
          : "/anggota"
      }
      member={{
        id: anggota.id,
        nama: anggota.nama,
        email: anggota.email,
        nomorSeluler: anggota.nomorSeluler,
        jenisKelamin:
          anggota.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan",
        tanggalBergabung: formatDate(anggota.createdAt),
      }}
      metrics={{
        remainingLoan: formatRupiah(
          Math.max(
            parseNumericAmount(loanRows[0]?.total) -
              parseNumericAmount(verifiedPaymentRows[0]?.total),
            0,
          ),
        ),
        totalSavings: formatRupiah(parseNumericAmount(savingsRows[0]?.total)),
      }}
    />
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function parseNumericAmount(
  value: number | string | { toString(): string } | null | undefined,
) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsedValue = Number(value.toString().replace(",", "."));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(value))}`;
}
