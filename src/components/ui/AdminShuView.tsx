"use client";

import { useEffect, useRef, useState } from "react";

const menuItems = [
  { label: "Beranda", icon: GridIcon, href: "/dashboard" },
  { label: "Kelola Akun", icon: UserSettingsIcon, href: "/dashboard/akun" },
  { label: "Kelola Simpanan", icon: WalletIcon, href: "/dashboard/simpanan" },
  { label: "Kelola Pinjaman", icon: MoneyIcon, href: "/dashboard/pinjaman" },
  { label: "Laporan Koperasi", icon: ReportIcon, href: "/dashboard/laporan" },
  { label: "SHU", icon: CoinIcon, href: "/dashboard/shu", active: true },
];

const RECIPIENTS_PER_PAGE = 5;

export type AdminShuSummaryData = {
  netProfit: string;
  reserveFund: string;
  memberFund: string;
};

export type AdminShuRecipientData = {
  hasReceivedShu: boolean;
  id: string;
  name: string;
  rawEstimated: number;
  savings: string;
  loan: string;
  estimated: string;
};

export function AdminShuView({
  recipients = [],
  summary = {
    netProfit: "Rp 0",
    reserveFund: "Rp 0",
    memberFund: "Rp 0",
  },
}: {
  recipients?: AdminShuRecipientData[];
  summary?: AdminShuSummaryData;
}) {
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [pendingRecipient, setPendingRecipient] =
    useState<AdminShuRecipientData | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredRecipients = recipients.filter((recipient) => {
    if (!normalizedSearchQuery) {
      return true;
    }

    return (
      recipient.id.toLowerCase().includes(normalizedSearchQuery) ||
      recipient.name.toLowerCase().includes(normalizedSearchQuery)
    );
  });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecipients.length / RECIPIENTS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * RECIPIENTS_PER_PAGE;
  const visibleRecipients = filteredRecipients.slice(
    startIndex,
    startIndex + RECIPIENTS_PER_PAGE,
  );
  const visibleStart = filteredRecipients.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(
    startIndex + RECIPIENTS_PER_PAGE,
    filteredRecipients.length,
  );
  const downloadRecipientsExcel = () => {
    const tableRows = filteredRecipients
      .map(
        (recipient) => `
          <tr>
            <td>${escapeHtml(recipient.id)}</td>
            <td>${escapeHtml(recipient.name)}</td>
            <td>${escapeHtml(recipient.savings)}</td>
            <td>${escapeHtml(recipient.loan)}</td>
            <td>${escapeHtml(recipient.estimated)}</td>
          </tr>
        `,
      )
      .join("");
    const excelContent = `
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                <th>ID Anggota</th>
                <th>Nama Anggota</th>
                <th>Simpanan</th>
                <th>Pinjaman</th>
                <th>Estimasi SHU</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([excelContent], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "daftar-penerima-shu.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };
  const sendShu = async () => {
    if (!pendingRecipient) {
      return;
    }

    setIsSending(true);
    const response = await fetch("/api/shu/kirim", {
      body: JSON.stringify({
        amount: pendingRecipient.rawEstimated,
        memberId: pendingRecipient.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    setIsSending(false);

    if (response.ok) {
      setPendingRecipient(null);
      window.location.reload();
      return;
    }

    const error = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    alert(error?.message ?? "SHU gagal dikirim. Silakan coba lagi.");
  };

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
            <div className="mb-7">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Kelola SHU
                </h2>
                <p className="mt-2 text-base text-[#26322e]">
                  Sisa Hasil Usaha (SHU) Tahun Berjalan
                </p>
              </div>
            </div>

            <section className="grid gap-5 xl:grid-cols-3">
              <MetricCard
                title="Sisa Hasil Usaha"
                value={summary.netProfit}
                detail=""
                icon={<TrendIcon className="h-7 w-7" />}
                iconTone="cream"
                valueTone="green"
              />
              <MetricCard
                title="Dana Cadangan"
                value={summary.reserveFund}
                detail="40% dari Sisa Hasil Usaha"
                icon={<PiggyIcon className="h-7 w-7" />}
                iconTone="brown"
                valueTone="brown"
              />
              <section className="relative min-h-[172px] overflow-hidden rounded-[22px] bg-[#185440] p-6 text-white shadow-[0_16px_30px_rgba(23,79,62,0.18)]">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 text-[#c6e6d7]">
                    <UsersIcon className="h-8 w-8" />
                  </span>
                  <h3 className="text-2xl font-extrabold">
                    Dana Anggota
                  </h3>
                </div>
                <p className="mt-7 text-3xl font-extrabold">
                  {summary.memberFund}
                </p>
                <p className="mt-3 text-sm text-[#9fd0bb]">
                  60% dari Sisa Hasil Usaha
                </p>
                <UsersIcon className="absolute -right-1 top-16 h-28 w-28 text-white/8" />
              </section>
            </section>

            <section className="mt-7">
              <section className="rounded-[22px] bg-white p-6 shadow-[0_14px_28px_rgba(23,79,62,0.12)] ring-1 ring-black/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-extrabold">
                    Daftar Penerima SHU
                  </h2>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <label className="flex h-11 w-full max-w-[280px] items-center gap-3 rounded-lg bg-[#e6e6ce] px-4 text-[#69716d] sm:w-[280px]">
                      <SearchIcon className="h-5 w-5 text-[#26322e]" />
                      <input
                        aria-label="Cari anggota berdasarkan ID atau nama"
                        className="min-w-0 flex-1 bg-transparent text-sm text-[#10231d] outline-none placeholder:text-[#69716d]"
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Cari anggota..."
                        type="search"
                        value={searchQuery}
                      />
                    </label>
                    <button
                      className="flex h-11 items-center justify-center rounded-xl bg-[#e6e6ce] px-7 text-sm font-extrabold text-[#10231d] shadow-sm ring-1 ring-black/10 transition hover:bg-[#dedeBE]"
                      onClick={downloadRecipientsExcel}
                      type="button"
                    >
                      Unduh
                    </button>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#d9d6ba] text-left text-sm font-extrabold">
                        <th className="py-3 pr-5">ID Anggota</th>
                        <th className="px-3 py-3">Nama Anggota</th>
                        <th className="px-3 py-3 text-right">Simpanan</th>
                        <th className="px-3 py-3 text-right">Pinjaman</th>
                        <th className="px-3 py-3 text-right">Estimasi SHU</th>
                        <th className="py-3 pl-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRecipients.length > 0 ? (
                        visibleRecipients.map((recipient) => (
                          <tr
                            className="border-b border-[#d9d6ba] last:border-b-0"
                            key={recipient.id}
                          >
                            <td className="py-4 pr-5">{recipient.id}</td>
                            <td className="px-3 py-4 font-extrabold">
                              {recipient.name}
                            </td>
                            <td className="px-3 py-4 text-right">
                              {recipient.savings}
                            </td>
                            <td className="px-3 py-4 text-right">
                              {recipient.loan}
                            </td>
                            <td className="px-3 py-4 text-right font-extrabold text-[#06251d]">
                              {recipient.estimated}
                            </td>
                            <td className="py-4 pl-3 text-right">
                              <ShuRecipientActionMenu
                                disabled={
                                  recipient.rawEstimated <= 0 ||
                                  recipient.hasReceivedShu
                                }
                                isOpen={openActionId === recipient.id}
                                onClose={() => setOpenActionId(null)}
                                onSend={() => {
                                  setOpenActionId(null);
                                  setPendingRecipient(recipient);
                                }}
                                onToggle={() =>
                                  setOpenActionId((currentId) =>
                                    currentId === recipient.id
                                      ? null
                                      : recipient.id,
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            className="py-8 text-center text-[#69716d]"
                            colSpan={6}
                          >
                            {recipients.length > 0
                              ? "Anggota tidak ditemukan."
                              : "Belum ada anggota aktif."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-4 border-t border-[#d9d6ba] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm sm:text-base">
                    Menampilkan {visibleStart} hingga {visibleEnd} penerima dari{" "}
                    {filteredRecipients.length} penerima
                  </p>
                  {totalPages > 1 ? (
                    <div className="flex items-center gap-3">
                      <button
                        aria-label="Halaman sebelumnya"
                        className="grid h-9 w-9 place-items-center rounded-full border border-[#d8d8ca] text-[#10231d] transition hover:bg-[#f3f2d8] disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={safeCurrentPage === 1}
                        onClick={() =>
                          setCurrentPage((page) => Math.max(1, page - 1))
                        }
                        type="button"
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const page = index + 1;

                        return (
                          <button
                            className={`grid h-9 w-9 place-items-center rounded-full font-extrabold transition ${
                              safeCurrentPage === page
                                ? "bg-[#075f48] text-white"
                                : "text-[#10231d] hover:bg-[#f3f2d8]"
                            }`}
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            type="button"
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        aria-label="Halaman berikutnya"
                        className="grid h-9 w-9 place-items-center rounded-full border border-[#d8d8ca] text-[#10231d] transition hover:bg-[#f3f2d8] disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={safeCurrentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(totalPages, page + 1),
                          )
                        }
                        type="button"
                      >
                        ›
                      </button>
                    </div>
                  ) : null}
                </div>
              </section>
            </section>
          </div>
        </section>
      </div>

      {pendingRecipient ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 px-4">
          <div className="w-full max-w-[380px] rounded-xl bg-white p-6 text-center shadow-[0_18px_42px_rgba(0,0,0,0.24)] ring-1 ring-black/10">
            <h3 className="text-lg font-extrabold text-[#10231d]">
              Kirim SHU?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#52615b]">
                              SHU {pendingRecipient.name} sebesar {pendingRecipient.estimated} akan
                              disimpan sebagai Simpanan Sukarela. Lanjutkan?
              {pendingRecipient.hasReceivedShu ? (
                <span className="mt-2 block font-semibold text-[#b00000]">
                  SHU anggota ini sudah pernah dikirim.
                </span>
              ) : null}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                className="h-10 rounded-full bg-[#185440] px-8 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending || pendingRecipient.hasReceivedShu}
                onClick={sendShu}
                type="button"
              >
                YA
              </button>
              <button
                className="h-10 rounded-full bg-[#f0f0d8] px-8 text-sm font-extrabold text-[#10231d] ring-1 ring-black/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending}
                onClick={() => setPendingRecipient(null)}
                type="button"
              >
                TIDAK
              </button>
            </div>
          </div>
        </div>
      ) : null}
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

function MetricCard({
  title,
  value,
  detail,
  icon,
  iconTone,
  valueTone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  iconTone: "cream" | "brown";
  valueTone: "green" | "brown";
}) {
  const iconClass =
    iconTone === "cream"
      ? "bg-[#e5e4c9] text-[#65695f]"
      : "bg-[#743f37] text-[#ffd8d3]";
  const valueClass =
    valueTone === "green" ? "text-[#06251d]" : "text-[#4b1715]";

  return (
    <section className="relative min-h-[172px] overflow-hidden rounded-[22px] bg-white p-6 shadow-[0_14px_28px_rgba(23,79,62,0.12)] ring-1 ring-black/10">
      <div className="flex items-center gap-4">
        <span
          className={`grid h-14 w-14 place-items-center rounded-full ${iconClass}`}
        >
          {icon}
        </span>
        <h3 className="text-2xl font-extrabold">{title}</h3>
      </div>
      <p className={`mt-8 text-3xl font-extrabold ${valueClass}`}>{value}</p>
      {detail ? <p className="mt-3 text-sm text-[#26322e]">{detail}</p> : null}
    </section>
  );
}

function ShuRecipientActionMenu({
  disabled,
  isOpen,
  onClose,
  onSend,
  onToggle,
}: {
  disabled: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
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
        left: Math.max(16, buttonRect.right - 150),
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
        aria-label="Buka menu aksi penerima SHU"
        className="rounded-md px-2 py-1 text-xl font-extrabold leading-none text-[#69716d] transition hover:bg-[#eeeed6]"
        onClick={onToggle}
        ref={buttonRef}
        type="button"
      >
        ⋮
      </button>

      {isOpen && menuPosition ? (
        <div
          className="fixed z-50 min-w-[150px] overflow-hidden rounded-lg bg-white py-2 text-left shadow-[0_12px_28px_rgba(23,79,62,0.18)] ring-1 ring-black/10"
          ref={floatingMenuRef}
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
          }}
        >
          <button
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-[#075f48] transition hover:bg-[#fbfbe8] disabled:cursor-not-allowed disabled:text-[#9aa59f] disabled:hover:bg-white"
            disabled={disabled}
            onClick={onSend}
            type="button"
          >
            <SendIcon className="h-4 w-4" />
            Kirim
          </button>
        </div>
      ) : null}
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m4 16 5-5 4 4 6-7h-4V6h7v7h-2V9.5l-6.8 8-4-4L5.4 17.4 4 16Z" />
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6.5 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM9 13c-3.3 0-6 1.8-6 4v2h12v-2c0-2.2-2.7-4-6-4Zm6.5.5c-.7 0-1.4.1-2 .3 1.5.9 2.5 2 2.5 3.2v2h5v-1.7c0-2.1-2.5-3.8-5.5-3.8Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 3a7 7 0 0 1 5.3 11.6l4.1 4-1.4 1.4-4.1-4A7 7 0 1 1 10 3Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 11.5 21 3l-4.5 18-4.2-7.3L5 10.5l8.5-2.2-6.1 3 4.4 1.9 1.9 4.4 3-10.7L3 11.5Z" />
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
