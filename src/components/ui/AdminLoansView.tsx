"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type LoanStatusFilter = "Semua Status" | "Disetujui" | "Menunggu" | "Ditolak";

const LOAN_ROWS_PER_PAGE = 5;

export type LoanRowData = {
  initials: string;
  name: string;
  id: string;
  amount: string;
  interest: string;
  interestType: string;
  tenor: string;
  status: string;
  statusTone: "waiting" | "approved" | "rejected";
  avatarTone: "green" | "cream" | "brown" | "pink";
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

export function AdminLoansView({
  detailSessionQuery = "",
  loanRows,
  pendingPaymentVerificationCount = 0,
}: {
  detailSessionQuery?: string;
  loanRows: LoanRowData[];
  pendingPaymentVerificationCount?: number;
}) {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [filterMenuPosition, setFilterMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LoanRowData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<LoanStatusFilter>("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const filterOptions: LoanStatusFilter[] = [
    "Semua Status",
    "Disetujui",
    "Menunggu",
    "Ditolak",
  ];
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredLoanRows = loanRows.filter((row) => {
    const matchesStatus =
      selectedStatus === "Semua Status" || row.status === selectedStatus;
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      row.name.toLowerCase().includes(normalizedSearchQuery) ||
      row.id.toLowerCase().includes(normalizedSearchQuery);

    return matchesStatus && matchesSearch;
  });
  const totalFilteredLoanRows = filteredLoanRows.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredLoanRows / LOAN_ROWS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * LOAN_ROWS_PER_PAGE;
  const paginatedLoanRows = filteredLoanRows.slice(
    pageStartIndex,
    pageStartIndex + LOAN_ROWS_PER_PAGE,
  );
  const visibleStart =
    totalFilteredLoanRows === 0 ? 0 : pageStartIndex + 1;
  const visibleEnd = Math.min(
    pageStartIndex + paginatedLoanRows.length,
    totalFilteredLoanRows,
  );
  const waitingLoanCount = loanRows.filter(
    (row) => row.status === "Menunggu",
  ).length;
  const approvedLoanCount = loanRows.filter(
    (row) => row.status === "Disetujui",
  ).length;
  const rejectedLoanCount = loanRows.filter(
    (row) => row.status === "Ditolak",
  ).length;
  const exportLatestLoanRows = () => {
    const exportedRows =
      filteredLoanRows.length > 0
        ? filteredLoanRows.map((row, index) => ({
            "No.": index + 1,
            "Nama Anggota": row.name,
            "ID Pinjaman": row.id,
            "Nominal Pinjaman": row.amount,
            Bunga: row.interest,
            Tipe: row.interestType,
            "Jangka Waktu": row.tenor,
            Status: row.status,
          }))
        : [
            {
              "No.": "",
              "Nama Anggota": "Tidak ada data pengajuan.",
              "ID Pinjaman": "",
              "Nominal Pinjaman": "",
              Bunga: "",
              Tipe: "",
              "Jangka Waktu": "",
              Status: "",
            },
          ];
    const headers = Object.keys(exportedRows[0]);
    const tableRows = exportedRows
      .map(
        (row) =>
          `<tr>${headers
            .map((header) => `<td>${escapeHtml(String(row[header as keyof typeof row]))}</td>`)
            .join("")}</tr>`,
      )
      .join("");
    const table = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            table {
              border-collapse: collapse;
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            th {
              background: #185440;
              border: 1px solid #10231d;
              color: #ffffff;
              font-weight: 700;
              padding: 8px 10px;
              text-align: left;
            }
            td {
              border: 1px solid #9aa79f;
              padding: 7px 10px;
              mso-number-format: "\\@";
            }
          </style>
        </head>
        <body>
          <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([table], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "riwayat-pengajuan-pinjaman.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };
  const deleteLoan = async () => {
    if (!deleteTarget) {
      return;
    }

    const response = await fetch(
      `/api/pinjaman/${encodeURIComponent(deleteTarget.id)}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      alert("Pinjaman gagal dihapus. Silakan coba lagi.");
      return;
    }

    setDeleteTarget(null);
    setOpenActionMenuId(null);
    router.refresh();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!filterMenuRef.current?.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setOpenActionMenuId(null);
  }, [normalizedSearchQuery, selectedStatus]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!isFilterOpen || !filterButtonRef.current) {
      return;
    }

    const updateFilterPosition = () => {
      const buttonRect = filterButtonRef.current?.getBoundingClientRect();

      if (!buttonRect) {
        return;
      }

      setFilterMenuPosition({
        top: buttonRect.bottom + 8,
        left: Math.max(16, buttonRect.right - 176),
      });
    };

    updateFilterPosition();
    window.addEventListener("resize", updateFilterPosition);
    window.addEventListener("scroll", updateFilterPosition, true);

    return () => {
      window.removeEventListener("resize", updateFilterPosition);
      window.removeEventListener("scroll", updateFilterPosition, true);
    };
  }, [isFilterOpen]);

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
            <div className="flex items-center text-[#10231d]">
</div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
            <div className="mb-7">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Kelola Pinjaman
                </h2>
                <p className="mt-2 text-base text-[#26322e]">
                  Review dan proses pengajuan pinjaman anggota terkini.
                </p>
              </div>
            </div>

            <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
              <LoanMetricCard
                label="Hari Ini"
                title="Menunggu Persetujuan"
                value={`${waitingLoanCount} Pengajuan`}
                icon={<ClipboardClockIcon className="h-7 w-7" />}
                iconTone="cream"
              />
              <LoanMetricCard
                label="Bulan Ini"
                title="Pengajuan Diterima"
                value={`${approvedLoanCount} Pengajuan`}
                icon={<CheckCircleIcon className="h-7 w-7" />}
                iconTone="green"
              />
              <LoanMetricCard
                label="Bulan Ini"
                title="Pengajuan Ditolak"
                value={`${rejectedLoanCount} Pengajuan`}
                icon={<XCircleIcon className="h-7 w-7" />}
                iconTone="red"
              />
              <LoanMetricCard
                label="Hari Ini"
                title="Menunggu Verifikasi Pembayaran"
                value={`${pendingPaymentVerificationCount} Pembayaran`}
                description={
                  pendingPaymentVerificationCount > 0
                    ? "Bukti pembayaran angsuran perlu diperiksa"
                    : "Semua pembayaran telah diperiksa"
                }
                icon={<PaymentProofIcon className="h-7 w-7" />}
                iconTone="cream"
                actionHref="/dashboard/pinjaman/pembayaran"
                actionLabel="Lihat Pembayaran"
              />
            </section>

            <section className="mt-7 overflow-hidden rounded-xl bg-white shadow-[0_12px_28px_rgba(23,79,62,0.11)] ring-1 ring-black/10">
              <div className="flex flex-col gap-4 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-extrabold">
                  Pengajuan Terbaru
                </h2>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <label className="flex h-11 w-full items-center gap-3 rounded-lg bg-white px-4 text-[#69716d] shadow-sm ring-1 ring-black/10 sm:w-[320px]">
                    <SearchIcon className="h-5 w-5 text-[#26322e]" />
                    <input
                      aria-label="Cari nama atau ID pinjaman"
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#10231d] outline-none placeholder:text-[#69716d]"
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setOpenActionMenuId(null);
                      }}
                      placeholder="Cari nama atau ID..."
                      type="search"
                      value={searchQuery}
                    />
                  </label>
                  <div className="relative" ref={filterMenuRef}>
                    <button
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#fbfbe8] px-5 text-sm font-semibold text-[#10231d] shadow-sm ring-1 ring-black/10 hover:bg-[#f3f2d8] sm:w-auto"
                      onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
                      ref={filterButtonRef}
                      type="button"
                    >
                      <FilterIcon className="h-4 w-4" />
                      {selectedStatus === "Semua Status"
                        ? "Filter"
                        : selectedStatus}
                    </button>

                    {isFilterOpen ? (
                      <div
                        className="fixed z-50 w-44 overflow-hidden rounded-lg bg-white py-2 shadow-[0_14px_28px_rgba(23,79,62,0.18)] ring-1 ring-black/10"
                        style={{
                          left: filterMenuPosition.left,
                          top: filterMenuPosition.top,
                        }}
                      >
                        {filterOptions.map((option) => (
                          <button
                            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold hover:bg-[#fbfbe8] ${
                              selectedStatus === option
                                ? "bg-[#fbfbe8] text-[#075f48]"
                                : "text-[#10231d]"
                            }`}
                            key={option}
                            onClick={() => {
                              setSelectedStatus(option);
                              setIsFilterOpen(false);
                              setOpenActionMenuId(null);
                            }}
                            type="button"
                          >
                            {option}
                            {selectedStatus === option ? (
                              <span className="h-2 w-2 rounded-full bg-[#075f48]" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <button
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#fbfbe8] px-5 text-sm font-semibold text-[#10231d] shadow-sm ring-1 ring-black/10 hover:bg-[#f3f2d8] sm:w-auto"
                    onClick={exportLatestLoanRows}
                    type="button"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Ekspor
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] border-collapse">
                  <thead className="bg-[#fbfbe8]">
                    <tr className="text-left text-sm font-extrabold text-[#26322e]">
                      <th className="px-7 py-5">Nama Anggota</th>
                      <th className="px-5 py-5">Nominal Pinjaman</th>
                      <th className="px-5 py-5">Bunga</th>
                      <th className="px-5 py-5">Tipe</th>
                      <th className="px-5 py-5">Jangka Waktu</th>
                      <th className="px-5 py-5">Status</th>
                      <th className="px-7 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLoanRows.map((row) => (
                      <LoanRow
                        key={`${row.id}-${row.amount}`}
                        {...row}
                        detailSessionQuery={detailSessionQuery}
                        isActionMenuOpen={openActionMenuId === row.id}
                        onCloseActionMenu={() => setOpenActionMenuId(null)}
                        onDelete={() => {
                          setDeleteTarget(row);
                          setOpenActionMenuId(null);
                        }}
                        onToggleActionMenu={() =>
                          setOpenActionMenuId((currentId) =>
                            currentId === row.id ? null : row.id,
                          )
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm sm:text-base">
                  Menampilkan {visibleStart} hingga {visibleEnd} dari{" "}
                  {totalFilteredLoanRows} pengajuan
                </p>
                {totalFilteredLoanRows > 0 ? (
                  <div className="flex items-center gap-5">
                    <button
                      className="text-[#a7aaa4] disabled:cursor-not-allowed disabled:text-[#d5d7d1]"
                      disabled={safeCurrentPage === 1}
                      onClick={() => {
                        setCurrentPage((page) => Math.max(1, page - 1));
                        setOpenActionMenuId(null);
                      }}
                      type="button"
                    >
                      ‹
                    </button>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-full bg-[#034d3b] font-bold text-white"
                      type="button"
                    >
                      {safeCurrentPage}
                    </button>
                    <button
                      className="text-[#10231d] disabled:cursor-not-allowed disabled:text-[#d5d7d1]"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1),
                        );
                        setOpenActionMenuId(null);
                      }}
                      type="button"
                    >
                      ›
                    </button>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </section>
      </div>
      {deleteTarget ? (
        <DeleteLoanConfirmationModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteLoan}
        />
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

function LoanMetricCard({
  label,
  title,
  value,
  description,
  actionHref,
  actionLabel,
  icon,
  iconTone,
}: {
  label: string;
  title: string;
  value: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  icon: React.ReactNode;
  iconTone: "cream" | "green" | "red";
}) {
  const iconClass = {
    cream: "bg-[#e5e4c9] text-[#6f6f5f]",
    green: "bg-[#b8f2df] text-[#075f48]",
    red: "bg-[#ffd1d1] text-[#d71920]",
  }[iconTone];

  return (
    <div className="relative min-h-[154px] rounded-xl bg-white p-6 shadow-[0_12px_26px_rgba(23,79,62,0.1)] ring-1 ring-black/10">
      <span
        className={`grid h-12 w-12 place-items-center rounded-lg ${iconClass}`}
      >
        {icon}
      </span>
      <span className="absolute right-6 top-6 rounded bg-[#e5e4c9] px-3 py-1 text-sm font-bold text-[#26322e]">
        {label}
      </span>
      <p className="mt-6 text-base text-[#26322e]">{title}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      {description ? (
        <p className="mt-2 text-sm font-semibold text-[#6f6f5f]">
          {description}
        </p>
      ) : null}
      {actionHref && actionLabel ? (
        <a
          className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-[#185440] px-5 text-xs font-extrabold uppercase text-white shadow-[0_8px_16px_rgba(23,79,62,0.15)] transition hover:bg-[#0f4333]"
          href={actionHref}
        >
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}

function LoanRow({
  initials,
  name,
  id,
  amount,
  interest,
  interestType,
  tenor,
  status,
  statusTone,
  avatarTone,
  detailSessionQuery,
  isActionMenuOpen,
  onCloseActionMenu,
  onDelete,
  onToggleActionMenu,
}: {
  initials: string;
  name: string;
  id: string;
  amount: string;
  interest: string;
  interestType: string;
  tenor: string;
  status: string;
  statusTone: "waiting" | "approved" | "rejected";
  avatarTone: "green" | "cream" | "brown" | "pink";
  detailSessionQuery: string;
  isActionMenuOpen: boolean;
  onCloseActionMenu: () => void;
  onDelete: () => void;
  onToggleActionMenu: () => void;
}) {
  const avatarClass = {
    green: "bg-[#e9faf3] text-[#075f48]",
    cream: "bg-[#dedec2] text-[#696955]",
    brown: "bg-[#e7d4d2] text-[#7d3f37]",
    pink: "bg-[#ffd8d5] text-[#c3171f]",
  }[avatarTone];
  const statusClass = {
    waiting: "bg-[#dfdec5] text-[#26322e]",
    approved: "bg-[#e9faf3] text-[#075f48]",
    rejected: "bg-[#fff2f2] text-[#d71920] ring-1 ring-[#f1b6b6]",
  }[statusTone];

  return (
    <tr className="border-b border-[#eeeeea] text-sm last:border-b-0">
      <td className="px-7 py-5">
        <div className="flex items-center gap-4">
          <span
            className={`grid h-10 w-10 place-items-center rounded-full font-extrabold ${avatarClass}`}
          >
            {initials}
          </span>
          <div>
            <p className="text-base font-extrabold">{name}</p>
            <p className="text-sm text-[#26322e]">{id}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-5 text-base">{amount}</td>
      <td className="px-5 py-5 text-base">{interest}</td>
      <td className="px-5 py-5 text-base">{interestType}</td>
      <td className="px-5 py-5 text-base">{tenor}</td>
      <td className="px-5 py-5">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-extrabold ${statusClass}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status}
        </span>
      </td>
      <td className="px-7 py-5 text-right">
        <LoanActionMenu
          detailHref={`/dashboard/pinjaman/${encodeURIComponent(id)}${detailSessionQuery}`}
          loanId={id}
          canDelete={status === "Disetujui"}
          isOpen={isActionMenuOpen}
          onClose={onCloseActionMenu}
          onDelete={onDelete}
          onToggle={onToggleActionMenu}
        />
      </td>
    </tr>
  );
}

function LoanActionMenu({
  canDelete,
  detailHref,
  isOpen,
  onClose,
  onDelete,
  onToggle,
}: {
  canDelete: boolean;
  detailHref: string;
  loanId: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      return;
    }

    const updateMenuPosition = () => {
      const buttonRect = buttonRef.current?.getBoundingClientRect();

      if (!buttonRect) {
        return;
      }

      const menuWidth = 150;
      const menuHeight = canDelete ? 102 : 54;
      const top =
        buttonRect.bottom + 8 + menuHeight > window.innerHeight
          ? Math.max(16, buttonRect.top - menuHeight - 8)
          : buttonRect.bottom + 8;
      const left = Math.min(
        window.innerWidth - menuWidth - 16,
        Math.max(16, buttonRect.right - menuWidth),
      );

      setMenuPosition({ left, top });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [canDelete, isOpen]);

  return (
    <div className="relative inline-flex justify-end" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Buka menu aksi pinjaman"
        className="rounded-md px-2 py-1 text-2xl font-extrabold leading-none text-[#69716d] transition hover:bg-[#eeeed6]"
        onClick={onToggle}
        ref={buttonRef}
        type="button"
      >
        ⋮
      </button>

      {isOpen ? (
        <div
          className="fixed z-[100] min-w-[150px] overflow-hidden rounded-lg bg-white py-2 text-left shadow-[0_12px_28px_rgba(23,79,62,0.18)] ring-1 ring-black/10"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
          }}
        >
          <Link
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#10231d] transition hover:bg-[#fbfbe8]"
            href={detailHref}
            onClick={onClose}
          >
            <EyeIcon className="h-4 w-4" />
            Detail
          </Link>
          {canDelete ? (
            <button
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#c3171f] transition hover:bg-[#fff0ef]"
              onClick={onDelete}
              type="button"
            >
              <TrashIcon className="h-4 w-4" />
              Hapus
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DeleteLoanConfirmationModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-[0_20px_45px_rgba(0,0,0,0.22)] ring-1 ring-black/10">
        <h3 className="text-xl font-extrabold text-[#10231d]">
          Hapus Pinjaman?
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#43524c]">
          Data pinjaman yang disetujui akan dihapus dari data anggota.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            className="h-10 rounded-full bg-[#185440] px-8 text-sm font-extrabold text-white transition hover:bg-[#0f4333]"
            onClick={onConfirm}
            type="button"
          >
            Ya
          </button>
          <button
            className="h-10 rounded-full bg-[#f0f0d8] px-8 text-sm font-extrabold text-[#10231d] ring-1 ring-black/10 transition hover:bg-[#e5e4c9]"
            onClick={onCancel}
            type="button"
          >
            Tidak
          </button>
        </div>
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

function ClipboardClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2h6l1 2h3v9.1a6.5 6.5 0 0 0-2-.9V6H7v12h5.2c.2.7.5 1.4.9 2H5V4h3l1-2Zm1 4h4l-.5-1h-3L10 6Zm8 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-.5 2v2.3l1.8 1.1.7-1.1-1.2-.7V16h-1.3Z" />
    </svg>
  );
}

function PaymentProofIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14v18H5V3Zm2 2v14h12V5H7Zm2 3h8v2H9V8Zm0 4h5v2H9v-2Zm8.6 2.4 1.4 1.4-3.6 3.6-2.2-2.2 1.4-1.4 0.8.8 2.2-2.2Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 13.2-3.2-3.1 1.4-1.4 1.8 1.8 4-4 1.4 1.4-5.4 5.3Z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8.7 7.3 12 10.6l3.3-3.3 1.4 1.4-3.3 3.3 3.3 3.3-1.4 1.4-3.3-3.3-3.3 3.3-1.4-1.4 3.3-3.3-3.3-3.3 1.4-1.4Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.8 12H6.8L6 9Zm3 2 .4 8h1.8l-.3-8H9Zm3 0v8h2v-8h-2Zm3.1 0-.3 8h1.8l.4-8h-1.9Z" />
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 3h2v9l3-3 1.4 1.4L12 15.8l-5.4-5.4L8 9l3 3V3ZM5 18h14v2H5v-2Z" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5c5.2 0 8.7 4.6 9.7 6.2.2.5.2 1.1 0 1.6C20.7 14.4 17.2 19 12 19s-8.7-4.6-9.7-6.2a1.7 1.7 0 0 1 0-1.6C3.3 9.6 6.8 5 12 5Zm0 2c-4 0-6.8 3.4-7.8 5 1 1.6 3.8 5 7.8 5s6.8-3.4 7.8-5c-1-1.6-3.8-5-7.8-5Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
    </svg>
  );
}

function ProcessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 0 1 8.7 6.8l-1.9.5A7 7 0 1 0 16.5 18H14v-2h6v6h-2v-2.5A9 9 0 1 1 12 3Zm1 4v5.6l3.7 2.2-1 1.7-4.7-2.8V7h2Z" />
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
