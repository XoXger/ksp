import Image from "next/image";
import Link from "next/link";
import { PrintSavingsReceiptButton } from "@/components/PrintSavingsReceiptButton";

const menuItems = [
  { label: "Beranda", icon: GridIcon, href: "/dashboard" },
  { label: "Kelola Akun", icon: UserSettingsIcon, href: "/dashboard/akun" },
  {
    label: "Kelola Simpanan",
    icon: WalletIcon,
    href: "/dashboard/simpanan",
    active: true,
  },
  { label: "Kelola Pinjaman", icon: MoneyIcon, href: "/dashboard/pinjaman" },
  { label: "Laporan Koperasi", icon: ReportIcon, href: "/dashboard/laporan" },
  { label: "SHU", icon: CoinIcon, href: "/dashboard/shu" },
];

type SavingsDetail = {
  id: string;
  memberName: string;
  savingsType: string;
  amount: string;
  date: string;
  hasTransferProof: boolean;
  status: "Terverifikasi" | "Menunggu" | "Ditolak";
  transferProofUrl: string | null;
};

export function AdminSavingsDetailView({
  transaction,
}: {
  transaction: SavingsDetail;
}) {
  const statusClass = {
    Terverifikasi: "bg-[#b9efd7] text-[#063f31]",
    Menunggu: "bg-[#ffe1a3] text-[#934000]",
    Ditolak: "bg-[#ffd6d6] text-[#b00000]",
  }[transaction.status];

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#061f18] lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <AdminSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dcdcc0] bg-white px-5 sm:px-7 lg:px-8">
            <h1 className="text-xl font-extrabold text-[#0f221d]">
              Dashboard Overview
            </h1>
            <div className="flex items-center gap-7 text-[#00432f]">
<UserCircleIcon className="h-6 w-6" />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-7 sm:px-7 lg:px-10">
            <Link
              className="inline-flex items-center gap-3 text-base text-[#16352c] transition hover:text-[#075f48]"
              href="/dashboard/simpanan"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Kembali ke Kelola Simpanan
            </Link>

            <h2 className="mt-8 text-2xl font-extrabold tracking-[0.08em] text-[#0b1210]">
              Detail Transaksi - {transaction.id}
            </h2>

            <section className="mt-9 overflow-hidden rounded-xl bg-white shadow-[0_20px_42px_rgba(23,79,62,0.14)] ring-1 ring-black/10">
              <div className="grid min-h-[590px] lg:grid-cols-2">
                <section className="border-b border-[#d8ddd9] px-8 py-9 sm:px-10 lg:border-b-0 lg:border-r">
                  <h3 className="text-3xl font-medium text-[#171717]">
                    Informasi Transaksi
                  </h3>

                  <div className="mt-9 grid gap-8">
                    <DetailItem
                      label="ID Transaksi"
                      value={transaction.id}
                    />
                    <DetailItem
                      label="Nama Anggota"
                      value={transaction.memberName}
                    />
                    <DetailItem
                      label="Jenis Simpanan"
                      value={transaction.savingsType}
                    />
                    <DetailItem label="Nominal" value={transaction.amount} />
                    <DetailItem label="Tanggal" value={transaction.date} />
                    <div>
                      <p className="text-sm font-extrabold uppercase tracking-wide text-[#26322e]">
                        Status
                      </p>
                      <span
                        className={`mt-3 inline-flex rounded-full px-4 py-1 text-sm font-extrabold ${statusClass}`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="px-8 py-9 sm:px-10">
                  <h3 className="text-3xl font-medium text-[#171717]">
                    Bukti Transfer
                  </h3>

                  {transaction.hasTransferProof ? (
                    <div className="mt-9 max-w-[500px] overflow-hidden rounded-lg bg-[#0e1b20] shadow-inner ring-2 ring-[#17221f]">
                      <Image
                        alt={`Bukti transfer ${transaction.id}`}
                        className="max-h-[520px] w-full object-contain"
                        height={720}
                        src={transaction.transferProofUrl ?? ""}
                        width={960}
                      />
                    </div>
                  ) : (
                    <div className="mt-9 flex min-h-[260px] max-w-[500px] items-center justify-center rounded-lg border border-dashed border-[#cbd4cf] bg-[#f7f7df] px-6 text-center text-base font-semibold text-[#66706a]">
                      Tidak ada bukti transfer untuk simpanan otomatis anggota.
                    </div>
                  )}
                </section>
              </div>

              <footer className="flex flex-col gap-3 border-t border-[#d8ddd9] bg-[#f9faf7] px-8 py-5 sm:flex-row sm:justify-end sm:px-10">
                <PrintSavingsReceiptButton transaction={transaction} />
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#034d3b] px-9 text-base font-extrabold text-white shadow-[0_10px_18px_rgba(23,79,62,0.2)] transition hover:bg-[#075f48]"
                  href="/dashboard/simpanan"
                >
                  Tutup
                </Link>
              </footer>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-extrabold uppercase tracking-wide text-[#26322e]">
        {label}
      </p>
      <p className="mt-2 text-base text-[#111816]">{value}</p>
    </div>
  );
}

function AdminSidebar() {
  return (
    <aside className="hidden w-[230px] shrink-0 flex-col bg-[#0a573f] px-5 py-6 text-white shadow-[10px_0_28px_rgba(23,79,62,0.18)] lg:flex">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#185440]">
          <BankIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-lg font-extrabold uppercase">KSP</p>
          <p className="text-lg font-extrabold uppercase">Tarunajaya</p>
          <p className="mt-0.5 text-xs font-semibold text-[#93c6b1]">
            Admin Portal
          </p>
        </div>
      </div>

      <nav className="mt-12 space-y-3">
        {menuItems.map((item) => (
          <a
            className={`relative flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold ${
              item.active
                ? "bg-[#0d684e] text-white before:absolute before:left-0 before:h-full before:w-1 before:rounded-full before:bg-[#31d8ad]"
                : "text-[#9bc4b4] hover:bg-[#0f6049] hover:text-white"
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
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm-7-4h14v-2l-2-2.5V10a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v3.5L5 16v2Z" /></svg>;
}
function UserCircleIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 5.5 13.8C16.7 15.6 14.6 14 12 14s-4.7 1.6-5.5 3.8A8 8 0 0 1 12 4Zm0 2.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /></svg>;
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m11 18-6-6 6-6 1.4 1.4-3.6 3.6H20v2H8.8l3.6 3.6L11 18Z" /></svg>;
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h9v2H6v12h7v2H4V4Zm11.5 4.5 1.4-1.4L22 12l-5.1 4.9-1.4-1.4L18 13h-8v-2h8l-2.5-2.5Z" /></svg>;
}
