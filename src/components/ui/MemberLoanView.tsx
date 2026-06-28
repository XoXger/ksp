"use client";

import { useState } from "react";

const loanMenuItems = [
  { label: "Beranda", icon: HomeIcon, href: "/anggota" },
  { label: "Simpanan", icon: WalletIcon, href: "/simpanan" },
  { label: "Pinjaman", icon: MoneyIcon, href: "/pinjaman", active: true },
  { label: "SHU", icon: TrendIcon, href: "/shu" },
  { label: "Simulasi Pinjaman", icon: CalculatorIcon, href: "/simulasi-pinjaman" },
];

export type MemberLoanRowData = {
  id: string;
  date: string;
  amount: string;
  interest: string;
  interestType: string;
  tenor: string;
  status: "Menunggu" | "Terutang" | "Lunas" | "Ditolak";
};

export type MemberLoanSummaryData = {
  activeLoanCount: number;
  hasNextPayment: boolean;
  nextPaymentDueDate: string;
  nextPaymentAmount: string;
  totalLoanAmount: string;
};

export type MemberLoanActivityData = {
  title: string;
  detail: string;
  done: boolean;
};

export function MemberLoanView({
  activities,
  canApplyNewLoan,
  newLoanBlockedMessage,
  loans,
  summary,
}: {
  activities: MemberLoanActivityData[];
  canApplyNewLoan: boolean;
  newLoanBlockedMessage: string;
  loans: MemberLoanRowData[];
  summary: MemberLoanSummaryData;
}) {
  const [isLoanInfoMinimized, setIsLoanInfoMinimized] = useState(false);
  const [isLoanLimitDialogOpen, setIsLoanLimitDialogOpen] = useState(false);

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
            {loanMenuItems.map((item) => (
              <a
                className={`flex h-11 items-center gap-3 rounded-md px-4 text-sm font-semibold ${
                  item.active
                    ? "bg-[#075f48] text-white"
                    : "text-[#9bc4b4] hover:bg-[#0f6049] hover:text-white"
                }`}
                href={item.href}
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

        <section className="flex min-w-0 flex-1 flex-col bg-[#fbfcdf]">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#d8d6cd] bg-white px-5 sm:px-7 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                aria-label="Buka menu"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#185440] text-white lg:hidden"
                type="button"
              >
                <HomeIcon className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-[#0f4333] sm:text-xl">
                Dashboard Overview
              </h1>
            </div>
            <div className="flex items-center justify-end text-[#756f68]">
</div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
              <div>
                <h2 className="text-3xl font-bold text-[#063f30]">
                  Pinjaman
                </h2>
                <p className="mt-2 text-base text-[#26322e]">
                  Kelola dan pantau aktivitas pinjaman anggota secara real-time.
                </p>
              </div>
              <button
                className="flex h-12 items-center gap-3 rounded-full bg-[#185440] px-7 text-sm font-extrabold uppercase text-white shadow-[0_12px_20px_rgba(23,79,62,0.16)] transition hover:bg-[#0f4333]"
                onClick={() => {
                  if (canApplyNewLoan) {
                    window.location.href = "/pinjaman/baru";
                    return;
                  }

                  setIsLoanLimitDialogOpen(true);
                }}
                type="button"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Ajukan Pinjaman Baru
              </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="relative flex min-h-[276px] flex-col overflow-hidden rounded-xl bg-[#185440] p-6 text-white shadow-[0_16px_28px_rgba(23,79,62,0.16)]">
                    <p className="text-sm font-extrabold uppercase text-[#d0e5dc]">
                      Total Pinjaman
                    </p>
                    <p className="mt-auto text-4xl font-extrabold">
                      {summary.totalLoanAmount}
                    </p>
                    <BankIcon className="absolute bottom-5 right-6 h-24 w-24 text-white/12" />
                  </div>

                  <InfoCard
                    icon={<ClipboardIcon className="h-6 w-6" />}
                    title="Pinjaman Aktif"
                    value={`${summary.activeLoanCount} Pinjaman`}
                  />
                  <InfoCard
                    icon={<CalendarIcon className="h-6 w-6" />}
                    actionLabel="Bayar Tagihan"
                    actionHref="/pinjaman/bayar-tagihan"
                    title="Pembayaran Berikutnya"
                    value={summary.nextPaymentAmount}
                    note={
                      summary.hasNextPayment
                        ? `Jatuh tempo ${summary.nextPaymentDueDate}`
                        : undefined
                    }
                  />
                </div>

                <section
                  className={`flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_10px_24px_rgba(23,79,62,0.08)] ring-1 ring-black/15 ${
                    isLoanInfoMinimized ? "" : "min-h-[430px]"
                  }`}
                >
                  <div className="flex items-center justify-between p-6">
                    <h3 className="text-2xl font-bold text-[#063f30]">
                      Informasi Pinjaman
                    </h3>
                    <button
                      aria-expanded={!isLoanInfoMinimized}
                      aria-label={
                        isLoanInfoMinimized
                          ? "Tampilkan informasi pinjaman"
                          : "Minimize informasi pinjaman"
                      }
                      className="grid h-9 w-9 place-items-center rounded-md text-[#063f30] transition hover:bg-[#f2f1ed]"
                      onClick={() =>
                        setIsLoanInfoMinimized((isMinimized) => !isMinimized)
                      }
                      type="button"
                    >
                      <MenuLinesIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div
                    className={`flex-1 overflow-x-auto ${
                      isLoanInfoMinimized ? "hidden" : "block"
                    }`}
                  >
                    <table className="w-full min-w-[860px] border-collapse text-left">
                      <thead className="bg-[#f2f1ed] text-sm font-extrabold uppercase text-[#26322e]">
                        <tr>
                          <th className="px-6 py-4">ID Pinjaman</th>
                          <th className="px-6 py-4">Tanggal</th>
                          <th className="px-6 py-4">Nominal</th>
                          <th className="px-6 py-4">Bunga</th>
                          <th className="px-6 py-4">Tipe</th>
                          <th className="px-6 py-4">Jangka Waktu</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dedbd4] text-base">
                        {loans.length > 0 ? (
                          loans.map((loan) => (
                            <tr key={loan.id}>
                              <td className="px-6 py-5">{loan.id}</td>
                              <td className="px-6 py-5">{loan.date}</td>
                              <td className="px-6 py-5">{loan.amount}</td>
                              <td className="px-6 py-5">{loan.interest}</td>
                              <td className="px-6 py-5">{loan.interestType}</td>
                              <td className="px-6 py-5">{loan.tenor}</td>
                              <td className="px-6 py-5">
                                <LoanStatusBadge status={loan.status} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="px-6 py-8 text-center text-[#69716d]"
                              colSpan={7}
                            >
                              Belum ada data pinjaman.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="min-h-[276px] rounded-xl bg-white p-6 shadow-[0_10px_24px_rgba(23,79,62,0.08)] ring-1 ring-black/15">
                  <h3 className="text-2xl font-bold text-[#063f30]">
                    Aktivitas Terkini
                  </h3>
                  <div className="mt-8 space-y-7">
                    {activities.length > 0 ? (
                      activities.map((activity) => (
                        <ActivityItem
                          key={`${activity.title}-${activity.detail}`}
                          {...activity}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-[#69716d]">
                        Belum ada aktivitas pinjaman.
                      </p>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </div>
      {isLoanLimitDialogOpen ? (
        <div
          aria-label="Batas pengajuan pinjaman"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-black/10">
            <h3 className="text-xl font-extrabold text-[#0b1210]">
              Pengajuan Tidak Dapat Dilanjutkan
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#35423d]">
              {newLoanBlockedMessage}
            </p>
            <button
              className="mt-6 h-11 rounded-full bg-[#185440] px-8 text-sm font-extrabold text-white transition hover:bg-[#0f4333]"
              onClick={() => setIsLoanLimitDialogOpen(false)}
              type="button"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function LoanStatusBadge({ status }: { status: string }) {
  const statusClassName =
    {
      Menunggu: "bg-[#dedcc2] text-[#26322e]",
      Terutang: "bg-[#ffe1a4] text-[#8a4600]",
      Lunas: "bg-[#b9efd9] text-[#075f48]",
      Ditolak: "bg-[#ffd1d1] text-[#c00000]",
    }[status] ?? "bg-[#e7e7e0] text-[#26322e]";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-extrabold ${statusClassName}`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function InfoCard({
  actionLabel,
  actionHref,
  title,
  value,
  note,
  icon,
}: {
  actionLabel?: string;
  actionHref?: string;
  title: string;
  value: string;
  note?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[276px] flex-col rounded-xl bg-white p-6 shadow-[0_10px_24px_rgba(23,79,62,0.08)] ring-1 ring-black/15">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-extrabold uppercase text-[#26322e]">
          {title}
        </p>
        {icon}
      </div>
      <div className="mt-auto">
        <p className="text-3xl font-medium text-[#063f30]">{value}</p>
      {note ? <p className="mt-2 text-sm">{note}</p> : null}
      {actionLabel && note ? (
        <a
          className="mt-5 flex h-10 w-full items-center justify-center rounded-full bg-[#185440] text-sm font-extrabold text-white shadow-[0_10px_18px_rgba(23,79,62,0.16)] transition hover:bg-[#0f4333]"
          href={actionHref ?? "#"}
        >
          {actionLabel}
        </a>
      ) : null}
      </div>
    </div>
  );
}

function ActivityItem({
  title,
  detail,
  done,
}: {
  title: string;
  detail: string;
  done: boolean;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr] gap-4">
      <span
        className={`grid h-7 w-7 place-items-center rounded-full ${
          done ? "bg-[#b9efd9] text-[#063f30]" : "bg-[#e7e7e0] text-[#26322e]"
        }`}
      >
        {done ? "✓" : <FileIcon className="h-4 w-4" />}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-[#26322e]">{detail}</p>
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

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h14a2 2 0 0 1 2 2v1h-6a4 4 0 0 0 0 8h6v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm10 5h7v4h-7a2 2 0 1 1 0-4Z" />
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

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v4h4v2h-4v4h-2v-4H7v-2h4V7h2Z" />
    </svg>
  );
}

function MenuLinesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2h6l1 2h3v18H5V4h3l1-2Zm1 4v2h4V6h-4Zm-2 5h8v2H8v-2Zm0 4h8v2H8v-2Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm-1 8v10h12V10H6Zm3 2h6v2H9v-2Z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5Z" />
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

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h9v2H6v12h7v2H4V4Zm11.5 4.5 1.4-1.4L22 12l-5.1 4.9-1.4-1.4L18 13h-8v-2h8l-2.5-2.5Z" />
    </svg>
  );
}
