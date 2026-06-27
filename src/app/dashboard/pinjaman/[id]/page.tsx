import { notFound } from "next/navigation";
import {
  AdminLoanDetailView,
  type LoanApplicationDetail,
} from "@/components/ui/AdminLoanDetailView";
import { prisma } from "@/lib/prisma";

const fallbackApplications: LoanApplicationDetail[] = [
  {
    id: "PJ000001",
    memberName: "Budi Santoso",
    memberId: "TRJ-2023-045",
    email: "budi.santoso@email.com",
    phone: "+62 812 3456 7890",
    amount: "Rp 15.000.000",
    tenor: "12 Bulan",
    installmentEstimate: "Rp 1.350.000 / bln",
    documentName: "KTP Pemohon",
    documentUrl: null,
    status: "MENUNGGU",
  },
];

export default async function DashboardLoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loan = await prisma.pinjaman.findUnique({
    where: { id },
    select: {
      id: true,
      nominal: true,
      status: true,
      tenor: true,
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
        installmentEstimate: `${formatRupiah(
          Math.ceil(Number(loan.nominal) / Math.max(loan.tenor, 1)),
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
