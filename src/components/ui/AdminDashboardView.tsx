"use client";

import { useState } from "react";

const adminMenuItems = [
  { label: "Beranda", icon: GridIcon, href: "/dashboard", active: true },
  { label: "Kelola Akun", icon: UserSettingsIcon, href: "/dashboard/akun" },
  { label: "Kelola Simpanan", icon: WalletIcon, href: "/dashboard/simpanan" },
  { label: "Kelola Pinjaman", icon: MoneyIcon, href: "/dashboard/pinjaman" },
  { label: "Laporan Koperasi", icon: ReportIcon, href: "/dashboard/laporan" },
  { label: "SHU", icon: CoinIcon, href: "/dashboard/shu" },
];

type AdminActivityIcon = typeof PiggyIcon;

export type AdminDashboardActivity = {
  title: string;
  subtitle: string;
  time: string;
  amount: string;
  tone: "green" | "red" | "neutral";
  iconType: "savings" | "loan" | "member" | "installment";
};

const activityIcons = {
  savings: PiggyIcon,
  loan: ApproveIcon,
  member: UserPlusIcon,
  installment: MoneyIcon,
} satisfies Record<AdminDashboardActivity["iconType"], AdminActivityIcon>;

const defaultActivities: AdminDashboardActivity[] = [
  {
    title: "Simpanan Wajib Masuk",
    subtitle: "Budi Santoso- ID 8921",
    time: "10 menit yang lalu",
    amount: "+Rp 50rb",
    tone: "green",
    iconType: "savings",
  },
  {
    title: "Pencairan Pinjaman",
    subtitle: "Siti Aminah-ID 7432",
    time: "1 jam yang lalu",
    amount: "-Rp 2,5 Juta",
    tone: "red",
    iconType: "loan",
  },
  {
    title: "Anggota Baru Terdaftar",
    subtitle: "Ahmad Riyadi-ID 9012",
    time: "3 jam yang lalu",
    amount: "",
    tone: "neutral",
    iconType: "member",
  },
  {
    title: "Angsuran Diterima",
    subtitle: "Dewi Lestari-ID 6521",
    time: "5 jam yang lalu",
    amount: "+Rp 450rb",
    tone: "green",
    iconType: "installment",
  },
];

export type AdminDashboardMetrics = {
  netProfit: string;
  totalMembers: string;
  totalLoans: string;
  totalSavings: string;
};

const defaultMetrics: AdminDashboardMetrics = {
  netProfit: "Rp 0",
  totalMembers: "0",
  totalLoans: "Rp 0",
  totalSavings: "Rp 0",
};

export function AdminDashboardView({
  activities = defaultActivities,
  metrics = defaultMetrics,
}: {
  activities?: AdminDashboardActivity[];
  metrics?: AdminDashboardMetrics;
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
            {adminMenuItems.map((item) => (
              <a
                className={`relative flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold ${
                  item.active
                    ? "bg-[#075f48] text-white before:absolute before:left-0 before:h-full before:w-1 before:rounded-full before:bg-[#31d8ad]"
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
<a
                aria-label="Buka profil admin"
                className="transition hover:text-[#185440]"
                href="/dashboard/profil"
              >
                <UserIcon className="h-6 w-6" />
              </a>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold tracking-tight">
                Selamat datang kembali, Admin.
              </h2>
              <p className="mt-2 text-base text-[#26322e]">
                Berikut adalah ringkasan operasional KSP Tarunajaya hari ini.
              </p>
            </div>

            <div className="grid gap-5 xl:grid-cols-[repeat(3,minmax(0,1fr))_220px]">
              <MetricCard
                title="Total Anggota"
                value={metrics.totalMembers}
                detail="Anggota aktif"
                detailTone="text-[#009560]"
                icon={<UsersIcon className="h-7 w-7" />}
              />
              <MetricCard
                title="Total Simpanan"
                value={metrics.totalSavings}
                detail="Total simpanan anggota"
                detailTone="text-[#009560]"
                icon={<WalletIcon className="h-7 w-7" />}
              />
              <MetricCard
                title="Total Pinjaman"
                value={metrics.totalLoans}
                detail="Aktif berputar"
                detailTone="text-[#26322e]"
                icon={<MoneyIcon className="h-7 w-7" />}
              />
              <div className="min-h-[150px] rounded-xl bg-[linear-gradient(135deg,#185440,#5a917b)] p-5 text-white shadow-[0_14px_26px_rgba(23,79,62,0.18)]">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-extrabold text-[#cfe7dd]">
                    Sisa Hasil Usaha
                  </p>
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1a664f]/65 text-[#bde9d7]">
                    <CoinIcon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-7 text-2xl font-extrabold">
                  {metrics.netProfit}
                </p>
              </div>
            </div>

            <section className="mt-7 rounded-xl bg-white p-6 shadow-[0_12px_28px_rgba(23,79,62,0.11)] ring-1 ring-black/10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-extrabold">
                  Aktivitas Terkini
                </h2>
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
                <>
                  <div className="space-y-5">
                    {activities.map((activity) => (
                      <ActivityRow
                        key={`${activity.title}-${activity.subtitle}-${activity.time}`}
                        {...activity}
                        icon={activityIcons[activity.iconType]}
                      />
                    ))}
                  </div>

                  <div className="mt-14 text-center">
                    <a
                      className="text-sm font-extrabold text-[#10231d]"
                      href="/dashboard/aktivitas"
                    >
                      Lihat Semua Aktivitas
                    </a>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  detail,
  detailTone,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  detailTone: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[150px] overflow-hidden rounded-xl bg-white p-5 shadow-[0_10px_22px_rgba(23,79,62,0.11)] ring-1 ring-black/10">
      <div className="absolute right-0 top-0 h-18 w-18 rounded-bl-full bg-[#eef0ef]" />
      <div className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-lg bg-[#f0f1d5]">
        {icon}
      </div>
      <p className="relative text-sm font-extrabold text-[#26322e]">
        {title}
      </p>
      <p className="relative mt-12 text-2xl font-extrabold">{value}</p>
      <p className={`relative mt-2 text-sm font-medium ${detailTone}`}>
        ↗ {detail}
      </p>
    </div>
  );
}

function ActivityRow({
  title,
  subtitle,
  time,
  amount,
  tone,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  time: string;
  amount: string;
  tone: string;
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6.5 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM9 13c-3.3 0-6 1.8-6 4v2h12v-2c0-2.2-2.7-4-6-4Zm6.5.5c-.7 0-1.4.1-2 .3 1.5.9 2.5 2 2.5 3.2v2h5v-1.7c0-2.1-2.5-3.8-5.5-3.8Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm-1 8v10h12V10H6Zm3 2h6v2H9v-2Zm0 4h4v2H9v-2Z" />
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

function ApproveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h16v12H7l-3 3V4Zm4 5h8V7H8v2Zm0 4h6v-2H8v2Zm10.3 4.3 1.4 1.4L16 22.4l-2.7-2.7 1.4-1.4 1.3 1.3 2.3-2.3Z" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-6 1.8-6 4v2h9.5a6 6 0 0 1 1-5A9.5 9.5 0 0 0 9 14Zm10-1v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2Z" />
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

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
    </svg>
  );
}
