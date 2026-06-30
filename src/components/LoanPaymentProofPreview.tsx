"use client";

import { useState } from "react";

export function LoanPaymentProofPreview({
  paymentId,
  proofUrl,
}: {
  paymentId: string;
  proofUrl: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!proofUrl) {
    return (
      <div className="mt-9 flex min-h-[260px] max-w-[500px] items-center justify-center rounded-lg border border-dashed border-[#cbd4cf] bg-[#f7f7df] px-6 text-center text-base font-semibold text-[#66706a]">
        Belum ada bukti transfer yang diunggah anggota.
      </div>
    );
  }

  return (
    <>
      <button
        aria-label={`Buka bukti transfer ${paymentId}`}
        className="mt-9 block max-w-[500px] overflow-hidden rounded-lg bg-[#0e1b20] text-left shadow-inner ring-2 ring-[#17221f] transition hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[#31d8ad]/40"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <img
          alt={`Bukti transfer ${paymentId}`}
          className="max-h-[520px] w-full object-contain"
          src={proofUrl}
        />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau bukti transfer ${paymentId}`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-full w-full max-w-5xl rounded-xl bg-white p-3 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Tutup pratinjau bukti transfer"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#10231d] shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition hover:bg-[#f0f2ea]"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <XIcon className="h-5 w-5" />
            </button>
            <img
              alt={`Bukti transfer ${paymentId}`}
              className="max-h-[82vh] w-full rounded-lg object-contain"
              src={proofUrl}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m6.4 5 12.6 12.6-1.4 1.4L5 6.4 6.4 5Zm12.6 1.4L6.4 19 5 17.6 17.6 5 19 6.4Z" />
    </svg>
  );
}
