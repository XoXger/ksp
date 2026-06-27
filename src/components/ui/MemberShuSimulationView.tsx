"use client";

import { useState } from "react";

const menuItems = [
  { label: "Beranda", icon: HomeIcon, href: "/anggota" },
  { label: "Simpanan", icon: WalletIcon, href: "/simpanan" },
  { label: "Pinjaman", icon: MoneyIcon, href: "/pinjaman" },
  { label: "SHU", icon: TrendIcon, href: "/shu", active: true },
  { label: "Simulasi Pinjaman", icon: CalculatorIcon, href: "/simulasi-pinjaman" },
];

function toCurrency(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(value))}`;
}

function toInputCurrency(value: string) {
  const numericValue = value.replace(/[^\d]/g, "");

  return numericValue ? new Intl.NumberFormat("id-ID").format(Number(numericValue)) : "";
}

const SIMULATION_SAVINGS_SERVICE_RATE = 0.06 * 0.7;
const SIMULATION_LOAN_SERVICE_RATE = 0.015 * 0.3;

export function MemberShuSimulationView() {
  const [totalSimpanan, setTotalSimpanan] = useState("");
  const [totalPinjaman, setTotalPinjaman] = useState("");
  const [totalShu, setTotalShu] = useState(0);

  const calculateShu = () => {
    const simpanan = Number(totalSimpanan.replace(/[^\d]/g, "")) || 0;
    const pinjaman = Number(totalPinjaman.replace(/[^\d]/g, "")) || 0;
    const shuSimpanan = simpanan * SIMULATION_SAVINGS_SERVICE_RATE;
    const shuPinjaman = pinjaman * SIMULATION_LOAN_SERVICE_RATE;

    setTotalShu(Math.max(shuSimpanan + shuPinjaman, 0));
  };

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#10231d]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[230px] shrink-0 flex-col bg-[#185440] px-5 py-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#185440]">
              <BankIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-extrabold uppercase">Tarunajaya</p>
              <p className="text-xs text-[#c7ddd3]">Koperasi Simpan Pinjam</p>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10" />
          <nav className="mt-8 space-y-3">
            {menuItems.map((item) => (
              <a
                className={`flex h-11 items-center gap-3 rounded-md px-4 text-sm font-semibold ${
                  item.active ? "bg-[#075f48] text-white" : "text-[#9bc4b4] hover:bg-[#0f6049] hover:text-white"
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
            <a className="flex h-10 items-center gap-3 px-4 text-sm font-semibold text-[#9bc4b4] hover:text-white" href="/logout">
              <LogoutIcon className="h-5 w-5" />
              Keluar
            </a>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dcdcc0] bg-white px-5 sm:px-7 lg:px-8">
            <h1 className="text-lg font-bold text-[#171717] sm:text-xl">Dashboard Overview</h1>
            <div className="text-[#1c2c27]">
</div>
          </header>

          <div className="px-5 py-7 sm:px-7 lg:px-8">
            <a className="mb-8 inline-flex items-center gap-3 text-base font-medium text-[#10231d] hover:text-[#075f48]" href="/shu">
              <ArrowLeftIcon className="h-4 w-4" />
              Kembali
            </a>

            <h2 className="text-2xl font-extrabold text-[#063f30] sm:text-3xl">Simulasi Sisa Hasil Usaha (SHU)</h2>
            <p className="mt-3 max-w-5xl text-base leading-relaxed text-[#10231d] sm:text-lg">
              Gunakan kalkulator di bawah ini untuk mengestimasi bagian SHU Anda berdasarkan simpanan dan pinjaman.
            </p>

            <div className="mt-10">
              <section className="w-full rounded-2xl border border-[#bcc6bf] bg-white p-6">
                <h3 className="text-2xl font-extrabold sm:text-3xl">Parameter Simulasi</h3>
                <div className="mt-8 max-w-[520px] space-y-6">
                  <label className="block">
                    <span className="mb-3 block text-base font-semibold sm:text-lg">Total Simpanan Anda</span>
                    <div className="flex h-12 w-full items-center rounded-xl border border-[#bcc6bf] bg-white px-4 text-xl outline-none sm:text-2xl">
                      <span className="mr-4 text-base sm:text-lg">Rp</span>
                      <input
                        className="h-full flex-1 bg-transparent outline-none"
                        inputMode="numeric"
                        onChange={(event) => setTotalSimpanan(event.target.value.replace(/[^\d]/g, ""))}
                        value={toInputCurrency(totalSimpanan)}
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-3 block text-base font-semibold sm:text-lg">Total Pinjaman Anda</span>
                    <div className="flex h-12 w-full items-center rounded-xl border border-[#bcc6bf] bg-white px-4 text-xl outline-none sm:text-2xl">
                      <span className="mr-4 text-base sm:text-lg">Rp</span>
                      <input
                        className="h-full flex-1 bg-transparent outline-none"
                        inputMode="numeric"
                        onChange={(event) => setTotalPinjaman(event.target.value.replace(/[^\d]/g, ""))}
                        value={toInputCurrency(totalPinjaman)}
                      />
                    </div>
                  </label>
                  <button
                    className="h-12 rounded-xl bg-[#185440] px-8 text-base font-extrabold text-white transition hover:bg-[#0f4333]"
                    onClick={calculateShu}
                    type="button"
                  >
                    Hitung
                  </button>
                </div>
                <div className="mt-8">
                  <p className="text-xl font-extrabold text-black sm:text-2xl">
                    Total Estimasi SHU Anda
                  </p>
                  <p className="mt-3 text-4xl font-normal text-black sm:text-5xl">
                    {toCurrency(totalShu)}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function BankIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 3 7.5v2h18v-2L12 3Zm-6 8v6H4v2h16v-2h-2v-6h-2v6h-3v-6h-2v6H8v-6H6Z" /></svg>; }
function HomeIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 3 10v11h7v-6h4v6h7V10L12 3Z" /></svg>; }
function WalletIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h14a2 2 0 0 1 2 2v1h-6a4 4 0 0 0 0 8h6v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm10 5h7v4h-7a2 2 0 1 1 0-4Z" /></svg>; }
function MoneyIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v12H3V6Zm2 3a3 3 0 0 0 3-1H5v1Zm0 6v1h3a3 3 0 0 0-3-1Zm14 1v-1a3 3 0 0 0-3 1h3Zm0-8h-3a3 3 0 0 0 3 1V8Zm-7 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>; }
function TrendIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 16.5 9.5 11l3 3L20 6.5V12h2V3h-9v2h5.5l-6 6-3-3L2.5 15 4 16.5Z" /></svg>; }
function CalculatorIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14v18H5V3Zm3 3v4h8V6H8Zm0 7v2h2v-2H8Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Zm-8 4v2h2v-2H8Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z" /></svg>; }
function ArrowLeftIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m10 5 1.4 1.4L7.8 10H20v2H7.8l3.6 3.6L10 17l-6-6 6-6Z" /></svg>; }
function BellIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm-7-4h14v-2l-2-2.5V10a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v3.5L5 16v2Z" /></svg>; }
function LogoutIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h9v2H6v12h7v2H4V4Zm11.5 4.5 1.4-1.4L22 12l-5.1 4.9-1.4-1.4L18 13h-8v-2h8l-2.5-2.5Z" /></svg>; }
