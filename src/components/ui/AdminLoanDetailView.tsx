"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { label: "Beranda", icon: GridIcon, href: "/dashboard" },
  { label: "Kelola Akun", icon: UserSettingsIcon, href: "/dashboard/akun" },
  { label: "Kelola Simpanan", icon: WalletIcon, href: "/dashboard/simpanan" },
  {
    label: "Kelola Pinjaman",
    icon: MoneyIcon,
    href: "/dashboard/pinjaman",
    active: true,
  },
  { label: "Laporan Koperasi", icon: ReportIcon, href: "/dashboard/laporan" },
  { label: "SHU", icon: CoinIcon, href: "/dashboard/shu" },
];

export type LoanApplicationDetail = {
  id: string;
  memberName: string;
  memberId: string;
  email: string;
  phone: string;
  amount: string;
  tenor: string;
  installmentEstimate: string;
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
  documentName: string;
  documentUrl: string | null;
};

export function AdminLoanDetailView({
  application,
}: {
  application: LoanApplicationDetail;
}) {
  const router = useRouter();
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const canUpdateStatus = application.status === "MENUNGGU";
  const hasDocumentImage =
    application.documentUrl?.startsWith("/uploads/") ?? false;

  const updateLoanStatus = async (status: "DISETUJUI" | "DITOLAK") => {
    setIsUpdatingStatus(true);

    const response = await fetch(`/api/pinjaman/${application.id}/status`, {
      body: JSON.stringify({ status }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    setIsUpdatingStatus(false);

    if (!response.ok) {
      alert("Status pinjaman gagal diperbarui. Silakan coba lagi.");
      return;
    }

    router.push("/dashboard/pinjaman");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#10231d] lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <AdminSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dcdcc0] bg-white px-5 sm:px-7 lg:px-8">
            <h1 className="text-lg font-bold text-[#0f4333] sm:text-xl">
              Dashboard Overview
            </h1>
            <div className="flex items-center gap-7 text-[#10231d]">
<UserCircleIcon className="h-7 w-7" />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-7 sm:px-7 lg:px-10">
            <Link
              className="inline-flex items-center gap-3 text-base text-[#26322e] transition hover:text-[#075f48]"
              href="/dashboard/pinjaman"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Kembali ke Kelola Pinjaman
            </Link>

            <h2 className="mt-7 text-2xl font-extrabold tracking-[0.08em]">
              Proses Pengajuan Pinjaman
            </h2>

            <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
              <div className="space-y-6">
                <section className="rounded-xl bg-white p-8 shadow-[0_10px_24px_rgba(23,79,62,0.08)] ring-1 ring-black/10">
                  <SectionTitle
                    icon={<ApplicantIcon className="h-5 w-5" />}
                    title="Informasi Pemohon"
                  />
                  <div className="mt-7 grid gap-8 border-t border-[#e1e1d8] pt-7 md:grid-cols-2">
                    <DetailItem label="Nama Lengkap" value={application.memberName} />
                    <DetailItem label="ID Anggota" value={application.memberId} />
                    <DetailItem label="Email" value={application.email} />
                    <DetailItem label="Nomor Telepon" value={application.phone} />
                  </div>
                </section>

                <section className="rounded-xl bg-white p-8 shadow-[0_10px_24px_rgba(23,79,62,0.08)] ring-1 ring-black/10">
                  <SectionTitle
                    icon={<MoneyIcon className="h-5 w-5" />}
                    title="Rincian Pinjaman"
                  />
                  <div className="mt-7 border-t border-[#e1e1d8] pt-7">
                    <div className="grid gap-5 rounded-lg bg-[#fbfbe8] p-6 ring-1 ring-black/10 md:grid-cols-3">
                      <LoanSummaryItem
                        label="Total Pengajuan"
                        value={application.amount}
                      />
                      <LoanSummaryItem label="Jangka Waktu" value={application.tenor} />
                      <LoanSummaryItem
                        label="Estimasi Angsuran"
                        value={application.installmentEstimate}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <section className="rounded-xl bg-white p-8 shadow-[0_10px_24px_rgba(23,79,62,0.08)] ring-1 ring-black/10">
                <SectionTitle
                  icon={<DocumentIcon className="h-5 w-5" />}
                  title="Dokumen Pendukung"
                />
                <div className="mt-7 border-t border-[#e1e1d8] pt-7">
                  <div className="overflow-hidden rounded-lg bg-white ring-1 ring-black/10">
                    <div className="flex items-center gap-3 bg-[#eeeed6] px-5 py-4 text-sm break-all">
                      <IdCardIcon className="h-5 w-5" />
                      {application.documentName}
                    </div>
                    {hasDocumentImage && application.documentUrl ? (
                      <button
                        className="m-3 block overflow-hidden rounded-md border border-dashed border-[#d4d4bc] bg-[#f4f4da] transition hover:border-[#185440]"
                        onClick={() => setIsDocumentPreviewOpen(true)}
                        type="button"
                      >
                        <img
                          alt="Dokumen pendukung pinjaman"
                          className="aspect-[4/3] w-full object-cover"
                          src={application.documentUrl}
                        />
                      </button>
                    ) : (
                      <div className="m-3 grid aspect-[4/3] place-items-center rounded-md border border-dashed border-[#d4d4bc] bg-[#f4f4da] text-[#aeb9b0]">
                        <IdCardIcon className="h-14 w-14" />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {canUpdateStatus ? (
              <div className="mt-9 flex flex-col gap-4 border-t border-[#e1e1c8] pt-8 sm:flex-row sm:justify-end">
                <button
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-lg border-2 border-[#d00000] bg-transparent px-9 text-base font-extrabold uppercase text-[#d00000] transition hover:bg-[#fff0ef]"
                  disabled={isUpdatingStatus}
                  onClick={() => updateLoanStatus("DITOLAK")}
                  type="button"
                >
                  <XIcon className="h-5 w-5" />
                  Tolak Pengajuan
                </button>
                <button
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-lg bg-[#043f31] px-9 text-base font-extrabold uppercase text-white shadow-[0_12px_22px_rgba(23,79,62,0.24)] transition hover:bg-[#075f48]"
                  disabled={isUpdatingStatus}
                  onClick={() => updateLoanStatus("DISETUJUI")}
                  type="button"
                >
                  <CheckIcon className="h-5 w-5" />
                  Setujui Pengajuan
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
      {isDocumentPreviewOpen && application.documentUrl ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
          <div className="relative max-h-[90vh] w-full max-w-4xl rounded-xl bg-white p-4 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
            <button
              aria-label="Tutup pratinjau dokumen"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#fff0ef] text-[#b00000] ring-1 ring-[#f2b8b5] transition hover:bg-[#ffe1df]"
              onClick={() => setIsDocumentPreviewOpen(false)}
              type="button"
            >
              <XIcon className="h-5 w-5" />
            </button>
            <img
              alt="Pratinjau dokumen pendukung pinjaman"
              className="max-h-[82vh] w-full rounded-lg object-contain"
              src={application.documentUrl}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[#26322e]">
      {icon}
      <h3 className="text-base font-extrabold tracking-[0.18em]">{title}</h3>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-base text-[#414842]">{label}</p>
      <p className="mt-2 text-lg font-medium text-[#111816]">{value}</p>
    </div>
  );
}

function LoanSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[#dedec6] md:border-r md:last:border-r-0 md:pr-6">
      <p className="text-base text-[#414842]">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-[#111816]">{value}</p>
    </div>
  );
}

function AdminSidebar() {
  return (
    <aside className="hidden w-[230px] shrink-0 flex-col bg-[#185440] px-5 py-6 text-white shadow-[10px_0_28px_rgba(23,79,62,0.18)] lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#185440]">
          <BankIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-lg font-extrabold uppercase">KSP Tarunajaya</p>
          <p className="mt-0.5 text-xs font-semibold text-[#89bea9]">
            Admin Portal
          </p>
        </div>
      </div>

      <nav className="mt-12 space-y-3">
        {menuItems.map((item) => (
          <a
            className={`relative flex h-11 items-center gap-3 px-4 text-sm font-semibold ${
              item.active
                ? "bg-[#386d5b] text-white before:absolute before:left-0 before:h-full before:w-1 before:bg-[#31d8ad]"
                : "text-[#8fc0ab] hover:bg-[#0f6049] hover:text-white"
            }`}
            href={item.href}
            key={item.label}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </a>
        ))}
      </nav>

      <a
        className="mt-auto flex h-10 items-center gap-3 px-4 text-sm font-semibold text-[#9bc4b4] hover:text-white"
        href="/logout"
      >
        <LogoutIcon className="h-5 w-5" />
        Keluar
      </a>
    </aside>
  );
}

function BankIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 3 7.5v2h18v-2L12 3Zm-6 8v6H4v2h16v-2h-2v-6h-2v6h-3v-6h-2v6H8v-6H6Z" /></svg>;
}
function GridIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h7v7H4V4Zm2 2v3h3V6H6Zm7-2h7v7h-7V4Zm2 2v3h3V6h-3ZM4 13h7v7H4v-7Zm2 2v3h3v-3H6Zm7-2h7v7h-7v-7Zm2 2v3h3v-3h-3Z" /></svg>;
}
function UserSettingsIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-6 1.7-6 3.8V20h9.2a6 6 0 0 1 .8-5.4A9.6 9.6 0 0 0 9 14Zm9-2 1 2 2.2.3-1.6 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.6L17 14l1-2Z" /></svg>;
}
function WalletIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h14a2 2 0 0 1 2 2v1h-6a4 4 0 0 0 0 8h6v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm10 5h7v4h-7a2 2 0 1 1 0-4Zm0 1.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM4 4h12v1H4V4Z" /></svg>;
}
function MoneyIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v12H3V6Zm2 3a3 3 0 0 0 3-1H5v1Zm0 6v1h3a3 3 0 0 0-3-1Zm14 1v-1a3 3 0 0 0-3 1h3Zm0-8h-3a3 3 0 0 0 3 1V8Zm-7 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>;
}
function ReportIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h16v18H4V3Zm3 14h2v-6H7v6Zm4 0h2V7h-2v10Zm4 0h2v-4h-2v4Z" /></svg>;
}
function CoinIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15.9V20h-2v-2.1a4.2 4.2 0 0 1-3-1.7l1.4-1.4c.6.8 1.4 1.2 2.5 1.2 1 0 1.6-.4 1.6-1.1 0-.8-.8-1-2.2-1.4-1.5-.4-3-1-3-3 0-1.6 1.1-2.7 2.7-3V5h2v1.7c1 .2 1.8.6 2.4 1.3L15 9.4c-.6-.6-1.2-.9-2.1-.9-.9 0-1.4.4-1.4 1 0 .7.7.9 2 1.3 1.6.5 3.2 1.1 3.2 3.2 0 1.7-1.1 3-3.7 3.9Z" /></svg>;
}
function ApplicantIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.5-3.4 3.4-6 7-6s6.5 2.6 7 6H5Z" /></svg>;
}
function DocumentIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM8 11h8v2H8v-2Zm0 4h8v2H8v-2Z" /></svg>;
}
function IdCardIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M9 2h6v3h5v16H4V5h5V2Zm2 2v3h2V4h-2ZM6 7v12h12V7h-3v2H9V7H6Zm5 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-5 5c.4-2 2-3 3-3s2.6 1 3 3H6Zm7-5h4v2h-4v-2Zm0 4h4v2h-4v-2Z" /></svg>;
}
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm-7-4h14v-2l-2-2.5V10a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v3.5L5 16v2Z" /></svg>;
}
function UserCircleIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 5.5 13.8C16.7 15.6 14.6 14 12 14s-4.7 1.6-5.5 3.8A8 8 0 0 1 12 4Zm0 2.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /></svg>;
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m11 18-6-6 6-6 1.4 1.4-3.6 3.6H20v2H8.8l3.6 3.6L11 18Z" /></svg>;
}
function XIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m6.4 5 12.6 12.6-1.4 1.4L5 6.4 6.4 5Zm12.6 1.4L6.4 19 5 17.6 17.6 5 19 6.4Z" /></svg>;
}
function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m9.5 16.2-4.2-4.2 1.4-1.4 2.8 2.8 7.8-7.8 1.4 1.4-9.2 9.2Z" /></svg>;
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h9v2H6v12h7v2H4V4Zm11.5 4.5 1.4-1.4L22 12l-5.1 4.9-1.4-1.4L18 13h-8v-2h8l-2.5-2.5Z" /></svg>;
}
