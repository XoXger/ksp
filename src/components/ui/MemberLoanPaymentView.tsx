"use client";

import { kirimPembayaranPinjaman } from "@/app/pinjaman/bayar-tagihan/actions";
import { useRef, useState } from "react";

const paymentMenuItems = [
  { label: "Beranda", icon: HomeIcon, href: "/anggota" },
  { label: "Simpanan", icon: WalletIcon, href: "/simpanan" },
  { label: "Pinjaman", icon: MoneyIcon, href: "/pinjaman", active: true },
  { label: "SHU", icon: TrendIcon, href: "/shu" },
  { label: "Simulasi Pinjaman", icon: CalculatorIcon, href: "/simulasi-pinjaman" },
];

type MemberLoanPaymentHistory = {
  no: number;
  id: string;
  installment: string;
  date: string;
  amount: string;
  tenor: string;
  status: "Menunggu" | "Terverifikasi" | "Ditolak";
};

type ActivePaymentData = {
  amount: string;
  dueDate: string;
  loanId: string;
  memberId: string;
  rawAmount: string;
  totalLoan: string;
};

export function MemberLoanPaymentView({
  activePayment = null,
  memberId,
  paymentHistory,
}: {
  activePayment?: ActivePaymentData | null;
  memberId: string;
  paymentHistory: MemberLoanPaymentHistory[];
}) {
  const [proofError, setProofError] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const proofInputRef = useRef<HTMLInputElement>(null);

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
            {paymentMenuItems.map((item) => (
              <a
                className={`flex h-11 items-center gap-3 rounded-md px-4 text-sm font-semibold ${
                  item.active
                    ? "bg-[#386d5b] text-white"
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
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#d8d6cd] bg-white px-5 sm:px-7 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                aria-label="Buka menu"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#185440] text-white lg:hidden"
                type="button"
              >
                <HomeIcon className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-[#0f4333] sm:text-xl">
                Dashboard Overview
              </h1>
            </div>
            <div className="flex items-center gap-7 text-[#756f68]" />
          </header>

          <div className="flex-1 px-5 py-7 sm:px-7 lg:px-8">
            <div className="mx-auto max-w-[920px]">
              <a
                className="mb-6 inline-flex items-center gap-3 text-base font-medium text-[#10231d] hover:text-[#075f48]"
                href="/pinjaman"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Kembali
              </a>

              <div className="mb-8">
                <h2 className="text-2xl font-extrabold">
                  Bayar Tagihan Pinjaman
                </h2>
                <p className="mt-3 text-base text-[#26322e]">
                  Lengkapi pembayaran tagihan pinjaman Anda dan unggah bukti
                  transfer untuk diverifikasi admin.
                </p>
              </div>

              <form
                action={kirimPembayaranPinjaman}
                className="rounded-xl bg-white p-7 shadow-[0_12px_28px_rgba(23,79,62,0.08)] ring-1 ring-black/15"
              >
                <input name="memberId" type="hidden" value={memberId} />
                <input
                  name="loanId"
                  type="hidden"
                  value={activePayment?.loanId ?? ""}
                />
                <input
                  name="amount"
                  type="hidden"
                  value={activePayment?.rawAmount ?? "0"}
                />
                <section className="grid gap-5 md:grid-cols-3">
                  <InfoBox
                    label="Tagihan Saat Ini"
                    value={activePayment?.amount ?? "Rp 0"}
                  />
                  <InfoBox
                    label="Total Pinjaman"
                    value={activePayment?.totalLoan ?? "Rp 0"}
                  />
                  <InfoBox
                    label="Jatuh Tempo"
                    value={activePayment?.dueDate ?? "-"}
                  />
                </section>

                <label className="mt-7 block">
                  <span className="mb-3 block text-sm font-extrabold">
                    Rekening Koperasi
                  </span>
                  <input
                    className="h-14 w-full rounded-lg border border-[#b8c4bd] bg-[#f7f7ef] px-5 text-base font-semibold outline-none"
                    defaultValue="5307 9520 8472 8212 (BCA)"
                    readOnly
                  />
                </label>

                <div className="mt-7 border-t border-[#d8d8cd] pt-7">
                  <p className="mb-5 text-sm font-extrabold uppercase">
                    Upload Bukti
                  </p>
                  <label className="relative flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#b8c4bd] bg-white px-6 text-center transition hover:border-[#185440]">
                    {proofFileName ? (
                      <button
                        aria-label="Hapus bukti pembayaran"
                        className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-[#fff0ef] text-[#b00000] ring-1 ring-[#f2b8b5] transition hover:bg-[#ffe1df]"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          if (proofInputRef.current) {
                            proofInputRef.current.value = "";
                          }

                          setProofFileName("");
                          setProofError("");
                        }}
                        type="button"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    ) : null}
                    <UploadIcon className="h-10 w-10 text-[#6f7772]" />
                    <span className="mt-5 text-base">
                      {proofFileName || "Unggah Bukti Pembayaran"}
                    </span>
                    <span className="mt-3 text-sm text-[#6f7772]">
                      Format JPG atau PNG (Max 5MB)
                    </span>
                    {proofError ? (
                      <span className="mt-3 text-sm font-semibold text-[#b00000]">
                        {proofError}
                      </span>
                    ) : null}
                    <input
                      accept="image/png,image/jpeg"
                      className="sr-only"
                      name="paymentProof"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) {
                          setProofFileName("");
                          setProofError("");
                          return;
                        }

                        if (!["image/png", "image/jpeg"].includes(file.type)) {
                          event.target.value = "";
                          setProofFileName("");
                          setProofError("Bukti pembayaran wajib berupa JPG atau PNG.");
                          return;
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          event.target.value = "";
                          setProofFileName("");
                          setProofError("Ukuran bukti pembayaran maksimal 5MB.");
                          return;
                        }

                        setProofFileName(file.name);
                        setProofError("");
                      }}
                      ref={proofInputRef}
                      required
                      suppressHydrationWarning
                      type="file"
                    />
                  </label>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    className="h-12 rounded-full bg-[#185440] px-9 text-base font-medium uppercase text-white shadow-[0_10px_20px_rgba(23,79,62,0.18)] transition hover:bg-[#0f4333]"
                    disabled={!activePayment}
                    type="submit"
                  >
                    Kirim Pembayaran
                  </button>
                </div>
                {!activePayment ? (
                  <p className="mt-4 text-right text-sm font-semibold text-[#7a4936]">
                    Belum ada pinjaman disetujui yang dapat dibayar.
                  </p>
                ) : null}
              </form>

              <section className="mt-8 overflow-hidden rounded-xl bg-white shadow-[0_12px_28px_rgba(23,79,62,0.08)] ring-1 ring-black/15">
                <div className="p-6">
                  <h3 className="text-2xl font-extrabold text-[#063f30]">
                    Riwayat Pembayaran
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead className="bg-[#fbfcdf] text-sm font-extrabold uppercase text-[#26322e]">
                      <tr>
                        <th className="px-6 py-4">No.</th>
                        <th className="px-6 py-4">Angsuran</th>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Nominal</th>
                        <th className="px-6 py-4">Jangka Waktu</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dedbd4] text-base">
                      {paymentHistory.length > 0 ? paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-5">{payment.no}</td>
                          <td className="px-6 py-5">
                            <p className="text-lg font-extrabold text-[#063f30]">
                              {payment.installment}
                            </p>
                            <p className="mt-1 text-sm text-[#56615d]">
                              ID Pembayaran: {payment.id}
                            </p>
                          </td>
                          <td className="px-6 py-5">{payment.date}</td>
                          <td className="px-6 py-5 font-semibold">
                            {payment.amount}
                          </td>
                          <td className="px-6 py-5">{payment.tenor}</td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-extrabold ${getPaymentStatusClass(payment.status)}`}
                            >
                              <span className="h-2.5 w-2.5 rounded-full bg-current" />
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td
                            className="px-6 py-8 text-center text-[#56615d]"
                            colSpan={6}
                          >
                            Belum ada riwayat pembayaran.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getPaymentStatusClass(status: MemberLoanPaymentHistory["status"]) {
  if (status === "Terverifikasi") {
    return "bg-[#e9faf3] text-[#075f48]";
  }

  if (status === "Ditolak") {
    return "bg-[#fff2f2] text-[#d71920] ring-1 ring-[#f1b6b6]";
  }

  return "bg-[#dedcc2] text-[#26322e]";
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#fbfcdf] p-5 ring-1 ring-[#dedcca]">
      <p className="text-sm font-extrabold text-[#26322e]">{label}</p>
      <p className="mt-3 text-2xl font-extrabold text-[#063f30]">{value}</p>
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m10 5 1.4 1.4L7.8 10H20v2H7.8l3.6 3.6L10 17l-6-6 6-6Z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h10l4 4v14H5V3Zm9 1.5V8h3.5L14 4.5ZM11 18h2v-5l2 2 1.4-1.4L12 9.2l-4.4 4.4L9 15l2-2v5Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z" />
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

function UserCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 16a8 8 0 0 1-6.5-3.35C6.8 16.6 9.1 15.5 12 15.5s5.2 1.1 6.5 3.15A8 8 0 0 1 12 22Z" />
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
