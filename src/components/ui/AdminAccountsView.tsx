"use client";

import { AccountStatusRefresher } from "@/components/AccountStatusRefresher";
import { AccountActionMenu } from "@/components/AccountActionMenu";
import { useCallback, useEffect, useRef, useState } from "react";

const TAB_VIEWER_SESSION_KEY = "koperasi.adminViewerSession";

const adminAccountMenuItems = [
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

type AccountRole = "ANGGOTA" | "ADMIN" | "SUPER ADMIN";
type AccountStatus = "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK";
type StatusFilter = "ALL" | "AKTIF" | "MENUNGGU" | "DITOLAK";

type AccountRow = {
  id: string;
  nama: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  isActive: boolean;
  createdAt: Date;
};

export function AdminAccountsView({
  accounts,
  currentSession,
}: {
  accounts: AccountRow[];
  currentSession: { id: string; role: AccountRole | null; userId: string } | null;
}) {
  const [viewerSession] = useState(() => getStoredViewerSession(currentSession));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const closeActionMenu = useCallback(() => {
    setOpenActionMenuId(null);
  }, []);
  const totalAccounts = accounts.length;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredAccounts = accounts.filter((account) => {
    const searchableAccountText = [
      account.nama,
      account.email,
      account.id,
    ].join(" ").toLowerCase();
    const matchesSearch =
      !normalizedSearchQuery ||
      searchableAccountText.includes(normalizedSearchQuery);
    const matchesStatus =
      statusFilter === "ALL" || account.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const activeMembers = accounts.filter(
    (account) => account.role === "ANGGOTA" && account.status === "AKTIF",
  ).length;
  const activeAdmins = accounts.filter(
    (account) => account.role !== "ANGGOTA",
  ).length;

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#10231d] lg:h-screen lg:overflow-hidden">
      <AccountStatusRefresher />
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
              <h1 className="text-lg font-bold text-[#0f4333] sm:text-xl">
                Dashboard Overview
              </h1>
            </div>
            <div className="flex items-center text-[#5c6b86]">
</div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
            <div className="mb-8 max-w-[760px]">
              <h2 className="text-2xl font-extrabold tracking-tight">
                Kelola Akun
              </h2>
              <p className="mt-2 text-base leading-relaxed text-[#26322e]">
                Manajemen penuh atas akses, peran, dan status seluruh anggota
                Koperasi Simpan Pinjam Tarunajaya. Pastikan data selalu
                mutakhir.
              </p>
            </div>

            <section className="grid gap-5 xl:grid-cols-3">
              <AccountSummaryCard
                title="Total Akun"
                value={totalAccounts.toString()}
                detail="Seluruh akun sistem"
                detailTone="green"
                icon={<UsersIcon className="h-7 w-7" />}
                iconTone="green"
              />
              <AccountSummaryCard
                title="Total Anggota"
                value={activeMembers.toString()}
                detail="Anggota aktif/diterima"
                detailTone="neutral"
                icon={<ClipboardAlertIcon className="h-7 w-7" />}
                iconTone="cream"
              />
              <AccountSummaryCard
                title="Total Admin"
                value={activeAdmins.toString()}
                detail="Seluruh admin dan super admin"
                detailTone="neutral"
                icon={<ShieldIcon className="h-7 w-7" />}
                iconTone="cream"
              />
            </section>

            <section className="mt-7 overflow-hidden rounded-2xl bg-white shadow-[0_14px_30px_rgba(23,79,62,0.12)] ring-1 ring-black/10">
              <div className="flex flex-col gap-4 border-b border-[#e4e4d8] p-5 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex h-12 w-full max-w-[430px] items-center gap-3 rounded-full bg-[#fbfbe8] px-5 text-[#8c948a]">
                  <SearchIcon className="h-5 w-5 text-[#26322e]" />
                  <input
                    aria-label="Cari nama, email, atau ID akun"
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#10231d] outline-none placeholder:text-[#8c948a] sm:text-base"
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      closeActionMenu();
                    }}
                    placeholder="Cari nama, email, atau ID..."
                    type="search"
                    value={searchQuery}
                  />
                </label>
                <div className="flex gap-3">
                  <AccountFilterMenu
                    selectedStatus={statusFilter}
                    onSelectStatus={setStatusFilter}
                  />
                  <ExportAccountsButton accounts={filteredAccounts} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#eeeeea] text-left text-sm font-extrabold text-[#26322e]">
                      <th className="px-7 py-5">Nama</th>
                      <th className="px-5 py-5">Email</th>
                      <th className="px-5 py-5">Peran</th>
                      <th className="px-5 py-5">Status</th>
                      <th className="px-5 py-5">Tanggal Daftar</th>
                      <th className="px-7 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <AccountTableRow
                        email={account.email}
                        id={account.id}
                        initials={getInitials(account.nama)}
                        key={`${account.role}-${account.id}`}
                        name={account.nama}
                        openMenuId={openActionMenuId}
                        onCloseMenu={closeActionMenu}
                        onToggleMenu={setOpenActionMenuId}
                        role={account.role}
                        status={account.status}
                        viewerRole={viewerSession?.role ?? null}
                        viewerSessionId={viewerSession?.id ?? null}
                        viewerUserId={viewerSession?.userId ?? null}
                        date={formatAccountDate(account.createdAt)}
                      />
                    ))}
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td
                          className="px-7 py-10 text-center text-sm font-semibold text-[#69716d]"
                          colSpan={6}
                        >
                          Tidak ada akun yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm sm:text-base">
                  Menampilkan{" "}
                  <strong>{filteredAccounts.length > 0 ? 1 : 0}</strong>{" "}
                  hingga <strong>{filteredAccounts.length}</strong> dari{" "}
                  <strong>{totalAccounts}</strong> akun
                </p>
                <div className="flex items-center gap-3">
                  <PaginationButton muted>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </PaginationButton>
                  <PaginationButton active>1</PaginationButton>
                  <PaginationButton>
                    <ChevronRightIcon className="h-4 w-4" />
                  </PaginationButton>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function getStoredViewerSession(
  currentSession: { id: string; role: AccountRole | null; userId: string } | null,
) {
  if (typeof window === "undefined") {
    return currentSession;
  }

  if (currentSession) {
    sessionStorage.setItem(
      TAB_VIEWER_SESSION_KEY,
      JSON.stringify(currentSession),
    );
    return currentSession;
  }

  return readStoredViewerSession();
}

function readStoredViewerSession() {
  const rawSession = sessionStorage.getItem(TAB_VIEWER_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as Partial<{
      id: string;
      role: AccountRole | null;
      userId: string;
    }>;

    if (
      typeof parsedSession.id === "string" &&
      typeof parsedSession.userId === "string" &&
      (parsedSession.role === "ANGGOTA" ||
        parsedSession.role === "ADMIN" ||
        parsedSession.role === "SUPER ADMIN" ||
        parsedSession.role === null)
    ) {
      return {
        id: parsedSession.id,
        role: parsedSession.role,
        userId: parsedSession.userId,
      };
    }
  } catch {
    sessionStorage.removeItem(TAB_VIEWER_SESSION_KEY);
  }

  return null;
}

function AccountFilterMenu({
  selectedStatus,
  onSelectStatus,
}: {
  selectedStatus: StatusFilter;
  onSelectStatus: (status: StatusFilter) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const selectedLabel = getStatusFilterLabel(selectedStatus);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      return;
    }

    const updateMenuPosition = () => {
      const buttonRect = buttonRef.current?.getBoundingClientRect();

      if (!buttonRect) {
        return;
      }

      setMenuPosition({
        top: buttonRect.bottom + 8,
        left: Math.max(16, buttonRect.right - 170),
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
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        className="flex h-12 items-center gap-2 rounded-full bg-[#fbfbe8] px-6 text-sm font-medium shadow-sm ring-1 ring-black/10 transition hover:bg-[#f0f1d5]"
        onClick={() => setIsOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <FilterIcon className="h-4 w-4" />
        {selectedStatus === "ALL" ? "Filter" : selectedLabel}
      </button>

      {isOpen ? (
        <div
          className="fixed z-50 min-w-[170px] overflow-hidden rounded-lg bg-white py-2 shadow-[0_12px_28px_rgba(23,79,62,0.18)] ring-1 ring-black/10"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
          }}
        >
          {(["ALL", "AKTIF", "MENUNGGU", "DITOLAK"] as const).map(
            (status) => (
              <button
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition hover:bg-[#fbfbe8] ${
                  selectedStatus === status ? "text-[#075f48]" : "text-[#10231d]"
                }`}
                key={status}
                onClick={() => {
                  onSelectStatus(status);
                  setIsOpen(false);
                }}
                type="button"
              >
                {getStatusFilterLabel(status)}
                {selectedStatus === status ? (
                  <span className="h-2 w-2 rounded-full bg-[#075f48]" />
                ) : null}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

function getStatusFilterLabel(status: StatusFilter) {
  const labels = {
    ALL: "Semua Status",
    AKTIF: "Aktif",
    MENUNGGU: "Menunggu",
    DITOLAK: "Ditolak",
  };

  return labels[status];
}

function ExportAccountsButton({ accounts }: { accounts: AccountRow[] }) {
  const downloadExcel = () => {
    const tableRows = accounts
      .map(
        (account, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(account.id)}</td>
            <td>${escapeHtml(account.nama)}</td>
            <td>${escapeHtml(account.email)}</td>
            <td>${escapeHtml(account.role)}</td>
            <td>${escapeHtml(getAccountStatusLabel(account.status))}</td>
            <td>${escapeHtml(formatAccountDate(account.createdAt))}</td>
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
                <th>No</th>
                <th>ID Akun</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Tanggal Daftar</th>
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
    link.download = "kelola-akun-koperasi.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="flex h-12 items-center gap-2 rounded-full bg-[#fbfbe8] px-6 text-sm font-medium shadow-sm ring-1 ring-black/10 transition hover:bg-[#f0f1d5]"
      onClick={downloadExcel}
      type="button"
    >
      <DownloadIcon className="h-4 w-4" />
      Ekspor
    </button>
  );
}

function getAccountStatusLabel(status: AccountStatus) {
  const labels = {
    AKTIF: "Aktif",
    NONAKTIF: "Nonaktif",
    MENUNGGU: "Menunggu",
    DITOLAK: "Ditolak",
  };

  return labels[status];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
        {adminAccountMenuItems.map((item) => (
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
        className="mt-auto flex h-10 items-center gap-3 border-t border-white/10 px-4 pt-8 text-sm font-semibold text-[#9bc4b4] hover:text-white"
        href="/logout"
      >
        <LogoutIcon className="h-5 w-5" />
        Keluar
      </a>
    </aside>
  );
}

function AccountSummaryCard({
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
  detailTone: "green" | "red" | "neutral";
  icon: React.ReactNode;
  iconTone: "green" | "red" | "cream";
}) {
  const detailClass = {
    green: "text-[#178459]",
    red: "text-[#c3171f]",
    neutral: "text-[#5f625d]",
  }[detailTone];
  const iconClass = {
    green: "bg-[#dff7ea] text-[#075f48]",
    red: "bg-[#ffe4e4] text-[#d33333]",
    cream: "bg-[#f0f1d5] text-[#7c7c68]",
  }[iconTone];

  return (
    <div className="relative min-h-[155px] overflow-hidden rounded-xl bg-white p-5 shadow-[0_10px_24px_rgba(23,79,62,0.1)] ring-1 ring-black/10">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#f2f4f2]" />
      <div
        className={`absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-lg ${iconClass}`}
      >
        {icon}
      </div>
      <p className="relative pr-14 text-base font-medium text-[#26322e]">
        {title}
      </p>
      <p className="relative mt-11 text-2xl font-extrabold">{value}</p>
      {detail ? (
        <p className={`relative mt-2 flex items-center gap-1 text-sm ${detailClass}`}>
          {detailTone === "green" ? "↗" : detailTone === "red" ? "△" : "ⓘ"}{" "}
          {detail}
        </p>
      ) : null}
    </div>
  );
}

function AccountTableRow({
  initials,
  name,
  id,
  email,
  role,
  status,
  viewerRole,
  viewerSessionId,
  viewerUserId,
  openMenuId,
  onCloseMenu,
  onToggleMenu,
  date,
}: {
  initials: string;
  name: string;
  id: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  viewerRole: AccountRole | null;
  viewerSessionId: string | null;
  viewerUserId: string | null;
  openMenuId: string | null;
  onCloseMenu: () => void;
  onToggleMenu: (id: string | null) => void;
  date: string;
}) {
  const menuId = `${role}-${id}`;
  const roleClass = {
    ANGGOTA: "bg-[#195c46] text-[#bfe6d6]",
    ADMIN: "bg-[#e1e1c6] text-[#5b604f]",
    "SUPER ADMIN": "bg-[#dff7ea] text-[#075f48]",
  }[role];
  const avatarClass = {
    ANGGOTA: "bg-[#e9faf3] text-[#10231d]",
    ADMIN: "bg-[linear-gradient(135deg,#a92b45,#f5b1a6)] text-white",
    "SUPER ADMIN": "bg-[#eef1d3] text-[#075f48]",
  }[role];
  const statusLabel = {
    AKTIF: "Aktif",
    NONAKTIF: "Nonaktif",
    MENUNGGU: "Menunggu",
    DITOLAK: "Ditolak",
  }[status];
  const statusClass = {
    AKTIF: "text-[#1c664f]",
    NONAKTIF: "text-[#d71920]",
    MENUNGGU: "text-[#9a7a00]",
    DITOLAK: "text-[#d71920]",
  }[status];

  return (
    <tr className="border-b border-[#eeeeea] text-sm last:border-b-0">
      <td className="px-7 py-5">
        <div className="flex items-center gap-4">
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-extrabold ${avatarClass}`}
          >
            {initials}
          </span>
          <div>
            <p className="text-base font-medium">{name}</p>
            <p className="text-sm text-[#38433e]">ID: {id}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-5 text-base">{email}</td>
      <td className="px-5 py-5">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${roleClass}`}
        >
          {role}
        </span>
      </td>
      <td
        className={`px-5 py-5 text-base ${statusClass}`}
      >
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle" />
        {statusLabel}
      </td>
      <td className="px-5 py-5 text-base">{date}</td>
      <td className="px-7 py-5 text-right">
        <AccountActionMenu
          accountId={id}
          accountRole={role}
          accountStatus={status}
          isOpen={openMenuId === menuId}
          onClose={onCloseMenu}
          onToggle={() => onToggleMenu(openMenuId === menuId ? null : menuId)}
          viewerRole={viewerRole}
          viewerSessionId={viewerSessionId}
          viewerUserId={viewerUserId}
        />
      </td>
    </tr>
  );
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

function formatAccountDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function PaginationButton({
  children,
  active,
  muted,
}: {
  children: React.ReactNode;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ring-1 ring-black/10 ${
        active
          ? "bg-[#075f48] text-white shadow-[0_8px_16px_rgba(23,79,62,0.22)]"
          : muted
            ? "bg-white text-[#c5c8c1]"
            : "bg-white text-[#10231d]"
      }`}
      type="button"
    >
      {children}
    </button>
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

function ClipboardAlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2h6l1 2h3v16H5V4h3l1-2Zm1.2 4h3.6l-.5-1h-2.6l-.5 1ZM11 8v5h2V8h-2Zm0 7v2h2v-2h-2Z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm1 13.9V18h-2v-2.1a3.7 3.7 0 0 1-2.5-1.4l1.2-1.2c.5.6 1.1.9 2 .9.8 0 1.3-.3 1.3-.9 0-.6-.6-.8-1.8-1.1-1.3-.4-2.5-.9-2.5-2.5 0-1.3.9-2.3 2.3-2.6V5h2v2c.8.2 1.5.6 2 1.1l-1.2 1.2c-.5-.5-1-.7-1.8-.7s-1.1.3-1.1.8c0 .6.5.7 1.7 1 1.4.4 2.7.9 2.7 2.7 0 1.4-.9 2.4-2.3 2.8Z" />
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 3h2v9l3-3 1.4 1.4L12 15.8l-5.4-5.4L8 9l3 3V3ZM5 18h14v2H5v-2Z" />
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m14.5 6 1.4 1.4-4.6 4.6 4.6 4.6-1.4 1.4-6-6 6-6Z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m9.5 18-1.4-1.4 4.6-4.6-4.6-4.6L9.5 6l6 6-6 6Z" />
    </svg>
  );
}
