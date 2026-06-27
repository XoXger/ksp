"use client";

import { type FormEvent, useState } from "react";
import {
  createLoanSimulation,
  MAX_LOAN_DURATION,
  MAX_LOAN_INTEREST_RATE,
  MIN_LOAN_DURATION,
  MIN_LOAN_INTEREST_RATE,
  MIN_LOAN_PRINCIPAL,
  type LoanInterestType,
} from "@/lib/loanSimulation";

const simulationMenuItems = [
  { label: "Beranda", icon: HomeIcon, href: "/anggota" },
  { label: "Simpanan", icon: WalletIcon, href: "/simpanan" },
  { label: "Pinjaman", icon: MoneyIcon, href: "/pinjaman" },
  { label: "SHU", icon: TrendIcon, href: "/shu" },
  {
    label: "Simulasi Pinjaman",
    icon: CalculatorIcon,
    href: "/simulasi-pinjaman",
    active: true,
  },
];

export function MemberLoanSimulationView() {
  const [principalInput, setPrincipalInput] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [interestType, setInterestType] =
    useState<LoanInterestType>("menurun");
  const [simulation, setSimulation] = useState(() =>
    createLoanSimulation({
      duration: 0,
      interestRate: 0,
      interestType: "menurun",
      principal: 0,
    }),
  );
  const interestLabel =
    simulation.interestType === "menurun" ? "Menurun" : "Flat";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const principal = parseCurrencyInput(principalInput);
    const duration = parsePositiveInteger(durationInput);
    const interestRate = parseDecimalNumber(interestInput);

    if (principal < MIN_LOAN_PRINCIPAL) {
      setValidationMessage("Nominal pinjaman minimal Rp 1.000.000.");
      return;
    }

    if (duration < MIN_LOAN_DURATION || duration > MAX_LOAN_DURATION) {
      setValidationMessage("Jangka waktu minimal 4 bulan dan maksimal 12 bulan.");
      return;
    }

    if (
      interestRate < MIN_LOAN_INTEREST_RATE ||
      interestRate > MAX_LOAN_INTEREST_RATE
    ) {
      setValidationMessage("Bunga minimal 0.5% dan maksimal 1.5% per bulan.");
      return;
    }

    setValidationMessage("");
    setSimulation(
      createLoanSimulation({
        duration,
        interestRate,
        interestType,
        principal,
      }),
    );
  }

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
            {simulationMenuItems.map((item) => (
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
              <h1 className="text-lg font-bold text-[#171717] sm:text-xl">
                Dashboard Overview
              </h1>
            </div>
            <div className="flex items-center justify-end text-[#756f68]">
</div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7 lg:px-8 lg:py-5">
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold">Simulasi Pinjaman</h2>
              <p className="mt-1 text-sm text-[#26322e]">
                Kalkulasi estimasi angsuran pinjaman Anda.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <section className="rounded-2xl bg-white p-6 shadow-[0_16px_32px_rgba(23,79,62,0.12)] ring-1 ring-black/15">
                <h3 className="text-xl font-extrabold text-[#063f30]">
                  Parameter Pinjaman
                </h3>

                <form className="mt-5 space-y-5" onSubmit={handleCalculate}>
                  <label className="block">
                    <span className="mb-2 block text-sm font-extrabold">
                      Pokok Pinjaman
                    </span>
                    <span className="flex h-12 items-center rounded-xl border border-[#bcc6bf] px-5 text-base">
                      <span className="mr-4">Rp</span>
                      <input
                        inputMode="numeric"
                        className="min-w-0 flex-1 bg-transparent outline-none"
                        name="principal"
                        onChange={(event) =>
                          setPrincipalInput(formatCurrencyInput(event.target.value))
                        }
                        value={principalInput}
                      />
                    </span>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-extrabold">
                        Jangka Waktu
                      </span>
                      <span className="flex h-12 items-center rounded-xl border border-[#bcc6bf] px-5 text-base">
                        <input
                          className="min-w-0 flex-1 bg-transparent outline-none"
                          inputMode="numeric"
                          name="duration"
                          onChange={(event) =>
                            setDurationInput(event.target.value)
                          }
                          value={durationInput}
                        />
                        <span>Bulan</span>
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-extrabold">
                        Bunga
                      </span>
                      <span className="flex h-12 items-center rounded-xl border border-[#bcc6bf] px-5 text-base">
                        <input
                          className="min-w-0 flex-1 bg-transparent outline-none"
                          inputMode="decimal"
                          name="interest"
                          onChange={(event) =>
                            setInterestInput(event.target.value)
                          }
                          value={interestInput}
                        />
                        <span>% per bulan</span>
                      </span>
                    </label>
                  </div>

                  <div className="border-t border-[#dedcca] pt-4">
                    <p className="mb-3 text-sm font-extrabold">
                      Tipe Bunga
                    </p>
                    <div className="flex flex-wrap gap-6 text-base">
                      <label className="flex items-center gap-3">
                        <input
                          className="h-4 w-4 accent-[#185440]"
                          checked={interestType === "menurun"}
                          name="interestType"
                          onChange={() => setInterestType("menurun")}
                          type="radio"
                        />
                        Menurun
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          className="h-4 w-4 accent-[#185440]"
                          checked={interestType === "flat"}
                          name="interestType"
                          onChange={() => setInterestType("flat")}
                          type="radio"
                        />
                        Tetap (Flat)
                      </label>
                    </div>
                  </div>

                  <button
                    className="flex h-12 w-full items-center justify-center gap-4 rounded-full bg-[#064535] text-sm font-extrabold uppercase text-white shadow-[0_12px_22px_rgba(23,79,62,0.18)] transition hover:bg-[#04382b]"
                    type="submit"
                  >
                    <CalculatorIcon className="h-5 w-5" />
                    Kalkulasi
                  </button>

                  {validationMessage ? (
                    <p className="rounded-xl bg-[#ffe3e3] px-4 py-3 text-sm font-semibold text-[#b00000]">
                      {validationMessage}
                    </p>
                  ) : null}
                </form>
              </section>

              <aside className="rounded-2xl bg-[#185440] p-6 text-white shadow-[0_18px_34px_rgba(23,79,62,0.22)]">
                <h3 className="text-xl font-extrabold">Pinjaman</h3>
                <p className="mt-2 text-base text-[#99bdaa]">
                  Hasil Kalkulasi Estimasi
                </p>

                <div className="mt-6 space-y-4 text-sm">
                  <ResultRow
                    label="Pokok Pinjaman"
                    value={formatRupiah(simulation.principal)}
                  />
                  <ResultRow
                    label="Jangka Waktu"
                    value={`${simulation.duration} Bulan`}
                  />
                  <ResultRow
                    label={`Bunga (${interestLabel})`}
                    value={`${formatPercent(simulation.interestRate)}% / Bulan`}
                  />
                </div>

                <div className="mt-5 rounded-xl border border-white/15 bg-white/5 p-5">
                  <h4 className="text-sm font-extrabold text-[#d3e7de]">
                    Rincian Angsuran per Bulan
                  </h4>
                  <div className="mt-4 space-y-3 text-sm">
                    <ResultRow
                      label="Angsuran Pokok"
                      value={formatRupiah(simulation.firstRow.principalPayment)}
                    />
                    <ResultRow
                      label="Angsuran Bunga"
                      value={formatRupiah(simulation.firstRow.interestPayment)}
                    />
                  </div>
                  <div className="mt-4 border-t border-white/20 pt-4">
                    <p className="text-xs uppercase text-[#99bdaa]">
                      Total Angsuran per Bulan
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-[#b9efd9]">
                      {formatRupiah(simulation.firstRow.totalPayment)}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-center text-xs leading-5 text-[#8fb6a5]">
                  *Simulasi ini hanya perkiraan. Hasil aktual dapat berbeda
                  sesuai kebijakan Koperasi.
                </p>
              </aside>
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_16px_32px_rgba(23,79,62,0.12)] ring-1 ring-black/15">
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
                <div>
                  <h3 className="text-xl font-extrabold text-[#063f30]">
                    Tabel Angsuran
                  </h3>
                  <p className="mt-1 text-sm text-[#5e6b65]">
                    Rincian estimasi angsuran selama masa pinjaman.
                  </p>
                </div>
                <span className="rounded-full bg-[#eef0d6] px-4 py-2 text-sm font-extrabold text-[#063f30]">
                  {interestLabel}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] border-collapse text-left">
                  <thead className="bg-[#fbfae8] text-sm font-extrabold text-[#10231d]">
                    <tr>
                      <th className="px-6 py-4">No.</th>
                      <th className="px-6 py-4">Bulan</th>
                      <th className="px-6 py-4">Sisa Pokok Awal</th>
                      <th className="px-6 py-4">Pokok</th>
                      <th className="px-6 py-4">Bunga</th>
                      <th className="px-6 py-4 text-right">Total Angsuran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e7d8] text-sm">
                    {simulation.installmentRows.map((row) => (
                      <tr className="hover:bg-[#fbfcdf]/60" key={row.month}>
                        <td className="px-6 py-4">{row.month}</td>
                        <td className="px-6 py-4 font-semibold">
                          Bulan {row.month}
                        </td>
                        <td className="px-6 py-4">
                          {formatRupiah(row.openingPrincipal)}
                        </td>
                        <td className="px-6 py-4">
                          {formatRupiah(row.principalPayment)}
                        </td>
                        <td className="px-6 py-4">
                          {formatRupiah(row.interestPayment)}
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-[#063f30]">
                          {formatRupiah(row.totalPayment)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatRupiah(value: number) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

function formatCurrencyInput(value: string) {
  const numericValue = value.replace(/\D/g, "");

  return numericValue ? Number(numericValue).toLocaleString("id-ID") : "";
}

function formatPercent(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toString();
}

function parseCurrencyInput(value: string) {
  const parsedValue = Number(value.replace(/\D/g, ""));

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

function parseDecimalNumber(value: string) {
  const parsedValue = Number(value.replace(",", "."));

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

function parsePositiveInteger(value: string) {
  const parsedValue = Number.parseInt(value.replace(/\D/g, ""), 10);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4 last:border-b-0 last:pb-0">
      <span className="text-[#99bdaa]">{label}</span>
      <strong>{value}</strong>
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
      <path d="M4 6h14a2 2 0 0 1 2 2v1h-6a4 4 0 0 0 0 8h6v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm10 5h7v4h-7a2 2 0 1 1 0-4Z" />
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
