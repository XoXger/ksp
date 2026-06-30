"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type EditableMemberField = "email" | "name" | "phone" | "password";

export function MemberEditableInfoField({
  className = "",
  field,
  label,
  memberId,
  value,
}: {
  className?: string;
  field: EditableMemberField;
  label: string;
  memberId: string;
  value: string;
}) {
  const router = useRouter();
  const [currentValue, setCurrentValue] = useState(value);
  const [inputValue, setInputValue] = useState(field === "password" ? "" : value);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const displayedValue = field === "password" ? "********" : currentValue;
  const inputType = field === "password" ? "password" : field === "email" ? "email" : "text";

  function openEditor() {
    setError("");
    setInputValue(field === "password" ? "" : currentValue);
    setIsOpen(true);
  }

  function closeEditor() {
    if (!isPending) {
      setIsOpen(false);
      setError("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await fetch(`/api/accounts/anggota/${encodeURIComponent(memberId)}`, {
        body: JSON.stringify({ field, value: inputValue }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; value?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Data gagal diperbarui.");
        return;
      }

      if (field !== "password") {
        setCurrentValue(payload?.value ?? inputValue);
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <div className={className}>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#26322e]">
        {label}
      </p>
      <p className="mt-2 flex items-center gap-3 text-base">
        <span>{displayedValue}</span>
        <button
          aria-label={`Ubah ${label}`}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#1f312a] hover:bg-[#eef1d3] focus:outline-none focus:ring-2 focus:ring-[#185440]"
          onClick={openEditor}
          type="button"
        >
          <EditIcon className="h-4 w-4" />
        </button>
      </p>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4">
          <form
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black/10"
            onSubmit={handleSubmit}
          >
            <h4 className="text-xl font-extrabold text-[#10231d]">
              Ubah {label}
            </h4>
            <label className="mt-5 block text-sm font-bold text-[#26322e]">
              {label}
              <input
                autoFocus
                className="mt-2 h-12 w-full rounded-lg border border-[#b7c2bb] px-4 text-base outline-none focus:border-[#185440] focus:ring-2 focus:ring-[#185440]/20"
                inputMode={field === "phone" ? "numeric" : undefined}
                maxLength={
                  field === "password" ? 8 : field === "phone" ? 12 : field === "name" ? 50 : undefined
                }
                onChange={(event) => {
                  const nextValue =
                    field === "phone"
                      ? event.target.value.replace(/\D/g, "")
                      : field === "name"
                        ? event.target.value.replace(/[^\p{L}\s]/gu, "")
                      : event.target.value;
                  setInputValue(nextValue);
                }}
                type={inputType}
                value={inputValue}
              />
            </label>
            {error ? (
              <p className="mt-4 rounded-lg bg-[#ffe5e1] px-4 py-3 text-sm font-bold text-[#b30000]">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="h-10 rounded-full border border-[#185440] px-6 text-sm font-extrabold text-[#185440] hover:bg-[#eef1d3]"
                onClick={closeEditor}
                type="button"
              >
                Batal
              </button>
              <button
                className="h-10 rounded-full bg-[#185440] px-6 text-sm font-extrabold text-white shadow-[0_8px_16px_rgba(23,79,62,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 17.2V21h3.8L18.9 9.9l-3.8-3.8L4 17.2ZM20.7 8.1a1 1 0 0 0 0-1.4l-3.4-3.4a1 1 0 0 0-1.4 0l-1.6 1.6 3.8 3.8 1.6-1.6Z" />
    </svg>
  );
}
