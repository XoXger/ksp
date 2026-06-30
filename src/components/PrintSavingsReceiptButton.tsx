"use client";

import { useState } from "react";

type SavingsReceipt = {
  amount: string;
  date: string;
  hasTransferProof: boolean;
  id: string;
  memberName: string;
  savingsType: string;
  status: string;
  transferProofUrl: string | null;
};

type PdfImage = {
  binary: string;
  height: number;
  width: number;
};

export function PrintSavingsReceiptButton({
  transaction,
}: {
  transaction: SavingsReceipt;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadReceipt = async () => {
    setIsGenerating(true);

    try {
      const image =
        transaction.hasTransferProof && transaction.transferProofUrl
          ? await loadImageAsJpeg(transaction.transferProofUrl)
          : null;
      const pdfBytes = createSavingsReceiptPdf(transaction, image);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `bukti-transaksi-${transaction.id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      className="h-12 rounded-full border border-[#43524c] bg-white px-8 text-base font-medium text-[#0f221d] transition hover:bg-[#f3f5ec] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isGenerating}
      onClick={downloadReceipt}
      type="button"
    >
      {isGenerating ? "Mencetak..." : "Cetak Bukti"}
    </button>
  );
}

function createSavingsReceiptPdf(
  transaction: SavingsReceipt,
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
    `ID Transaksi : ${transaction.id}`,
    `Nama Anggota : ${transaction.memberName}`,
    `Jenis Simpanan : ${transaction.savingsType}`,
    `Nominal : ${transaction.amount}`,
    `Tanggal : ${transaction.date}`,
    `Status : ${transaction.status}`,
  ];
  const textCommands = [
    textAt("KSP TARUNAJAYA", 50, 782, 18),
    textAt("Bukti Transaksi Simpanan", 50, 758, 15),
    textAt(printedDate, 450, 806, 9),
    ...detailLines.map((line, index) => textAt(line, 50, 704 - index * 24, 11)),
    textAt("Bukti Transfer", 50, 522, 13),
    image
      ? imageCommand(image)
      : textAt(
          "Tidak ada bukti transfer untuk simpanan otomatis anggota.",
          50,
          492,
          11,
        ),
  ].join("\n");
  const imageObjectNumber = image ? 6 : null;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> ${
      image ? "/XObject << /Im1 6 0 R >>" : ""
    } >> /Contents 5 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${textCommands.length} >>\nstream\n${textCommands}\nendstream`,
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

  if (imageObjectNumber) {
    return binaryStringToUint8Array(pdf);
  }

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
  const y = 238;

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
