"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AccountStatus = "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK";

export function AccountStatusEditor({
  accountId,
  status,
  viewerSessionId,
}: {
  accountId: string;
  status: AccountStatus;
  viewerSessionId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AccountStatus | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  const options = getAllowedStatusOptions(status);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateStatus = async (nextStatus: AccountStatus) => {
    setIsSaving(true);

    const response = await fetch(
      `/api/accounts/anggota/${accountId}/status?viewerSessionId=${encodeURIComponent(viewerSessionId)}`,
      {
      body: JSON.stringify({ status: nextStatus }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      },
    );

    setIsSaving(false);
    setIsOpen(false);
    setPendingStatus(null);

    if (response.ok) {
      refreshSafely(router);
    }
  };

  const chooseStatus = (nextStatus: AccountStatus) => {
    if (nextStatus === "NONAKTIF") {
      setIsOpen(false);
      setPendingStatus(nextStatus);
      return;
    }

    updateStatus(nextStatus);
  };

  return (
    <>
      <span className="relative inline-flex items-center gap-2" ref={wrapperRef}>
        <span>Status: {formatAccountStatus(status)}</span>
        <button
          aria-expanded={isOpen}
          aria-label="Ubah status akun"
          className="rounded-md p-1 transition hover:bg-[#eef1d3] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={options.length === 0 || isSaving}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <EditIcon className="h-4 w-4 text-[#1f312a]" />
        </button>

        {isOpen ? (
          <span className="absolute left-0 top-8 z-20 min-w-[160px] overflow-hidden rounded-lg bg-white py-2 text-left shadow-[0_12px_28px_rgba(23,79,62,0.18)] ring-1 ring-black/10">
            {options.map((option) => (
              <button
                className="block w-full px-4 py-2 text-left text-sm font-semibold text-[#10231d] transition hover:bg-[#fbfbe8]"
                disabled={isSaving}
                key={option}
                onClick={() => chooseStatus(option)}
                type="button"
              >
                {formatAccountStatus(option)}
              </button>
            ))}
          </span>
        ) : null}
      </span>

      {pendingStatus === "NONAKTIF" ? (
        <span className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
          <span className="w-full max-w-[360px] rounded-xl bg-white p-6 text-center shadow-[0_18px_42px_rgba(0,0,0,0.24)] ring-1 ring-black/10">
            <span className="block text-lg font-extrabold text-[#10231d]">
              Nonaktifkan akun?
            </span>
            <span className="mt-3 block text-sm leading-relaxed text-[#52615b]">
              Status akun akan berubah menjadi Nonaktif. Lanjutkan?
            </span>
            <span className="mt-6 flex justify-center gap-3">
              <button
                className="h-10 rounded-full bg-[#185440] px-7 text-sm font-extrabold text-white"
                disabled={isSaving}
                onClick={() => updateStatus(pendingStatus)}
                type="button"
              >
                Ya
              </button>
              <button
                className="h-10 rounded-full bg-[#f0f0d8] px-7 text-sm font-extrabold text-[#10231d] ring-1 ring-black/10"
                disabled={isSaving}
                onClick={() => setPendingStatus(null)}
                type="button"
              >
                Tidak
              </button>
            </span>
          </span>
        </span>
      ) : null}
    </>
  );
}

function getAllowedStatusOptions(status: AccountStatus): AccountStatus[] {
  if (status === "AKTIF") {
    return ["NONAKTIF"];
  }

  if (status === "MENUNGGU") {
    return ["AKTIF", "DITOLAK"];
  }

  return [];
}

function formatAccountStatus(status: AccountStatus) {
  const labels = {
    AKTIF: "Aktif",
    NONAKTIF: "Nonaktif",
    MENUNGGU: "Menunggu",
    DITOLAK: "Ditolak",
  };

  return labels[status];
}

function refreshSafely(router: ReturnType<typeof useRouter>) {
  try {
    router.refresh();
  } catch (error) {
    if (!isRouterInitializationError(error)) {
      throw error;
    }
  }
}

function isRouterInitializationError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";

  return message.includes("Router action dispatched before initialization");
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 17.2V21h3.8L18.9 9.9l-3.8-3.8L4 17.2ZM20.7 8.1a1 1 0 0 0 0-1.4l-3.4-3.4a1 1 0 0 0-1.4 0l-1.6 1.6 3.8 3.8 1.6-1.6Z" />
    </svg>
  );
}
