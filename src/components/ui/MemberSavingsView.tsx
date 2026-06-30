"use client";

const savingsMenuItems = [
  { label: "Beranda", icon: HomeIcon, href: "/anggota" },
  { label: "Simpanan", icon: WalletIcon, href: "/simpanan", active: true },
  { label: "Pinjaman", icon: MoneyIcon, href: "/pinjaman" },
  { label: "SHU", icon: TrendIcon, href: "/shu" },
  { label: "Simulasi Pinjaman", icon: CalculatorIcon, href: "/simulasi-pinjaman" },
];

export type MemberSavingsBalances = {
  pokok: string;
  wajib: string;
  sukarela: string;
};

export type MemberSavingsHistoryRow = {
  id: string;
  type: string;
  amount: string;
  date: string;
  proof: string;
};

function getSavingsItems(balances: MemberSavingsBalances) {
  return [
  {
    title: "SIMPANAN POKOK",
    description: "Wajib bagi anggota baru",
    balance: balances.pokok,
    icon: PiggyIcon,
  },
  {
    title: "SIMPANAN WAJIB",
    description: "Simpanan berkala bulanan",
    balance: balances.wajib,
    icon: RequiredSavingsIcon,
  },
  {
    title: "SIMPANAN SUKARELA",
    description: "Fleksibel setiap saat",
    balance: balances.sukarela,
    icon: HandHeartIcon,
  },
  ];
}

export function MemberSavingsView({
  balances,
  historyRows = [],
  totalManagedSavings,
}: {
  balances: MemberSavingsBalances;
  historyRows?: MemberSavingsHistoryRow[];
  totalManagedSavings: string;
}) {
  const savingsItems = getSavingsItems(balances);
  const downloadSavingsHistory = () => {
    const totalSavings = historyRows.reduce(
      (total, row) => total + Number(row.amount.replace(/[^\d]/g, "")),
      0,
    );
    const tableRows = historyRows
      .map(
        (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(row.id)}</td>
            <td>${escapeHtml(row.type)}</td>
            <td>${escapeHtml(row.amount)}</td>
            <td>${escapeHtml(row.date)}</td>
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
                <th>No.</th>
                <th>ID Transaksi</th>
                <th>Jenis Simpanan</th>
                <th>Nominal</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr>
                <td colspan="3"><strong>Total Simpanan</strong></td>
                <td><strong>Rp ${new Intl.NumberFormat("id-ID").format(totalSavings)}</strong></td>
                <td></td>
              </tr>
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
            {savingsMenuItems.map((item) => (
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
            <div className="flex items-center justify-end text-[#1c2c27]">
</div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
            <h2 className="mb-7 text-2xl font-extrabold tracking-tight">
              Simpanan
            </h2>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <section className="rounded-2xl bg-white p-6 shadow-[0_12px_28px_rgba(23,79,62,0.1)] ring-1 ring-black/10">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#185440] text-white">
                      <InfoIcon className="h-5 w-5" />
                    </span>
                    <h3 className="text-xl font-medium text-[#244038]">
                      Informasi Simpanan
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      className="flex h-12 items-center gap-3 rounded-full bg-[#185440] px-6 text-sm font-semibold uppercase text-white shadow-[0_12px_20px_rgba(23,79,62,0.16)] transition hover:bg-[#0f4333]"
                      href="/simpanan/tambah"
                    >
                      <span className="text-xl leading-none">+</span>
                      Tambah Simpanan
                    </a>
                    <button
                      aria-label="Cetak simpanan"
                      className="grid h-12 w-12 place-items-center rounded-full border border-[#cfd3c2] bg-white text-[#66706a] transition hover:bg-[#f6f7ee]"
                      onClick={downloadSavingsHistory}
                      type="button"
                    >
                      <PrinterIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {savingsItems.map((item) => (
                    <SavingsCard key={item.title} {...item} />
                  ))}
                </div>
              </section>

              <aside className="h-fit overflow-hidden rounded-2xl bg-[#185440] p-7 text-white shadow-[0_18px_34px_rgba(23,79,62,0.2)]">
                <p className="text-sm font-medium uppercase text-[#36ddb0]">
                  Total Simpanan Kelolaan
                </p>
                <ResponsiveCurrency amount={totalManagedSavings} />
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function ResponsiveCurrency({ amount }: { amount: string }) {
  const digitCount = amount.replace(/\D/g, "").length;
  const sizeClass =
    digitCount >= 13
      ? "text-xl"
      : digitCount >= 10
        ? "text-2xl"
        : digitCount >= 7
          ? "text-3xl"
          : "text-4xl";
  const currencySizeClass =
    digitCount >= 13
      ? "text-xs"
      : digitCount >= 10
        ? "text-sm"
        : digitCount >= 7
          ? "text-base"
          : "text-lg";

  return (
    <p className="mt-4 flex min-w-0 items-end gap-2">
      <span className={`pb-1 text-[#cde1d8] ${currencySizeClass}`}>Rp</span>
      <span
        className={`min-w-0 whitespace-nowrap font-extrabold leading-none tracking-tight ${sizeClass}`}
      >
        {amount}
      </span>
    </p>
  );
}

function SavingsCard({
  title,
  description,
  balance,
  icon: Icon,
}: {
  title: string;
  description: string;
  balance: string;
  icon: (props: { className?: string }) => React.ReactNode;
}) {
  return (
    <article className="grid gap-5 rounded-xl bg-[#f7f7df] p-6 ring-1 ring-black/10 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex items-start gap-4">
        <Icon className="mt-1 h-6 w-6 shrink-0" />
        <div>
          <h4 className="text-xl font-extrabold">{title}</h4>
          <p className="mt-3 text-base text-[#69706c]">{description}</p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-sm uppercase text-[#26322e]">
          Saldo Aktif
        </p>
        <p className="mt-2 text-2xl font-bold text-[#09291f]">{balance}</p>
      </div>
    </article>
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

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h7v7H4V4Zm2 2v3h3V6H6Zm7-2h7v7h-7V4Zm2 2v3h3V6h-3ZM4 13h7v7H4v-7Zm2 2v3h3v-3H6Zm7-2h7v7h-7v-7Zm2 2v3h3v-3h-3Z" />
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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 10h2v7h-2v-7Zm0-3h2v2h-2V7Zm1-5a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
    </svg>
  );
}

function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 3h10v5H7V3Zm-2 7h14a3 3 0 0 1 3 3v5h-4v3H6v-3H2v-5a3 3 0 0 1 3-3Zm3 7v2h8v-5H8v3Zm10-3h2v-1h-2v1Z" />
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

function RequiredSavingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h14a2 2 0 0 1 2 2v1h-6a4 4 0 0 0 0 8h6v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm10 5h7v4h-7a2 2 0 1 1 0-4Zm0 1.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM4 4h12v1H4V4Z" />
    </svg>
  );
}

function HandHeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.1 6.5 12 6.6l-.1-.1a2.8 2.8 0 0 0-4 4L12 14.7l4.1-4.2a2.8 2.8 0 0 0-4-4ZM3 14h4.5l2 2H14a2 2 0 0 1 1.7.9l4.3-2.5 1 1.7-6.3 3.7H9.2L6.7 17H3v-3Z" />
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
