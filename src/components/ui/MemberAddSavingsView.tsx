"use client";

import { useState } from "react";

const addSavingsMenuItems = [
  { label: "Beranda", icon: HomeIcon, href: "/anggota" },
  { label: "Simpanan", icon: WalletIcon, href: "/simpanan", active: true },
  { label: "Pinjaman", icon: MoneyIcon, href: "/pinjaman" },
  { label: "SHU", icon: TrendIcon, href: "/shu" },
  { label: "Simulasi Pinjaman", icon: CalculatorIcon, href: "/simulasi-pinjaman" },
];

type MemberAddSavingsViewProps = {
  error?: string;
  hasPaidMandatorySavingsThisMonth: boolean;
  memberId: string;
  memberName: string;
  formAction: (formData: FormData) => void;
  status?: "success" | "error";
};

export function MemberAddSavingsView({
  error,
  hasPaidMandatorySavingsThisMonth,
  memberId,
  memberName,
  formAction,
  status,
}: MemberAddSavingsViewProps) {
  const [selectedSavingsType, setSelectedSavingsType] = useState<
    "wajib" | "sukarela"
  >(hasPaidMandatorySavingsThisMonth ? "sukarela" : "wajib");
  const [amount, setAmount] = useState(
    hasPaidMandatorySavingsThisMonth ? "" : "300.000",
  );
  const [proofError, setProofError] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const minimumSavingsAmount =
    selectedSavingsType === "sukarela" ? 100_000 : 300_000;
  const today = new Date();
  const minimumTransferDate = new Date(today);
  const maxTransferDate = formatInputDate(today);

  minimumTransferDate.setDate(today.getDate() - 7);
  const minTransferDate = formatInputDate(minimumTransferDate);

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
            {addSavingsMenuItems.map((item) => (
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
            <div className="flex items-center justify-end text-[#5c6b86]">
</div>
          </header>

          <div className="flex-1 px-5 py-7 sm:px-7 lg:px-8">
            <div className="mx-auto max-w-[920px]">
              <a
                className="mb-6 inline-flex items-center gap-3 text-base font-medium text-[#10231d] hover:text-[#075f48]"
                href="/simpanan"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Kembali
              </a>

              <div className="mb-8">
                <h2 className="text-2xl font-extrabold">Tambah Simpanan</h2>
                <p className="mt-3 text-base text-[#26322e]">
                  Masukkan detail simpanan anggota dan unggah bukti transfer
                  yang sah.
                </p>
              </div>

              <form
                action={formAction}
                className="rounded-xl bg-white p-7 shadow-[0_12px_28px_rgba(23,79,62,0.1)] ring-1 ring-black/15"
              >
                <input name="anggotaId" type="hidden" value={memberId} />
                {status === "success" ? (
                  <p className="mb-5 rounded-lg bg-[#ebf8f0] px-4 py-3 text-sm text-[#0f4333]">
                    Simpanan berhasil dikirim.
                  </p>
                ) : null}
                {status === "error" ? (
                  <p className="mb-5 rounded-lg bg-[#fff1f1] px-4 py-3 text-sm text-[#7f1d1d]">
                    {getSavingsErrorMessage(error)}
                  </p>
                ) : null}
                {hasPaidMandatorySavingsThisMonth ? (
                  <p className="mb-5 rounded-lg bg-[#fbfbe8] px-4 py-3 text-sm font-semibold text-[#5f5b28]">
                    Simpanan wajib bulan ini sudah dibayarkan dan disetujui.
                    Anda masih dapat menambahkan Simpanan Sukarela.
                  </p>
                ) : null}
                <label className="block">
                  <span className="mb-3 block text-sm font-extrabold">
                    Nama Anggota
                  </span>
                  <input
                    className="h-14 w-full rounded-lg border border-[#b8c4bd] bg-[#fbfaf6] px-5 text-base outline-none placeholder:text-[#5c6b86] focus:border-[#185440]"
                    defaultValue={memberName}
                    name="memberName"
                    placeholder="Masukkan nama lengkap anggota"
                  />
                </label>

                <div className="mt-7">
                  <p className="mb-4 text-sm font-extrabold">Jenis Simpanan</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label
                      className={`flex h-14 cursor-pointer items-center gap-4 rounded-lg border px-5 transition ${
                        selectedSavingsType === "wajib"
                          ? "border-black bg-[#f8fffc]"
                          : "border-[#c3ccc6] bg-white"
                      } ${hasPaidMandatorySavingsThisMonth ? "cursor-not-allowed opacity-55" : ""}`}
                    >
                      <input
                        className="h-5 w-5 accent-[#185440]"
                        checked={selectedSavingsType === "wajib"}
                        disabled={hasPaidMandatorySavingsThisMonth}
                        name="savingsType"
                        onChange={() => {
                          setSelectedSavingsType("wajib");
                          setAmount("300.000");
                        }}
                        type="radio"
                        value="wajib"
                      />
                      <span className="text-base">Simpanan Wajib</span>
                    </label>
                    <label
                      className={`flex h-14 cursor-pointer items-center gap-4 rounded-lg border px-5 transition ${
                        selectedSavingsType === "sukarela"
                          ? "border-black bg-[#f8fffc]"
                          : "border-[#c3ccc6] bg-white"
                      }`}
                    >
                      <input
                        className="h-5 w-5 accent-[#185440]"
                        checked={selectedSavingsType === "sukarela"}
                        name="savingsType"
                        onChange={() => {
                          setSelectedSavingsType("sukarela");
                          setAmount("");
                        }}
                        type="radio"
                        value="sukarela"
                      />
                      <span className="text-base">Simpanan Sukarela</span>
                    </label>
                  </div>
                </div>

                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-3 block text-sm font-extrabold">
                      Nominal yang ditransfer
                    </span>
                    <span className="flex h-14 items-center rounded-lg border border-[#b8c4bd] bg-[#fbfaf6] px-5 text-base">
                      <span className="mr-4">Rp</span>
                      <input
                        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9aa39e]"
                        inputMode="numeric"
                        min={minimumSavingsAmount}
                        max={
                          selectedSavingsType === "wajib"
                            ? minimumSavingsAmount
                            : undefined
                        }
                        name="amount"
                        onChange={(event) =>
                          setAmount(
                            selectedSavingsType === "wajib"
                              ? "300.000"
                              : formatNumberInput(event.target.value),
                          )
                        }
                        placeholder={new Intl.NumberFormat("id-ID").format(
                          minimumSavingsAmount,
                        )}
                        readOnly={selectedSavingsType === "wajib"}
                        required
                        value={amount}
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-extrabold">
                      Tanggal transfer
                    </span>
                    <input
                      className="h-14 w-full rounded-lg border border-[#b8c4bd] bg-[#fbfaf6] px-5 text-base outline-none focus:border-[#185440]"
                      max={maxTransferDate}
                      min={minTransferDate}
                      name="transferDate"
                      type="date"
                    />
                  </label>
                </div>

                <div className="mt-7">
                  <p className="mb-3 text-sm font-extrabold">Bukti Transfer</p>
                  <label className="flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#b8c4bd] bg-[#fbfaf6] px-6 text-center transition hover:border-[#185440]">
                    <UploadIcon className="h-10 w-10 text-[#185440]" />
                    <span className="mt-5 text-base">
                      {proofFileName || "Klik untuk mengunggah"}
                    </span>
                    {!proofFileName ? (
                      <span className="mt-2 text-base">
                        atau seret dan lepas file di sini
                      </span>
                    ) : null}
                    <span className="mt-4 text-sm text-[#6f7772]">
                      Unggah bukti screenshot transfer ke rekening koperasi
                      (PNG, JPG, max 5MB)
                    </span>
                    {proofError ? (
                      <span className="mt-3 text-sm font-semibold text-[#b00000]">
                        {proofError}
                      </span>
                    ) : null}
                    <input
                      accept="image/png,image/jpeg"
                      className="sr-only"
                      name="proof"
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
                          setProofError("Bukti transfer harus berupa PNG atau JPG.");
                          return;
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          event.target.value = "";
                          setProofFileName("");
                          setProofError("Ukuran bukti transfer maksimal 5MB.");
                          return;
                        }

                        setProofFileName(file.name);
                        setProofError("");
                      }}
                      required
                      suppressHydrationWarning
                      type="file"
                    />
                  </label>
                </div>

                <div className="mt-8 border-t border-[#d8d8cd] pt-7">
                  <button
                    className="ml-auto flex h-12 items-center justify-center gap-3 rounded-full bg-[#185440] px-10 text-base font-medium text-[#b7d0c5] shadow-[0_10px_20px_rgba(23,79,62,0.22)] transition hover:bg-[#0f4333]"
                    type="submit"
                  >
                    <SendIcon className="h-4 w-4" />
                    Kirim
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getSavingsErrorMessage(error?: string) {
  if (error === "tanggal") {
    return "Tanggal transfer hanya boleh diisi dari 7 hari terakhir sampai hari ini.";
  }

  if (error === "bukti") {
    return "Bukti transfer wajib berupa gambar PNG atau JPG dengan ukuran maksimal 5MB.";
  }

  if (error === "nominal") {
    return "Nominal Simpanan Wajib harus Rp 300.000, sedangkan Simpanan Sukarela minimal Rp 100.000.";
  }

  if (error === "wajib-paid") {
    return "Simpanan wajib bulan ini sudah dibayarkan dan disetujui.";
  }

  return "Data simpanan tidak valid. Periksa kembali form Anda.";
}

function formatNumberInput(value: string) {
  const numericValue = value.replace(/[^\d]/g, "");

  return numericValue
    ? new Intl.NumberFormat("id-ID").format(Number(numericValue))
    : "";
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

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 4 21 12 3 20v-6l10-2-10-2V4Z" />
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
