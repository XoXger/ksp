"use client";

import {
  PrintMemberReportButton,
  type MemberReportData,
} from "@/components/PrintMemberReportButton";
import { useEffect, useState } from "react";

const menuItems = [
  { label: "Beranda", icon: HomeIcon, href: "/anggota", active: true },
  { label: "Simpanan", icon: WalletIcon, href: "/simpanan" },
  { label: "Pinjaman", icon: MoneyIcon, href: "/pinjaman" },
  { label: "SHU", icon: TrendIcon, href: "/shu" },
  { label: "Simulasi Pinjaman", icon: CalculatorIcon, href: "/simulasi-pinjaman" },
];

export type MemberDashboardStats = {
  savingsCount: number;
  loansCount: number;
  totalTransactions: number;
  totalSavings: string;
};

export function MemberDashboardView({
  report,
  stats,
}: {
  report: MemberReportData;
  stats: MemberDashboardStats;
}) {
  const [tabMemberId, setTabMemberId] = useState<string | null>(null);
  const [profileHref, setProfileHref] = useState("/anggota/profil");
  const withTabSession = (href: string) => {
    if (!tabMemberId) {
      return href;
    }

    const separator = href.includes("?") ? "&" : "?";

    return `${href}${separator}anggotaId=${encodeURIComponent(tabMemberId)}`;
  };

  useEffect(() => {
    const currentMemberId = new URL(window.location.href).searchParams.get("anggotaId");
    const storedMemberId = sessionStorage.getItem("koperasi.memberTabIdentity");
    const memberId = currentMemberId ?? storedMemberId;

    if (!memberId) {
      return;
    }

    sessionStorage.setItem("koperasi.memberTabIdentity", memberId);
    setTabMemberId(memberId);
    setProfileHref(`/anggota/profil?anggotaId=${encodeURIComponent(memberId)}`);
  }, []);

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#10231d] lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <aside className="hidden w-[230px] shrink-0 flex-col bg-[#185440] px-5 py-6 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#185440]">
              <BankIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-extrabold uppercase">
                Tarunajaya
              </p>
              <p className="text-xs text-[#c7ddd3]">Koperasi Simpan Pinjam</p>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10" />

          <nav className="mt-8 space-y-3">
            {menuItems.map((item) => (
              <a
                className={`flex h-11 items-center gap-3 rounded-md px-4 text-sm font-semibold ${
                  item.active
                    ? "bg-[#075f48] text-white"
                    : "text-[#9bc4b4] hover:bg-[#0f6049] hover:text-white"
                }`}
                href={withTabSession(item.href)}
                key={item.label}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-8">
            <a
              className="flex h-10 items-center gap-3 px-4 text-sm font-semibold text-[#9bc4b4] hover:text-white"
              href="/logout"
            >
              <LogoutIcon className="h-5 w-5" />
              Keluar
            </a>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dcdcc0] bg-white px-5 sm:px-7 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                aria-label="Buka menu"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#185440] text-white lg:hidden"
                type="button"
              >
                <GridIcon className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-[#0f4333] sm:text-xl">
                Dashboard Anggota
              </h1>
            </div>
            <div className="flex items-center gap-5 text-[#1c2c27]">
<a
                aria-label="Buka profil anggota"
                className="transition hover:text-[#075f48]"
                href={profileHref}
              >
                <UserIcon className="h-6 w-6" />
              </a>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <SummaryCard
                    icon={<WalletIcon className="h-5 w-5" />}
                    label="Simpananmu"
                    value={stats.savingsCount.toString()}
                    color="bg-[#b7efd9]"
                  />
                  <SummaryCard
                    icon={<MoneyIcon className="h-5 w-5" />}
                    label="Pinjamanmu"
                    value={stats.loansCount.toString()}
                    color="bg-[#ffd8d4]"
                  />
                  <SummaryCard
                    icon={<ReceiptIcon className="h-5 w-5" />}
                    label="Total Transaksi"
                    value={stats.totalTransactions.toString()}
                    color="bg-[#e7e6c9]"
                  />
                </div>

                <div className="flex min-h-[360px] flex-col rounded-2xl bg-[radial-gradient(circle_at_80%_20%,#1d624d_0,#0a4433_42%,#063d2e_100%)] p-6 text-white shadow-[0_18px_34px_rgba(23,79,62,0.2)]">
                  <div className="flex items-center gap-3 text-sm font-extrabold text-[#d6e7df]">
                    <BankIcon className="h-5 w-5" />
                    Total Saldo Aktif
                  </div>
                  <p className="mt-6 text-4xl font-extrabold xl:text-5xl">
                    {stats.totalSavings}
                  </p>
                  <a
                    className="ml-auto mt-auto inline-flex h-9 w-[112px] items-center justify-center rounded-full border border-[#c8ddd4] text-[11px] font-extrabold text-white transition hover:bg-white/10"
                    href={withTabSession("/anggota/riwayat")}
                  >
                    Riwayat
                  </a>
                </div>
              </div>

              <div className="space-y-5">
                <PrintMemberReportButton report={report} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-[150px] min-w-0 items-center gap-4 rounded-xl bg-white px-5 shadow-[0_12px_24px_rgba(23,79,62,0.12)] ring-1 ring-black/10 ${className}`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${color}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm leading-tight text-[#29342f]">{label}</p>
        <p className="text-2xl font-bold text-black">{value}</p>
      </div>
    </div>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 3 7.5v2h18v-2L12 3Zm-6 8v6H4v2h16v-2h-2v-6h-2v6h-3v-6h-2v6H8v-6H6Z" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 3 10v11h7v-6h4v6h7V10L12 3Z" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h7v7H4V4Zm2 2v3h3V6H6Zm7-2h7v7h-7V4Zm2 2v3h3V6h-3ZM4 13h7v7H4v-7Zm2 2v3h3v-3H6Zm7-2h7v7h-7v-7Zm2 2v3h3v-3h-3Z" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h14a2 2 0 0 1 2 2v1h-6a4 4 0 0 0 0 8h6v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm10 5h7v4h-7a2 2 0 1 1 0-4Zm0 1.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM4 4h12v1H4V4Z" />
    </svg>
  );
}

function MoneyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 6h18v12H3V6Zm2 3a3 3 0 0 0 3-1H5v1Zm0 6v1h3a3 3 0 0 0-3-1Zm14 1v-1a3 3 0 0 0-3 1h3Zm0-8h-3a3 3 0 0 0 3 1V8Zm-7 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 3h12v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21V3Zm3 5h6V6H9v2Zm0 4h6v-2H9v2Zm0 4h4v-2H9v2Z" />
    </svg>
  );
}

function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 3h10v5H7V3Zm-2 7h14a3 3 0 0 1 3 3v5h-4v3H6v-3H2v-5a3 3 0 0 1 3-3Zm3 7v2h8v-5H8v3Zm10-3h2v-1h-2v1Z" />
    </svg>
  );
}

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 16.5 9.5 11l3 3L20 6.5V12h2V3h-9v2h5.5l-6 6-3-3L2.5 15 4 16.5Z" />
    </svg>
  );
}

function CalculatorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14v18H5V3Zm3 3v4h8V6H8Zm0 7v2h2v-2H8Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Zm-8 4v2h2v-2H8Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h9v2H6v12h7v2H4V4Zm11.5 4.5 1.4-1.4L22 12l-5.1 4.9-1.4-1.4L18 13h-8v-2h8l-2.5-2.5Z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm-7-4h14v-2l-2-2.5V10a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v3.5L5 16v2Z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 15a7.96 7.96 0 0 1-5.5-2.19C7.25 15.55 9.38 14 12 14s4.75 1.55 5.5 3.81A7.96 7.96 0 0 1 12 20Z" />
    </svg>
  );
}

function PieIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 2h2v9h9v2h-9v9h-2v-9H2v-2h9V2Zm4 1.3A10 10 0 0 1 20.7 9H15V3.3Z" />
    </svg>
  );
}
