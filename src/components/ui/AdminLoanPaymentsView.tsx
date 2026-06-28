"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PaymentStatus = "Menunggu" | "Terverifikasi" | "Ditolak";

export type LoanPaymentRowData = {
  transactionId: string;
  memberName: string;
  loanId: string;
  interestType: string;
  installmentLabel: string;
  paymentId: string;
  amount: string;
  status: PaymentStatus;
};

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

export function AdminLoanPaymentsView({
  paymentRows,
}: {
  paymentRows: LoanPaymentRowData[];
}) {
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#06251d] lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <AdminSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dcdcc0] bg-white px-5 sm:px-7 lg:px-8">
            <h1 className="text-xl font-extrabold text-[#0f4333]">
              Dashboard Overview
            </h1>
            <div className="flex items-center text-[#10231d]">
</div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-7 sm:px-7 lg:px-8">
            <Link
              className="inline-flex items-center gap-3 text-base text-[#26322e] transition hover:text-[#075f48]"
              href="/dashboard/pinjaman"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Kembali ke Kelola Pinjaman
            </Link>

            <div className="mt-7">
              <h2 className="text-2xl font-extrabold tracking-tight">
                Pembayaran Anggota
              </h2>
              <p className="mt-2 text-base text-[#26322e]">
                Review dan proses bukti pembayaran angsuran pinjaman anggota.
              </p>
            </div>

            <section className="mt-7 overflow-hidden rounded-xl bg-white shadow-[0_12px_28px_rgba(23,79,62,0.11)] ring-1 ring-black/10">
              <div className="flex flex-col gap-4 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-extrabold">
                  Riwayat Pembayaran Anggota
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead className="bg-[#fbfbe8]">
                    <tr className="text-left text-sm font-extrabold text-[#26322e]">
                      <th className="px-6 py-5">ID Transaksi</th>
                      <th className="px-5 py-5">Nama Anggota</th>
                      <th className="px-5 py-5">ID Pinjaman</th>
                      <th className="px-5 py-5">Tipe</th>
                      <th className="px-5 py-5">Angsuran</th>
                      <th className="px-5 py-5">Nominal</th>
                      <th className="px-5 py-5">Status</th>
                      <th className="px-7 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRows.length > 0 ? paymentRows.map((row) => (
                      <PaymentRow
                        key={row.paymentId}
                        {...row}
                        isActionMenuOpen={openActionMenuId === row.paymentId}
                        onCloseActionMenu={() => setOpenActionMenuId(null)}
                        onToggleActionMenu={() =>
                          setOpenActionMenuId((currentId) =>
                            currentId === row.paymentId ? null : row.paymentId,
                          )
                        }
                      />
                    )) : (
                      <tr>
                        <td
                          className="px-6 py-8 text-center text-base text-[#56615d]"
                          colSpan={8}
                        >
                          Belum ada pembayaran anggota.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-5">
                <p className="text-sm sm:text-base">
                  Menampilkan {paymentRows.length} dari {paymentRows.length} pembayaran
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function PaymentRow({
  transactionId,
  memberName,
  loanId,
  interestType,
  installmentLabel,
  paymentId,
  amount,
  status,
  isActionMenuOpen,
  onCloseActionMenu,
  onToggleActionMenu,
}: LoanPaymentRowData & {
  isActionMenuOpen: boolean;
  onCloseActionMenu: () => void;
  onToggleActionMenu: () => void;
}) {
  return (
    <tr className="border-b border-[#eeeeea] text-sm last:border-b-0">
      <td className="px-6 py-5 font-semibold">{transactionId}</td>
      <td className="px-5 py-5 text-base font-bold">{memberName}</td>
      <td className="px-5 py-5 font-semibold">{loanId}</td>
      <td className="px-5 py-5 text-base">{interestType}</td>
      <td className="px-5 py-5">
        <p className="text-base font-extrabold text-[#063f30]">
          {installmentLabel}
        </p>
        <p className="mt-1 text-sm text-[#56615d]">{paymentId}</p>
      </td>
      <td className="px-5 py-5 text-base font-extrabold">{amount}</td>
      <td className="px-5 py-5">
        <PaymentStatusBadge status={status} />
      </td>
      <td className="px-7 py-5 text-right">
        <PaymentActionMenu
          detailHref={`/dashboard/pinjaman/pembayaran/${paymentId}`}
          isOpen={isActionMenuOpen}
          onClose={onCloseActionMenu}
          onToggle={onToggleActionMenu}
        />
      </td>
    </tr>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const statusClass = {
    Menunggu: "bg-[#dfdec5] text-[#26322e]",
    Terverifikasi: "bg-[#e9faf3] text-[#075f48]",
    Ditolak: "bg-[#fff2f2] text-[#d71920] ring-1 ring-[#f1b6b6]",
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-extrabold ${statusClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function PaymentActionMenu({
  detailHref,
  isOpen,
  onClose,
  onToggle,
}: {
  detailHref: string;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      const clickInsideButton = containerRef.current?.contains(target);
      const clickInsideMenu = floatingMenuRef.current?.contains(target);

      if (!clickInsideButton && !clickInsideMenu) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      setMenuPosition(null);
      return;
    }

    const updateMenuPosition = () => {
      const buttonRect = buttonRef.current?.getBoundingClientRect();

      if (!buttonRect) {
        return;
      }

      setMenuPosition({
        top: buttonRect.bottom + 8,
        left: Math.max(16, buttonRect.right - 160),
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex justify-end" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Buka menu aksi pembayaran"
        className="rounded-md px-2 py-1 text-2xl font-extrabold leading-none text-[#69716d] transition hover:bg-[#eeeed6]"
        onClick={onToggle}
        ref={buttonRef}
        type="button"
      >
        ⋮
      </button>

      {isOpen && menuPosition ? (
        <div
          className="fixed z-50 min-w-[160px] overflow-hidden rounded-lg bg-white py-2 text-left shadow-[0_12px_28px_rgba(23,79,62,0.18)] ring-1 ring-black/10"
          ref={floatingMenuRef}
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
          }}
        >
          <a
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-[#10231d] transition hover:bg-[#fbfbe8]"
            href={detailHref}
          >
            <EyeIcon className="h-4 w-4" />
            Detail
          </a>
        </div>
      ) : null}
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
function EyeIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c5.2 0 8.7 4.6 9.7 6.2.2.5.2 1.1 0 1.6C20.7 14.4 17.2 19 12 19s-8.7-4.6-9.7-6.2a1.7 1.7 0 0 1 0-1.6C3.3 9.6 6.8 5 12 5Zm0 2c-4 0-6.8 3.4-7.8 5 1 1.6 3.8 5 7.8 5s6.8-3.4 7.8-5c-1-1.6-3.8-5-7.8-5Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" /></svg>;
}
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm-7-4h14v-2l-2-2.5V10a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v3.5L5 16v2Z" /></svg>;
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m11 18-6-6 6-6 1.4 1.4-3.6 3.6H20v2H8.8l3.6 3.6L11 18Z" /></svg>;
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h9v2H6v12h7v2H4V4Zm11.5 4.5 1.4-1.4L22 12l-5.1 4.9-1.4-1.4L18 13h-8v-2h8l-2.5-2.5Z" /></svg>;
}
