import { AccountStatusEditor } from "@/components/AccountStatusEditor";
import { MemberRecentTransactionsTable } from "@/components/MemberRecentTransactionsTable";

const menuItems = [
  { label: "Beranda", icon: GridIcon, href: "/dashboard" },
  {
    label: "Kelola Akun",
    icon: UserSettingsIcon,
    href: "/dashboard/akun",
    active: true,
  },
  { label: "Kelola Simpanan", icon: WalletIcon, href: "/dashboard/simpanan" },
  { label: "Kelola Pinjaman", icon: MoneyIcon, href: "/dashboard/pinjaman" },
  { label: "Laporan Koperasi", icon: ReportIcon, href: "/dashboard/laporan" },
  { label: "SHU", icon: CoinIcon, href: "/dashboard/shu" },
];

type MemberDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK";
  gender: string;
  joinDate: Date;
  isActive: boolean;
  remainingLoan: number;
  remainingLoanDetail: string;
  totalSavings: number;
};

type TransactionRow = {
  id: string;
  date: Date;
  type: string;
  description: string;
  amount: number;
  status: string;
};

export function AdminMemberDetailView({
  member,
  transactions,
  viewerSessionId,
}: {
  member: MemberDetail;
  transactions: TransactionRow[];
  viewerSessionId: string;
}) {
  const fallbackTransactions =
    transactions.length > 0
      ? transactions
      : [
          {
            id: "fallback-1",
            date: member.joinDate,
            type: "Simpanan Pokok",
            description: "Setoran awal anggota",
            amount: 0,
            status: "Pending",
          },
        ];

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#10231d] lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <AdminSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dcdcc0] bg-white px-5 sm:px-7 lg:px-8">
            <h1 className="text-xl font-extrabold text-[#10231d]">
              Dashboard Overview
            </h1>
            <div className="flex items-center gap-6 text-[#627083]">
<UserIcon className="h-6 w-6" />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
            <a
              className="inline-flex items-center gap-2 text-base text-[#24352f]"
              href="/dashboard/akun"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Kembali ke Kelola Akun
            </a>

            <h2 className="mt-8 text-2xl font-extrabold tracking-wide">
              Detail Akun - {member.name}
            </h2>
            <p className="mt-3 text-base text-[#26322e]">
              Informasi lengkap mengenai profil, simpanan, dan pinjaman
              anggota.
            </p>

            <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
              <section className="rounded-xl bg-white p-7 shadow-[0_8px_20px_rgba(23,79,62,0.1)] ring-1 ring-black/10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <MemberAvatar name={member.name} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-3xl font-extrabold">
                          {member.name}
                        </h3>
                        <p className="mt-2 text-base">ID: {member.id}</p>
                        <p className="mt-2 text-base">
                          <AccountStatusEditor
                            accountId={member.id}
                            status={member.status}
                            viewerSessionId={viewerSessionId}
                          />
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-full px-4 py-1.5 text-sm font-semibold ${
                          member.isActive
                            ? "bg-[#ddf8ee] text-[#0f614b] ring-1 ring-[#a6dcca]"
                            : "bg-[#ffe5e1] text-[#b30000] ring-1 ring-[#f2b7b0]"
                        }`}
                      >
                        {member.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <div className="mt-7 h-px bg-[#dadfdc]" />

                    <div className="mt-7 grid gap-x-14 gap-y-6 md:grid-cols-2">
                      <InfoItem label="Email" value={member.email} editable />
                      <InfoItem label="No. Telepon" value={member.phone} editable />
                      <InfoItem label="Peran" value="Anggota" editable />
                      <InfoItem label="Kata Sandi" value="********" editable />
                      <InfoItem label="Jenis Kelamin" value={member.gender} />
                      <InfoItem
                        label="Tanggal Bergabung"
                        value={formatDate(member.joinDate)}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <aside className="grid gap-5">
                <SummaryCard
                  title="Total Simpanan"
                  value={formatCurrency(member.totalSavings)}
                  detail="+2.5% bulan ini"
                  icon={<PiggyIcon className="h-16 w-16" />}
                  iconTone="green"
                />
                <SummaryCard
                  title="Sisa Pinjaman"
                  value={formatCurrency(member.remainingLoan)}
                  detail={member.remainingLoanDetail}
                  icon={<WalletOutlineIcon className="h-14 w-14" />}
                  iconTone="red"
                />
              </aside>
            </section>

            <section className="mt-7 overflow-hidden rounded-xl bg-white shadow-[0_8px_20px_rgba(23,79,62,0.1)] ring-1 ring-black/10">
              <div className="border-b border-[#e0e3df] px-7 py-6">
                <h3 className="text-2xl font-extrabold tracking-[0.08em]">
                  Riwayat Transaksi Terakhir
                </h3>
              </div>

              <MemberRecentTransactionsTable
                transactions={fallbackTransactions.map((transaction) => ({
                  ...transaction,
                  date: formatDate(transaction.date),
                }))}
              />
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
          <p className="text-lg font-extrabold uppercase">KSP</p>
          <p className="text-lg font-extrabold uppercase">Tarunajaya</p>
          <p className="mt-0.5 text-xs font-semibold text-[#89bea9]">
            Admin Portal
          </p>
        </div>
      </div>

      <nav className="mt-12 space-y-3">
        {menuItems.map((item) => (
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
  );
}

function MemberAvatar({ name }: { name: string }) {
  return (
    <div className="grid h-[96px] w-[96px] shrink-0 place-items-center rounded-2xl bg-[#eef1d3] shadow-[0_6px_14px_rgba(23,79,62,0.12)] ring-8 ring-[#f8faf5]">
      <span className="text-3xl font-extrabold text-[#185440]">
        {getInitials(name)}
      </span>
    </div>
  );
}

function InfoItem({
  label,
  value,
  editable,
}: {
  label: string;
  value: string;
  editable?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#26322e]">
        {label}
      </p>
      <p className="mt-2 flex items-center gap-3 text-base">
        <span>{value}</span>
        {editable ? <EditIcon className="h-4 w-4 text-[#1f312a]" /> : null}
      </p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  icon,
  iconTone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  iconTone: "green" | "red";
}) {
  return (
    <section className="relative min-h-[150px] overflow-hidden rounded-xl bg-white p-6 shadow-[0_8px_20px_rgba(23,79,62,0.1)] ring-1 ring-black/10">
      <div
        className={`absolute right-5 top-7 ${
          iconTone === "green" ? "text-[#dfe8e3]" : "text-[#f5dddd]"
        }`}
      >
        {icon}
      </div>
      <p className="relative text-base text-[#26322e]">{title}</p>
      <p className="relative mt-4 text-2xl font-extrabold">{value}</p>
      <p className="relative mt-3 text-sm font-bold text-[#10231d]">{detail}</p>
    </section>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAccountStatus(status: MemberDetail["status"]) {
  const labels = {
    AKTIF: "Aktif",
    NONAKTIF: "Nonaktif",
    MENUNGGU: "Menunggu",
    DITOLAK: "Ditolak",
  };

  return labels[status];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm-7-4h14v-2l-2-2.5V10a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v3.5L5 16v2Z" /></svg>;
}
function UserIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 15a7.96 7.96 0 0 1-5.5-2.19C7.25 15.55 9.38 14 12 14s4.75 1.55 5.5 3.81A7.96 7.96 0 0 1 12 20Z" /></svg>;
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m11 18-6-6 6-6 1.4 1.4-3.6 3.6H20v2H8.8l3.6 3.6L11 18Z" /></svg>;
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h9v2H6v12h7v2H4V4Zm11.5 4.5 1.4-1.4L22 12l-5.1 4.9-1.4-1.4L18 13h-8v-2h8l-2.5-2.5Z" /></svg>;
}
function EditIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 17.2V21h3.8L18.9 9.9l-3.8-3.8L4 17.2ZM20.7 8.1a1 1 0 0 0 0-1.4l-3.4-3.4a1 1 0 0 0-1.4 0l-1.6 1.6 3.8 3.8 1.6-1.6Z" /></svg>;
}
function PiggyIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2.5L21 8.5V13l-2 1v3h-3v-2H9v2H6v-2.3A5.9 5.9 0 0 1 3 9.5V8H1V6h4.2A7 7 0 0 1 16 6Zm1 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /></svg>;
}
function WalletOutlineIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h13a3 3 0 0 1 3 3v1h-6a4 4 0 1 0 0 8h6v1a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Zm10 6h7v4h-7a2 2 0 1 1 0-4Z" /></svg>;
}
