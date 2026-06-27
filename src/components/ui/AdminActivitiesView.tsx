"use client";

import { useState } from "react";
import type { AdminDashboardActivity } from "./AdminDashboardView";

const adminMenuItems = [
  { label: "Beranda", icon: GridIcon, href: "/dashboard" },
  { label: "Kelola Akun", icon: UserSettingsIcon, href: "/dashboard/akun" },
  { label: "Kelola Simpanan", icon: WalletIcon, href: "/dashboard/simpanan" },
  { label: "Kelola Pinjaman", icon: MoneyIcon, href: "/dashboard/pinjaman" },
  { label: "Laporan Koperasi", icon: ReportIcon, href: "/dashboard/laporan" },
  { label: "SHU", icon: CoinIcon, href: "/dashboard/shu" },
];

const activityIcons = {
  savings: PiggyIcon,
  loan: ApproveIcon,
  member: UserPlusIcon,
  installment: MoneyIcon,
} satisfies Record<
  AdminDashboardActivity["iconType"],
  (props: { className?: string }) => React.ReactNode
>;

export function AdminActivitiesView({
  activities,
}: {
  activities: AdminDashboardActivity[];
}) {
  const [activitiesOpen, setActivitiesOpen] = useState(true);

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#10231d] lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <aside className="hidden w-[230px] shrink-0 flex-col bg-[#185440] px-5 py-6 text-white shadow-[10px_0_28px_rgba(23,79,62,0.18)] lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#185440]">
              <BankIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-extrabold uppercase">KSP</p>
              <p className="text-lg font-extrabold uppercase">Tarunajaya</p>
              <p className="mt-0.5 text-xs font-semibold text-[#89bea9]">
                Admin Portal
              </p>
            </div>
          </div>

          <nav className="mt-12 space-y-3">
            {adminMenuItems.map((item) => (
              <a
                className="relative flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold text-[#8fc0ab] hover:bg-[#0f6049] hover:text-white"
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
                Dashboard Admin
              </h1>
            </div>
            <div className="flex items-center gap-5 text-[#6b665f]">
</div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
            <a
              className="mb-7 inline-flex items-center gap-3 text-base font-medium text-[#10231d] hover:text-[#075f48] hover:underline"
              href="/dashboard"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Kembali
            </a>

            <div className="mb-7">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Riwayat Aktivitas Koperasi
              </h2>
            </div>

            <section className="rounded-xl bg-white p-6 shadow-[0_12px_28px_rgba(23,79,62,0.11)] ring-1 ring-black/10">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-extrabold">Aktivitas Terkini</h3>
                <button
                  aria-expanded={activitiesOpen}
                  aria-label={
                    activitiesOpen
                      ? "Minimize aktivitas terkini"
                      : "Tampilkan aktivitas terkini"
                  }
                  className="grid h-9 w-9 place-items-center rounded-md text-[#10231d] transition hover:bg-[#f0f1d5]"
                  onClick={() => setActivitiesOpen((isOpen) => !isOpen)}
                  type="button"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>

              {activitiesOpen ? (
                <div className="space-y-5">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <ActivityRow
                        key={`${activity.title}-${activity.subtitle}-${activity.time}`}
                        {...activity}
                        icon={activityIcons[activity.iconType]}
                      />
                    ))
                  ) : (
                    <p className="py-8 text-center text-[#69716d]">
                      Belum ada aktivitas koperasi.
                    </p>
                  )}
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function ActivityRow({
  title,
  subtitle,
  time,
  amount,
  tone,
  icon: Icon,
}: AdminDashboardActivity & {
  icon: (props: { className?: string }) => React.ReactNode;
}) {
  const amountClass = tone === "red" ? "text-[#4b0f0f]" : "text-[#009560]";
  const iconClass =
    tone === "red" ? "bg-[#f4e8e8] text-[#4b0f0f]" : "bg-[#f0f1d5]";

  return (
    <div className="grid grid-cols-[36px_1fr_auto] items-start gap-4">
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ${iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-base font-bold">{title}</p>
        <p className="mt-0.5 text-sm">{subtitle}</p>
        <p className="mt-1 text-xs text-[#6b6f6a]">{time}</p>
      </div>
      {amount ? (
        <p className={`pt-1 text-base font-extrabold ${amountClass}`}>
          {amount}
        </p>
      ) : (
        <span />
      )}
    </div>
  );
}

function BankIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 3 7.5v2h18v-2L12 3Zm-6 8v6H4v2h16v-2h-2v-6h-2v6h-3v-6h-2v6H8v-6H6Z" /></svg>; }
function GridIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h7v7H4V4Zm2 2v3h3V6H6Zm7-2h7v7h-7V4Zm2 2v3h3V6h-3ZM4 13h7v7H4v-7Zm2 2v3h3v-3H6Zm7-2h7v7h-7v-7Zm2 2v3h3v-3h-3Z" /></svg>; }
function UserSettingsIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-6 1.7-6 3.8V20h9.2a6 6 0 0 1 .8-5.4A9.6 9.6 0 0 0 9 14Zm9-2 1 2 2.2.3-1.6 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.6L17 14l1-2Z" /></svg>; }
function WalletIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h14a2 2 0 0 1 2 2v1h-6a4 4 0 0 0 0 8h6v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm10 5h7v4h-7a2 2 0 1 1 0-4Z" /></svg>; }
function MoneyIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v12H3V6Zm2 3a3 3 0 0 0 3-1H5v1Zm0 6v1h3a3 3 0 0 0-3-1Zm14 1v-1a3 3 0 0 0-3 1h3Zm0-8h-3a3 3 0 0 0 3 1V8Zm-7 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>; }
function ReportIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h16v18H4V3Zm3 14h2v-6H7v6Zm4 0h2V7h-2v10Zm4 0h2v-4h-2v4Z" /></svg>; }
function CoinIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15.9V20h-2v-2.1a4.2 4.2 0 0 1-3-1.7l1.4-1.4c.6.8 1.4 1.2 2.5 1.2 1 0 1.6-.4 1.6-1.1 0-.8-.8-1-2.2-1.4-1.5-.4-3-1-3-3 0-1.6 1.1-2.7 2.7-3V5h2v1.7c1 .2 1.8.6 2.4 1.3L15 9.4c-.6-.6-1.2-.9-2.1-.9-.9 0-1.4.4-1.4 1 0 .7.7.9 2 1.3 1.6.5 3.2 1.1 3.2 3.2 0 1.7-1.1 3-3.7 3.9Z" /></svg>; }
function LogoutIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h9v2H6v12h7v2H4V4Zm11.5 4.5 1.4-1.4L22 12l-5.1 4.9-1.4-1.4L18 13h-8v-2h8l-2.5-2.5Z" /></svg>; }
function BellIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm-7-4h14v-2l-2-2.5V10a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v3.5L5 16v2Z" /></svg>; }
function MenuIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 7h16v2H4V7Zm0 4h16v2H4v-2Zm0 4h16v2H4v-2Z" /></svg>; }
function ArrowLeftIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m10 5 1.4 1.4L7.8 10H20v2H7.8l3.6 3.6L10 17l-6-6 6-6Z" /></svg>; }
function PiggyIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 11a5 5 0 0 1 5-5h4a5 5 0 0 1 4.6 3H21v5h-1.4a5 5 0 0 1-2.6 2.5V20h-3v-2h-4v2H7v-3.5A5 5 0 0 1 4.1 13H2v-2h4Zm10-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" /></svg>; }
function ApproveIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 17.5 4 12l1.4-1.4 4.1 4.1L18.6 5.6 20 7 9.5 17.5Z" /></svg>; }
function UserPlusIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-6 1.7-6 3.8V20h9v-2h2v-2.9A9.8 9.8 0 0 0 9 14Zm10 1v-3h-2v3h-3v2h3v3h2v-3h3v-2h-3Z" /></svg>; }
