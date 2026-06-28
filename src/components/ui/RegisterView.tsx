"use client";

import { useRef, useState } from "react";

type RegisterStatus = string | undefined;

export function RegisterView({
  formAction,
  status,
}: {
  formAction: (formData: FormData) => void;
  status?: RegisterStatus;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedSubmit, setConfirmedSubmit] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusMessage = getRegisterStatusMessage(status);

  return (
    <main className="min-h-screen bg-[#f4f5dc] text-[#101814]">
      <header className="flex h-20 items-center bg-[#174f3e] px-6 shadow-sm sm:px-10">
        <h1 className="text-base font-extrabold uppercase text-white sm:text-xl">
          Koperasi Simpan Pinjam Tarunajaya
        </h1>
      </header>

      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-5">
        <div className="w-full max-w-[520px] rounded-[14px] bg-white px-8 py-8 shadow-[0_20px_45px_rgba(23,79,62,0.12)] sm:px-12">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f1d5] text-[#174f3e]">
              <svg
                aria-hidden="true"
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3 3 7.5v2h18v-2L12 3Zm-6 8v6H4v2h16v-2h-2v-6h-2v6h-3v-6h-2v6H8v-6H6Z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Daftar</h2>
            <p className="mt-3 text-base text-[#27322d]">
              silahkan daftar untuk membuat akun
            </p>
          </div>

          {statusMessage ? (
            <div
              className={`mb-5 rounded-lg px-4 py-3 text-center text-sm font-semibold ${
                statusMessage.tone === "success"
                  ? "bg-[#e1f7ec] text-[#075f48]"
                  : "bg-[#ffe8e6] text-[#b00000]"
              }`}
            >
              {statusMessage.text}
            </div>
          ) : null}

          <form
            action={formAction}
            className="space-y-5"
            onSubmit={(event) => {
              if (confirmedSubmit) {
                return;
              }

              event.preventDefault();
              setShowConfirmation(true);
            }}
            ref={formRef}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Nama</span>
              <input
                className="h-14 w-full rounded bg-[#e7e6cd] px-5 text-base text-[#26332f] outline-none placeholder:text-[#8c968f] focus:ring-2 focus:ring-[#174f3e]"
                type="text"
                name="name"
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
                minLength={3}
                onInvalid={(event) => {
                  event.currentTarget.setCustomValidity(
                    "Nama minimal berisi 3 huruf",
                  );
                }}
                onInput={(event) => {
                  event.currentTarget.setCustomValidity("");
                }}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input
                className="h-14 w-full rounded bg-[#e7e6cd] px-5 text-base text-[#26332f] outline-none placeholder:text-[#8c968f] focus:ring-2 focus:ring-[#174f3e]"
                type="email"
                name="email"
                placeholder="nama@email.com"
                autoComplete="email"
                pattern="[A-Za-z0-9._%+-]{6,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
                title="Email minimal 6 karakter sebelum @ dan harus memakai format email yang valid."
                onInvalid={(event) => {
                  event.currentTarget.setCustomValidity(
                    "Email minimal berisi 6 huruf ditambah '@' perusahaan",
                  );
                }}
                onInput={(event) => {
                  event.currentTarget.setCustomValidity(
                    isValidRegisterEmailInput(event.currentTarget.value)
                      ? ""
                      : "Email minimal berisi 6 huruf ditambah '@' perusahaan",
                  );
                }}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Kata Sandi
              </span>
              <span className="flex h-14 items-center rounded bg-[#e7e6cd] px-5 text-[#26332f] focus-within:ring-2 focus-within:ring-[#174f3e]">
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#8c968f]"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Kata Sandi"
                  autoComplete="new-password"
                  maxLength={8}
                  onInvalid={(event) => {
                    event.currentTarget.setCustomValidity(
                      "Kata sandi harus berisi 8 karakter",
                    );
                  }}
                  onInput={(event) => {
                    event.currentTarget.setCustomValidity(
                      event.currentTarget.value.length === 8
                        ? ""
                        : "Kata sandi harus berisi 8 karakter",
                    );
                  }}
                  required
                />
                <button
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Lihat kata sandi"
                  }
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md transition hover:bg-[#d8d7bd]"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeOffIcon className="h-5 w-5" />
                  )}
                </button>
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Nomor seluler
              </span>
              <span className="flex h-14 overflow-hidden rounded bg-[#e7e6cd] text-base text-[#26332f] focus-within:ring-2 focus-within:ring-[#174f3e]">
                <input
                  className="h-full min-w-0 flex-1 bg-transparent px-5 outline-none placeholder:text-[#8c968f]"
                  type="tel"
                  name="phone"
                  placeholder="088123456789"
                  autoComplete="tel"
                  inputMode="numeric"
                  minLength={10}
                  maxLength={12}
                  pattern="[0-9]{10,12}"
                  title="Nomor seluler harus berisi 10 sampai 12 digit angka tanpa simbol atau huruf."
                  onInvalid={(event) => {
                    event.currentTarget.setCustomValidity(
                      "Nomor seluler harus berisi 10 sampai 12 digit angka tanpa simbol atau huruf.",
                    );
                  }}
                  onInput={(event) => {
                    event.currentTarget.value = event.currentTarget.value.replace(
                      /\D/g,
                      "",
                    );
                    event.currentTarget.setCustomValidity(
                      /^[0-9]{10,12}$/.test(event.currentTarget.value)
                        ? ""
                        : "Nomor seluler harus berisi 10 sampai 12 digit angka tanpa simbol atau huruf.",
                    );
                  }}
                  required
                />
              </span>
            </label>

            <fieldset>
              <legend className="mb-3 text-sm font-medium">
                Jenis Kelamin
              </legend>
              <div className="flex flex-wrap gap-8 text-base">
                <label className="flex items-center gap-3">
                  <input
                    className="h-5 w-5 accent-[#174f3e]"
                    type="radio"
                    name="gender"
                    value="male"
                    required
                  />
                  Laki-laki
                </label>
                <label className="flex items-center gap-3">
                  <input
                    className="h-5 w-5 accent-[#174f3e]"
                    type="radio"
                    name="gender"
                    value="female"
                    required
                  />
                  Perempuan
                </label>
              </div>
            </fieldset>

            <label className="flex items-center gap-3 text-sm sm:text-base">
              <input
                className="h-5 w-5 rounded accent-[#174f3e]"
                type="checkbox"
                name="terms"
                required
              />
              Saya setuju dengan ketentuan dan syarat yang berlaku
            </label>

            <button
              className="mt-6 flex h-[56px] w-full items-center justify-center gap-4 rounded-full bg-[#185440] text-base font-extrabold uppercase text-white shadow-[0_13px_20px_rgba(0,54,40,0.16)] transition hover:bg-[#0f4333] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#174f3e]"
              type="submit"
            >
              Daftar
              <span aria-hidden="true" className="text-2xl leading-none">
                →
              </span>
            </button>

            <p className="pt-4 text-center text-sm sm:text-base">
              Sudah memiliki akun?{" "}
              <a className="font-bold text-[#174f3e]" href="/login">
                Masuk disini
              </a>
            </p>
          </form>
        </div>
      </section>

      {showConfirmation ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
          <div className="w-full max-w-[380px] rounded-xl bg-white p-6 text-center shadow-[0_18px_42px_rgba(0,0,0,0.24)] ring-1 ring-black/10">
            <h3 className="text-lg font-extrabold text-[#10231d]">
              Konfirmasi data pendaftaran
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#52615b]">
              Pastikan data yang Anda masukkan sudah benar sebelum dikirim.
              Lanjutkan pendaftaran?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                className="h-10 rounded-full bg-[#185440] px-8 text-sm font-extrabold text-white"
                onClick={() => {
                  setConfirmedSubmit(true);
                  setShowConfirmation(false);
                  window.setTimeout(() => formRef.current?.requestSubmit(), 0);
                }}
                type="button"
              >
                Ya
              </button>
              <button
                className="h-10 rounded-full bg-[#f0f0d8] px-8 text-sm font-extrabold text-[#10231d] ring-1 ring-black/10"
                onClick={() => setShowConfirmation(false)}
                type="button"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function getRegisterStatusMessage(status: RegisterStatus) {
  if (status === "waiting") {
    return {
      text: "Pendaftaran berhasil. Akun Anda menunggu persetujuan admin sebelum bisa login.",
      tone: "success" as const,
    };
  }

  if (status === "email-exists") {
    return {
      text: "Email sudah digunakan",
      tone: "error" as const,
    };
  }

  if (status === "phone-exists") {
    return {
      text: "Nomor ini sudah digunakan",
      tone: "error" as const,
    };
  }

  if (status === "incomplete") {
    return {
      text: "Lengkapi semua data pendaftaran dan setujui ketentuan yang berlaku.",
      tone: "error" as const,
    };
  }

  if (status === "invalid-name") {
    return {
      text: "Nama minimal harus berisi 3 huruf.",
      tone: "error" as const,
    };
  }

  if (status === "invalid-email") {
    return {
      text: "Email minimal 6 karakter sebelum @ dan harus memakai format email yang valid.",
      tone: "error" as const,
    };
  }

  if (status === "invalid-password") {
    return {
      text: "Kata sandi harus berisi 8 karakter.",
      tone: "error" as const,
    };
  }

  if (status === "invalid-phone") {
    return {
      text: "Nomor seluler harus berisi 10 sampai 12 digit angka tanpa simbol atau huruf.",
      tone: "error" as const,
    };
  }

  return null;
}

function isValidRegisterEmailInput(value: string) {
  if (!value) {
    return true;
  }

  const [localPart, domainPart] = value.split("@");
  const localCharactersCount = localPart.length;

  return (
    localCharactersCount >= 6 &&
    Boolean(domainPart) &&
    /^[A-Za-z0-9._%+-]{6,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="m2 2 20 20" />
      <path d="M6.7 6.7C3.9 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.5 4.4-1.2" />
      <path d="M9.9 4.2A8.7 8.7 0 0 1 12 4c6.5 0 10 8 10 8a15.6 15.6 0 0 1-3.1 4.2" />
      <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
    </svg>
  );
}
