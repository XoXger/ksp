"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type LoanPaymentReceipt = {
  amount: string;
  date: string;
  installmentLabel: string;
  loanId: string;
  memberName: string;
  paymentId: string;
  proofUrl: string | null;
  status: string;
  transactionId: string;
};

type PdfImage = {
  binary: string;
  height: number;
  width: number;
};

export function LoanPaymentDetailActions({
  payment,
}: {
  payment: LoanPaymentReceipt;
}) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<{
    action: "approve" | "reject";
    status: "TERVERIFIKASI" | "DITOLAK";
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState<"approve" | "reject" | null>(
    null,
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const isPending = payment.status === "Menunggu";

  const updatePaymentStatus = async (
    action: "approve" | "reject",
    status: "TERVERIFIKASI" | "DITOLAK",
  ) => {
    setIsUpdating(action);

    try {
      const response = await fetch(
        `/api/pinjaman/pembayaran/${payment.paymentId}/status`,
        {
          body: JSON.stringify({ status }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        },
      );

      if (!response.ok) {
        throw new Error("Status pembayaran gagal diperbarui.");
      }

      router.refresh();
    } finally {
      setIsUpdating(null);
      setConfirmation(null);
    }
  };

  const downloadReceipt = async () => {
    setIsPrinting(true);

    try {
      const image = payment.proofUrl
        ? await loadImageAsJpeg(payment.proofUrl)
        : null;
      const pdfBytes = createLoanPaymentReceiptPdf(payment, image);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `bukti-pembayaran-${payment.paymentId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="h-12 rounded-full border border-[#43524c] bg-white px-8 text-base font-medium text-[#0f221d] transition hover:bg-[#f3f5ec] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPrinting}
          onClick={downloadReceipt}
          type="button"
        >
          {isPrinting ? "Mencetak..." : "Cetak Bukti"}
        </button>

        {isPending ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              className="h-12 rounded-full border border-[#d71920] bg-white px-8 text-base font-extrabold text-[#d71920] transition hover:bg-[#fff2f2] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUpdating !== null}
              onClick={() =>
                setConfirmation({ action: "reject", status: "DITOLAK" })
              }
              type="button"
            >
              {isUpdating === "reject" ? "Memproses..." : "Tolak Pembayaran"}
            </button>
            <button
              className="h-12 rounded-full bg-[#034d3b] px-8 text-base font-extrabold text-white shadow-[0_10px_18px_rgba(23,79,62,0.2)] transition hover:bg-[#075f48] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUpdating !== null}
              onClick={() =>
                setConfirmation({
                  action: "approve",
                  status: "TERVERIFIKASI",
                })
              }
              type="button"
            >
              {isUpdating === "approve"
                ? "Memproses..."
                : "Setujui Pembayaran"}
            </button>
          </div>
        ) : null}
      </div>

      {confirmation ? (
        <div
          aria-label="Konfirmasi status pembayaran"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-black/10">
            <h3 className="text-xl font-extrabold text-[#0b1210]">
              Konfirmasi Pembayaran
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#35423d]">
              Apakah Anda yakin ingin{" "}
              {confirmation.action === "approve" ? "menyetujui" : "menolak"}{" "}
              pembayaran ini?
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="h-11 rounded-full border border-[#9aa59f] bg-white text-sm font-extrabold text-[#10231d] transition hover:bg-[#f3f5ec]"
                disabled={isUpdating !== null}
                onClick={() => setConfirmation(null)}
                type="button"
              >
                Tidak
              </button>
              <button
                className={`h-11 rounded-full text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmation.action === "approve"
                    ? "bg-[#034d3b] hover:bg-[#075f48]"
                    : "bg-[#d71920] hover:bg-[#b9141b]"
                }`}
                disabled={isUpdating !== null}
                onClick={() =>
                  updatePaymentStatus(confirmation.action, confirmation.status)
                }
                type="button"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function createLoanPaymentReceiptPdf(
  payment: LoanPaymentReceipt,
  image: PdfImage | null,
) {
  const printedDate = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(new Date());
  const detailLines = [
    `ID Transaksi : ${payment.transactionId}`,
    `ID Pinjaman : ${payment.loanId}`,
    `Nama Anggota : ${payment.memberName}`,
    `${payment.installmentLabel} : ${payment.paymentId}`,
    `Nominal : ${payment.amount}`,
    `Tanggal : ${payment.date}`,
    `Status : ${payment.status}`,
  ];
  const content = [
    textAt("KSP TARUNAJAYA", 50, 782, 18),
    textAt("Bukti Pembayaran Pinjaman", 50, 758, 15),
    textAt(printedDate, 450, 806, 9),
    ...detailLines.map((line, index) => textAt(line, 50, 704 - index * 24, 11)),
    textAt("Bukti Transfer", 50, 498, 13),
    image
      ? imageCommand(image)
      : textAt("Tidak ada bukti transfer yang diunggah anggota.", 50, 468, 11),
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> ${
      image ? "/XObject << /Im1 6 0 R >>" : ""
    } >> /Contents 5 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ...(image
      ? [
          `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.binary.length} >>\nstream\n${image.binary}\nendstream`,
        ]
      : []),
  ];
  const offsets: number[] = [];
  let pdf = "%PDF-1.4\n";

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return binaryStringToUint8Array(pdf);
}

async function loadImageAsJpeg(src: string): Promise<PdfImage> {
  const image = await loadBrowserImage(src);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas tidak tersedia.");
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  const binary = atob(dataUrl.split(",")[1] ?? "");

  return {
    binary,
    height: canvas.height,
    width: canvas.width,
  };
}

function loadBrowserImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Bukti transfer gagal dimuat."));
    image.src = src;
  });
}

function imageCommand(image: PdfImage) {
  const maxWidth = 420;
  const maxHeight = 260;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const x = 50;
  const y = 210;

  return `q ${width} 0 0 ${height} ${x} ${y} cm /Im1 Do Q`;
}

function textAt(value: string, x: number, y: number, size: number) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function binaryStringToUint8Array(value: string) {
  const bytes = new Uint8Array(value.length);

  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }

  return bytes;
}
