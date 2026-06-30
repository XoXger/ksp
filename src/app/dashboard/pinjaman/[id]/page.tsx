import { notFound, redirect } from "next/navigation";
import {
  AdminLoanDetailView,
  type LoanApplicationDetail,
} from "@/components/ui/AdminLoanDetailView";
import { createLoanSimulation } from "@/lib/loanSimulation";
import { prisma } from "@/lib/prisma";
import {
  getAdminSessionIdentityFromParams,
  getSessionIdentity,
} from "@/lib/session";

const fallbackApplications: LoanApplicationDetail[] = [
  {
    id: "PJ000001",
    memberName: "Budi Santoso",
    memberId: "TRJ-2023-045",
    email: "budi.santoso@email.com",
    phone: "+62 812 3456 7890",
    amount: "Rp 15.000.000",
    tenor: "12 Bulan",
    interest: "1,5% per bulan",
    interestType: "Menurun",
    installmentEstimate: "Rp 1.350.000 / bln",
    documentName: "KTP Pemohon",
    documentUrl: null,
    status: "MENUNGGU",
  },
];

export default async function DashboardLoanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    adminId?: string;
    sessionId?: string;
    superAdminId?: string;
  }>;
}) {
  const currentSession =
    getAdminSessionIdentityFromParams(await searchParams) ??
    (await getSessionIdentity());

  if (
    currentSession?.role !== "ADMIN" &&
    currentSession?.role !== "SUPER_ADMIN"
  ) {
    redirect("/login");
  }

  const { id } = await params;
  const loan = await prisma.pinjaman.findUnique({
    where: { id },
    select: {
      id: true,
      nominal: true,
      bunga: true,
      status: true,
      tenor: true,
      tipeBunga: true,
      dokumen: true,
      anggota: {
        select: {
          id: true,
          nama: true,
          email: true,
          nomorSeluler: true,
        },
      },
    },
  });
  const application = loan
    ? {
        id: loan.id,
        memberName: loan.anggota.nama,
        memberId: loan.anggota.id,
        email: loan.anggota.email,
        phone: loan.anggota.nomorSeluler,
        amount: formatRupiah(Number(loan.nominal)),
        tenor: `${loan.tenor} Bulan`,
        interest: `${formatPercent(Number(loan.bunga))}% per bulan`,
        interestType: loan.tipeBunga === "FLAT" ? "Tetap (Flat)" : "Menurun",
        installmentEstimate: `${formatRupiah(
          createLoanSimulation({
            duration: loan.tenor,
            interestRate: Number(loan.bunga),
            interestType: loan.tipeBunga === "FLAT" ? "flat" : "menurun",
            principal: Number(loan.nominal),
          }).firstRow.totalPayment,
        )} / bln`,
        status: loan.status,
        documentName: getDocumentName(loan.dokumen),
        documentUrl: loan.dokumen,
      }
    : fallbackApplications.find((item) => item.id === id);

  if (!application) {
    notFound();
  }

  return <AdminLoanDetailView application={application} />;
}

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function getDocumentName(value: string | null) {
  if (!value) {
    return "KTP Pemohon";
  }

  return value.split("/").filter(Boolean).at(-1) ?? value;
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}
