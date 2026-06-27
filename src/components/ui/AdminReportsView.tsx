"use client";

import { DownloadReportExcelButton } from "@/components/DownloadReportExcelButton";
import { useState } from "react";

const menuItems = [
  { label: "Beranda", icon: GridIcon, href: "/dashboard" },
  { label: "Kelola Akun", icon: UserSettingsIcon, href: "/dashboard/akun" },
  { label: "Kelola Simpanan", icon: WalletIcon, href: "/dashboard/simpanan" },
  { label: "Kelola Pinjaman", icon: MoneyIcon, href: "/dashboard/pinjaman" },
  {
    label: "Laporan Koperasi",
    icon: ReportIcon,
    href: "/dashboard/laporan",
    active: true,
  },
  { label: "SHU", icon: CoinIcon, href: "/dashboard/shu" },
];

export type ReportRowData = {
  category:
    | "Simpanan Pokok"
    | "Simpanan Wajib"
    | "Simpanan Sukarela"
    | "Angsuran Pinjaman"
    | "Pencairan Pinjaman";
  transactions: string;
  amount: string;
  tone: "green" | "red";
};

export type ReportCashFlowSummary = {
  cashIn: string;
  cashOut: string;
  netBalance: string;
  netBalancePercentage: number;
};

const reportRowIcons = {
  "Simpanan Pokok": PiggyIcon,
  "Simpanan Wajib": WalletIcon,
  "Simpanan Sukarela": SavingsIcon,
  "Angsuran Pinjaman": ReceiptCheckIcon,
  "Pencairan Pinjaman": MoneyOutIcon,
} as const;

const defaultReportRows: ReportRowData[] = [
  {
    category: "Simpanan Pokok",
    transactions: "0",
    amount: "+ 0",
    tone: "green",
  },
  {
    category: "Simpanan Wajib",
    transactions: "0",
    amount: "+ 0",
    tone: "green",
  },
  {
    category: "Simpanan Sukarela",
    transactions: "0",
    amount: "+ 0",
    tone: "green",
  },
  {
    category: "Angsuran Pinjaman",
    transactions: "0",
    amount: "+ 0",
    tone: "green",
  },
  {
    category: "Pencairan Pinjaman",
    transactions: "0",
    amount: "- 0",
    tone: "red",
  },
] as const;

export function AdminReportsView({
  cashFlowSummary = {
    cashIn: "Rp 0",
    cashOut: "Rp 0",
    netBalance: "Rp 0",
    netBalancePercentage: 0,
  },
  reportRows = defaultReportRows,
}: {
  cashFlowSummary?: ReportCashFlowSummary;
  reportRows?: ReportRowData[];
}) {
  const [isReportDetailMinimized, setIsReportDetailMinimized] = useState(false);
  const reportExcelRows = reportRows.map(({ category, transactions, amount }) => ({
    category,
    transactions,
    amount,
  }));

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#06251d] lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <AdminSidebar />

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
              <h1 className="text-xl font-extrabold text-[#0f4333]">
                Dashboard Overview
              </h1>
            </div>
            <div className="flex items-center text-[#5c6b86]">
</div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
            <section className="rounded-xl bg-white p-6 shadow-[0_10px_24px_rgba(23,79,62,0.09)] ring-1 ring-black/10">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    Laporan Koperasi
                  </h2>
                  <p className="mt-2 text-base text-[#26322e]">
                    Ringkasan aktivitas keuangan dan operasional
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex items-center gap-3 text-base font-medium text-[#10231d]">
                    <span>Periode:</span>
                    <span className="relative flex h-12 items-center rounded-lg bg-[#f0f0d8]">
                    <select
                      className="h-full appearance-none rounded-lg bg-transparent pl-5 pr-10 outline-none"
                      defaultValue="Bulan ini"
                    >
                      <option>Bulan ini</option>
                      <option>Tahun ini</option>
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-4 h-4 w-4 text-[#5c6b86]" />
                    </span>
                  </label>
                  <DownloadReportExcelButton rows={reportExcelRows} />
                </div>
              </div>
            </section>

            <section className="mt-7 grid gap-5 xl:grid-cols-[240px_240px_1fr]">
              <CashFlowCard
                title="Arus Kas Masuk"
                value={cashFlowSummary.cashIn}
                detail="Berdasarkan rincian laporan"
                tone="green"
                icon={<ArrowDownIcon className="h-7 w-7" />}
              />
              <CashFlowCard
                title="Arus Kas Keluar"
                value={cashFlowSummary.cashOut}
                detail="Berdasarkan rincian laporan"
                tone="red"
                icon={<ArrowUpIcon className="h-7 w-7" />}
              />
              <section className="rounded-xl bg-white p-6 shadow-[0_10px_24px_rgba(23,79,62,0.1)] ring-1 ring-black/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e7e7cc] text-[#10231d]">
                      <BankIcon className="h-7 w-7" />
                    </span>
                    <p className="text-sm font-extrabold">
                      Saldo Bersih
                    </p>
                  </div>
                </div>
                <p className="mt-16 text-2xl font-medium">
                  {cashFlowSummary.netBalance}
                </p>
                <div className="mt-5 h-2 rounded-full bg-[#e9e7c9]">
                  <div
                    className="h-full rounded-full bg-[#034d3b]"
                    style={{ width: `${cashFlowSummary.netBalancePercentage}%` }}
                  />
                </div>
              </section>
            </section>

            <section className="mt-7 overflow-hidden rounded-xl bg-white shadow-[0_12px_28px_rgba(23,79,62,0.11)] ring-1 ring-black/10">
              <div className="flex items-center justify-between border-b border-[#e7e7dc] p-6">
                <h2 className="text-xl font-extrabold">Rincian Laporan</h2>
                <button
                  aria-expanded={!isReportDetailMinimized}
                  aria-label={
                    isReportDetailMinimized
                      ? "Tampilkan rincian laporan"
                      : "Minimize rincian laporan"
                  }
                  className="grid h-9 w-9 place-items-center rounded-md text-[#10231d] transition hover:bg-[#f0f1d5]"
                  onClick={() =>
                    setIsReportDetailMinimized((isMinimized) => !isMinimized)
                  }
                  type="button"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>

              <div
                className={`overflow-x-auto ${
                  isReportDetailMinimized ? "hidden" : "block"
                }`}
              >
                <table className="w-full min-w-[760px] border-collapse">
                  <thead className="bg-[#fbfbf3]">
                    <tr className="text-left text-sm font-extrabold text-[#26322e]">
                      <th className="px-7 py-4">Kategori</th>
                      <th className="px-5 py-4">Total Transaksi</th>
                      <th className="px-7 py-4 text-right">Nominal (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.map((row) => (
                      <ReportRow
                        key={row.category}
                        {...row}
                        icon={reportRowIcons[row.category]}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
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
          <p className="text-lg font-extrabold uppercase">
            KSP
          </p>
          <p className="text-lg font-extrabold uppercase">
            Tarunajaya
          </p>
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

function CashFlowCard({
  title,
  value,
  detail,
  tone,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  tone: "green" | "red";
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === "green"
      ? "bg-[#185440] text-[#bde9d7]"
      : "bg-[#733a31] text-[#f4bbb0]";
  const iconClass = tone === "green" ? "bg-[#b8f2df]" : "bg-[#ffd1d1]";

  return (
    <section
      className={`relative min-h-[170px] overflow-hidden rounded-xl p-6 shadow-[0_12px_24px_rgba(23,79,62,0.16)] ${toneClass}`}
    >
      <span
        className={`grid h-12 w-12 place-items-center rounded-full ${iconClass} text-[#06251d]`}
      >
        {icon}
      </span>
      <div className="absolute -right-8 top-7 h-24 w-24 rounded-full bg-black/8" />
      <p className="absolute left-20 top-7 text-sm font-extrabold">
        {title}
      </p>
      <p className="mt-4 text-2xl font-medium leading-tight text-white">
        {value.replace(" ", "\n")}
      </p>
      <p className="mt-3 text-sm leading-relaxed">{detail}</p>
    </section>
  );
}

function ReportRow({
  category,
  transactions,
  amount,
  tone,
  icon: Icon,
}: {
  category: string;
  transactions: string;
  amount: string;
  tone: "green" | "red";
  icon: (props: { className?: string }) => React.ReactNode;
}) {
  return (
    <tr className="border-t border-[#eeeeea] text-base">
      <td className="px-7 py-5">
        <div className="flex items-center gap-4">
          <Icon className="h-6 w-6 text-[#727b75]" />
          <span>{category}</span>
        </div>
      </td>
      <td className="px-5 py-5">{transactions}</td>
      <td
        className={`px-7 py-5 text-right font-extrabold ${
          tone === "green" ? "text-black" : "text-[#d00000]"
        }`}
      >
        {amount}
      </td>
    </tr>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 3 7.5v2h18v-2L12 3Zm-6 8v6H4v2h16v-2h-2v-6h-2v6h-3v-6h-2v6H8v-6H6Z" />
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

function UserSettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-6 1.7-6 3.8V20h9.2a6 6 0 0 1 .8-5.4A9.6 9.6 0 0 0 9 14Zm9-2 1 2 2.2.3-1.6 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.6L17 14l1-2Z" />
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

function SavingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.1 6.5 12 6.6l-.1-.1a2.8 2.8 0 0 0-4 4L12 14.7l4.1-4.2a2.8 2.8 0 0 0-4-4ZM3 14h4.5l2 2H14a2 2 0 0 1 1.7.9l4.3-2.5 1 1.7-6.3 3.7H9.2L6.7 17H3v-3Z" />
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

function ReportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 3h16v18H4V3Zm3 14h2v-6H7v6Zm4 0h2V7h-2v10Zm4 0h2v-4h-2v4Z" />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15.9V20h-2v-2.1a4.2 4.2 0 0 1-3-1.7l1.4-1.4c.6.8 1.4 1.2 2.5 1.2 1 0 1.6-.4 1.6-1.1 0-.8-.8-1-2.2-1.4-1.5-.4-3-1-3-3 0-1.6 1.1-2.7 2.7-3V5h2v1.7c1 .2 1.8.6 2.4 1.3L15 9.4c-.6-.6-1.2-.9-2.1-.9-.9 0-1.4.4-1.4 1 0 .7.7.9 2 1.3 1.6.5 3.2 1.1 3.2 3.2 0 1.7-1.1 3-3.7 3.9Z" />
    </svg>
  );
}

function PiggyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6h2.5L21 8.5V13l-2 1v3h-3v-2H9v2H6v-2.3A5.9 5.9 0 0 1 3 9.5V8H1V6h4.2A7 7 0 0 1 16 6Zm1 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}

function ReceiptCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h16v14H8l-4 3V4Zm4 4h8v2H8V8Zm0 4h5v2H8v-2Zm8.3-.7-3.3 3.3-1.8-1.8-1.2 1.2 3 3 4.5-4.5-1.2-1.2Z" />
    </svg>
  );
}

function MoneyOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 6h18v12H3V6Zm2 2v8h14V8H5Zm7 7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm7.4 4.4L18 20.8 14.2 17H17v-2h-6v6h2v-2.8l3.6 3.6 2.8-2.4Z" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 4h2v12l4-4 1.4 1.4L12 19.8l-6.4-6.4L7 12l4 4V4Z" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m12 4.2 6.4 6.4L17 12l-4-4v12h-2V8l-4 4-1.4-1.4L12 4.2Z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m7.4 8.6 4.6 4.6 4.6-4.6L18 10l-6 6-6-6 1.4-1.4Z" />
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

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 7h16v2H4V7Zm0 4h16v2H4v-2Zm0 4h16v2H4v-2Z" />
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
