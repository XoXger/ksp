"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SavingsStatusFilter =
  | "Semua Status"
  | "Terverifikasi"
  | "Menunggu"
  | "Ditolak";

type SavingsRowData = {
  id: string;
  initials: string;
  name: string;
  type: string;
  amount: string;
  date: string;
  status: string;
  statusTone: "green" | "yellow" | "red";
  avatarTone: "green" | "cream" | "brown" | "pink";
  isAutomatic: boolean;
};

export type AdminSavingsRowData = SavingsRowData;

export type AdminSavingsSummary = {
  activeMembersCount: number;
  pendingVerificationCount: number;
  totalSavingsAll: string;
  totalSavingsThisMonth: string;
};

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

const defaultSummary: AdminSavingsSummary = {
  activeMembersCount: 0,
  pendingVerificationCount: 0,
  totalSavingsAll: "Rp 0",
  totalSavingsThisMonth: "Rp 0",
};

export function AdminSavingsView({
  savingsRows = [],
  summary = defaultSummary,
}: {
  savingsRows?: AdminSavingsRowData[];
  summary?: AdminSavingsSummary;
}) {
  const router = useRouter();
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [statusConfirmation, setStatusConfirmation] = useState<{
    action: "approve" | "reject";
    savings: AdminSavingsRowData;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSavingsRowData | null>(
    null,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<SavingsStatusFilter>("Semua Status");
  const filterOptions: SavingsStatusFilter[] = [
    "Semua Status",
    "Terverifikasi",
    "Menunggu",
    "Ditolak",
  ];
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredSavingsRows = savingsRows.filter((row) => {
    const matchesStatus =
      selectedStatus === "Semua Status" || row.status === selectedStatus;
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      row.name.toLowerCase().includes(normalizedSearchQuery) ||
      row.id.toLowerCase().includes(normalizedSearchQuery);

    return matchesStatus && matchesSearch;
  });
  const downloadSavingsExcel = () => {
    const tableRows = filteredSavingsRows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.id)}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(row.type)}</td>
            <td>${escapeHtml(row.amount)}</td>
            <td>${escapeHtml(row.date)}</td>
            <td>${escapeHtml(row.status)}</td>
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
                <th>ID Simpanan</th>
                <th>Nama Anggota</th>
                <th>Jenis Simpanan</th>
                <th>Nominal</th>
                <th>Tanggal</th>
                <th>Status</th>
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
    link.download = "riwayat-simpanan-anggota.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };
  const closeActionMenu = useCallback(() => {
    setOpenActionMenuId(null);
  }, []);
  const confirmSavingsStatus = async () => {
    if (!statusConfirmation) {
      return;
    }

    const isUpdated = await updateSavingsStatus(
      statusConfirmation.savings.id,
      statusConfirmation.action === "approve" ? "TERVERIFIKASI" : "DITOLAK",
    );

    if (isUpdated) {
      setStatusConfirmation(null);
    }
  };
  const deleteSavings = async () => {
    if (!deleteTarget) {
      return;
    }

    const response = await fetch(
      `/api/simpanan/${encodeURIComponent(deleteTarget.id)}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      alert("Riwayat simpanan gagal dihapus. Silakan coba lagi.");
      return;
    }

    setDeleteTarget(null);
    setOpenActionMenuId(null);
    router.refresh();
  };
  const updateSavingsStatus = async (
    id: string,
    status: "TERVERIFIKASI" | "DITOLAK",
  ) => {
    const response = await fetch(`/api/simpanan/${encodeURIComponent(id)}`, {
      body: JSON.stringify({ status }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      alert(error?.message ?? "Status simpanan gagal diperbarui. Silakan coba lagi.");
      return false;
    }

    setOpenActionMenuId(null);
    router.refresh();
    return true;
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
                  Kelola Simpanan
                </h2>
                <p className="mt-2 text-base text-[#26322e]">
                  Kelola dan pantau semua transaksi simpanan anggota koperasi.
                </p>
              </div>
            </div>

            <section className="grid gap-5 xl:grid-cols-[1fr_1fr_290px]">
              <SummaryCard
                title="Total Simpanan Bulan Ini"
                value={summary.totalSavingsThisMonth}
                detail="Berdasarkan data bulan ini"
                detailTone="green"
                icon={<WalletIcon className="h-7 w-7" />}
                iconTone="green"
              />
              <SummaryCard
                title="Menunggu Verifikasi"
                value={`${summary.pendingVerificationCount} Transaksi`}
                detail="Perlu tindakan segera"
                detailTone="orange"
                icon={<ClipboardClockIcon className="h-7 w-7" />}
                iconTone="cream"
              />
              <div className="min-h-[154px] rounded-[22px] bg-[#185440] p-6 text-white shadow-[0_18px_28px_rgba(23,79,62,0.2)]">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#074332]">
                    <PiggyIcon className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[#8fc0ab]">
                      Total Simpanan Keseluruhan
                    </p>
                    <p className="mt-7 text-2xl font-extrabold">
                      {summary.totalSavingsAll}
                    </p>
                    <p className="mt-3 text-sm text-[#c7e2d7]">
                      Dari {summary.activeMembersCount} anggota aktif
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8 overflow-hidden rounded-[22px] bg-white shadow-[0_16px_34px_rgba(23,79,62,0.12)] ring-1 ring-black/10">
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-extrabold">
                  Riwayat Simpanan Anggota
                </h2>
                <div className="flex gap-3">
                  <label className="flex h-11 w-full min-w-[260px] items-center gap-3 rounded-lg bg-[#eeeed6] px-4 text-[#69716d]">
                    <SearchIcon className="h-5 w-5" />
                    <input
                      aria-label="Cari nama atau ID simpanan"
                      className="w-full bg-transparent text-sm text-[#10231d] outline-none placeholder:text-[#69716d]"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Cari nama atau ID..."
                      type="search"
                      value={searchQuery}
                    />
                  </label>
                  <div className="relative">
                    <button
                      aria-expanded={isFilterOpen}
                      aria-label="Filter simpanan"
                      className="flex h-11 min-w-12 items-center justify-center gap-2 rounded-lg bg-[#eeeed6] px-3 text-sm font-semibold text-[#10231d] hover:bg-[#e5e4c9]"
                      onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
                      type="button"
                    >
                      <FilterIcon className="h-5 w-5" />
                      {selectedStatus !== "Semua Status" ? (
                        <span className="hidden sm:inline">{selectedStatus}</span>
                      ) : null}
                    </button>

                    {isFilterOpen ? (
                      <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg bg-white py-2 shadow-[0_14px_28px_rgba(23,79,62,0.18)] ring-1 ring-black/10">
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
                              closeActionMenu();
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
                    className="flex h-11 items-center justify-center rounded-lg bg-[#eeeed6] px-6 text-sm font-extrabold text-[#10231d] shadow-sm ring-1 ring-black/10 transition hover:bg-[#e5e4c9]"
                    onClick={downloadSavingsExcel}
                    type="button"
                  >
                    Unduh
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse">
                  <thead className="bg-[#fbfbe8]">
                    <tr className="text-left text-sm font-extrabold text-[#26322e]">
                      <th className="px-7 py-5">Nama Anggota</th>
                      <th className="px-5 py-5">Jenis Simpanan</th>
                      <th className="px-5 py-5">Nominal</th>
                      <th className="px-5 py-5">Tanggal</th>
                      <th className="px-5 py-5">Status</th>
                      <th className="px-7 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSavingsRows.map((row) => (
                      <SavingsRow
                        key={row.id}
                        {...row}
                        isActionMenuOpen={openActionMenuId === row.id}
                        onCloseActionMenu={closeActionMenu}
                        onApprove={() => {
                          setStatusConfirmation({
                            action: "approve",
                            savings: row,
                          });
                          closeActionMenu();
                        }}
                        onDelete={() => {
                          setDeleteTarget(row);
                          closeActionMenu();
                        }}
                        onReject={() => {
                          setStatusConfirmation({
                            action: "reject",
                            savings: row,
                          });
                          closeActionMenu();
                        }}
                        onToggleActionMenu={() =>
                          setOpenActionMenuId((currentId) =>
                            currentId === row.id
                              ? null
                              : row.id,
                          )
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm sm:text-base">
                  Menampilkan {filteredSavingsRows.length} dari {savingsRows.length} data
                </p>
                {filteredSavingsRows.length > 0 ? (
                  <div className="flex items-center gap-5">
                    <button className="text-[#a7aaa4]" type="button">
                      ‹
                    </button>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-lg bg-[#034d3b] font-bold text-white"
                      type="button"
                    >
                      1
                    </button>
                    {filteredSavingsRows.length > 4 ? (
                      <>
                        <button type="button">2</button>
                        <button type="button">3</button>
                        <span>...</span>
                      </>
                    ) : null}
                    <button type="button">›</button>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </section>
      </div>
      {deleteTarget ? (
        <DeleteSavingsConfirmationModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteSavings}
        />
      ) : null}
      {statusConfirmation ? (
        <SavingsStatusConfirmationModal
          action={statusConfirmation.action}
          onCancel={() => setStatusConfirmation(null)}
          onConfirm={confirmSavingsStatus}
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

function SummaryCard({
  title,
  value,
  detail,
  detailTone,
  icon,
  iconTone,
}: {
  title: string;
  value: string;
  detail: string;
  detailTone: "green" | "orange";
  icon: React.ReactNode;
  iconTone: "green" | "cream";
}) {
  const detailClass =
    detailTone === "green" ? "text-[#009560]" : "text-[#dd6b00]";
  const iconClass =
    iconTone === "green"
      ? "bg-[#195c46] text-[#bde9d7]"
      : "bg-[#e5e4c9] text-[#6f6f5f]";

  return (
    <div className="min-h-[154px] rounded-[22px] bg-white p-6 shadow-[0_12px_26px_rgba(23,79,62,0.1)] ring-1 ring-black/10">
      <div className="flex items-start gap-5">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${iconClass}`}
        >
          {icon}
        </span>
        <div>
          <p className="text-sm font-extrabold text-[#26322e]">
            {title}
          </p>
          <p className="mt-9 text-2xl font-extrabold">{value}</p>
          <p className={`mt-2 text-sm ${detailClass}`}>
            {detailTone === "green" ? "↗" : "●"} {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function SavingsRow({
  id,
  initials,
  name,
  type,
  amount,
  date,
  status,
  statusTone,
  avatarTone,
  isAutomatic,
  isActionMenuOpen,
  onApprove,
  onCloseActionMenu,
  onDelete,
  onReject,
  onToggleActionMenu,
}: {
  id: string;
  initials: string;
  name: string;
  type: string;
  amount: string;
  date: string;
  status: string;
  statusTone: "green" | "yellow" | "red";
  avatarTone: "green" | "cream" | "brown" | "pink";
  isAutomatic: boolean;
  isActionMenuOpen: boolean;
  onApprove: () => void;
  onCloseActionMenu: () => void;
  onDelete: () => void;
  onReject: () => void;
  onToggleActionMenu: () => void;
}) {
  const avatarClass = {
    green: "bg-[#185440] text-[#bde9d7]",
    cream: "bg-[#dedec2] text-[#696955]",
    brown: "bg-[#743f37] text-[#ffd8d3]",
    pink: "bg-[#ffd8d5] text-[#c3171f]",
  }[avatarTone];
  const statusClass = {
    green: "bg-[#c9f8df] text-[#075f48]",
    yellow: "bg-[#ffe9aa] text-[#934000]",
    red: "bg-[#ffd6d6] text-[#b00000]",
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
          <span className="text-base font-extrabold">{name}</span>
        </div>
      </td>
      <td className="px-5 py-5">
        <span className="inline-flex rounded-full bg-[#eeeed6] px-4 py-1 text-sm font-bold ring-1 ring-black/10">
          {type}
        </span>
      </td>
      <td className="px-5 py-5 text-base font-extrabold">{amount}</td>
      <td className="px-5 py-5 text-base">{date}</td>
      <td className="px-5 py-5">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-extrabold ${statusClass}`}
        >
          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-current text-[9px] text-white">
            {statusTone === "green" ? "✓" : statusTone === "yellow" ? "◔" : "×"}
          </span>
          {status}
        </span>
      </td>
      <td className="px-7 py-5 text-right">
        <SavingsActionMenu
          detailHref={`/dashboard/simpanan/${id}`}
          isOpen={isActionMenuOpen}
          onClose={onCloseActionMenu}
          onApprove={onApprove}
          onDelete={onDelete}
          onReject={onReject}
          canDelete={!isAutomatic && status !== "Menunggu"}
          status={status}
          onToggle={onToggleActionMenu}
        />
      </td>
    </tr>
  );
}

function SavingsActionMenu({
  detailHref,
  isOpen,
  onClose,
  onApprove,
  onDelete,
  onReject,
  canDelete,
  status,
  onToggle,
}: {
  detailHref: string;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onDelete: () => void;
  onReject: () => void;
  canDelete: boolean;
  status: string;
  onToggle: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      return;
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex justify-end" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Buka menu aksi simpanan"
        className="rounded-md px-2 py-1 text-2xl font-extrabold leading-none text-[#69716d] transition hover:bg-[#eeeed6]"
        onClick={() => {
          updateMenuPosition();
          onToggle();
        }}
        ref={buttonRef}
        type="button"
      >
        ⋮
      </button>

      {isOpen ? (
        <div
          className="fixed z-50 min-w-[150px] overflow-hidden rounded-lg bg-white py-2 text-left shadow-[0_12px_28px_rgba(23,79,62,0.18)] ring-1 ring-black/10"
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
          {status === "Menunggu" ? (
            <>
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-[#10231d] transition hover:bg-[#fbfbe8]"
                onClick={onApprove}
                type="button"
              >
                <ProcessIcon className="h-4 w-4" />
                Setujui
              </button>
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-[#c3171f] transition hover:bg-[#fff0ef]"
                onClick={onReject}
                type="button"
              >
                <XCircleIcon className="h-4 w-4" />
                Tolak
              </button>
            </>
          ) : null}
          {canDelete ? (
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-[#c3171f] transition hover:bg-[#fff0ef]"
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

function DeleteSavingsConfirmationModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-[0_20px_45px_rgba(0,0,0,0.22)] ring-1 ring-black/10">
        <h3 className="text-xl font-extrabold text-[#10231d]">
          Hapus Riwayat Simpanan?
        </h3>
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

function SavingsStatusConfirmationModal({
  action,
  onCancel,
  onConfirm,
}: {
  action: "approve" | "reject";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const title =
    action === "approve" ? "Setujui Simpanan?" : "Tolak Simpanan?";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-[0_20px_45px_rgba(0,0,0,0.22)] ring-1 ring-black/10">
        <h3 className="text-xl font-extrabold text-[#10231d]">{title}</h3>
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

function ClipboardClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2h6l1 2h3v9.1a6.5 6.5 0 0 0-2-.9V6H7v12h5.2c.2.7.5 1.4.9 2H5V4h3l1-2Zm1 4h4l-.5-1h-3L10 6Zm8 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-.5 2v2.3l1.8 1.1.7-1.1-1.2-.7V16h-1.3Z" />
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 3a7 7 0 0 1 5.3 11.6l4.1 4-1.4 1.4-4.1-4A7 7 0 1 1 10 3Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h16v2H4V6Zm4 5h8v2H8v-2Zm3 5h2v2h-2v-2Z" />
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
