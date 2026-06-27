"use client";

import { useState } from "react";

export type MemberReportData = {
  estimatedShu: string;
  loans: Array<{
    amount: string;
    date: string;
    id: string;
    interest: string;
    status: string;
    tenor: string;
  }>;
  member: {
    id: string;
    name: string;
  };
  savings: Array<{
    amount: string;
    label: string;
  }>;
  transactions: Array<{
    amount: string;
    date: string;
    description: string;
    id: string;
    status: string;
  }>;
};

export function PrintMemberReportButton({
  report,
}: {
  report: MemberReportData;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadReport = () => {
    setIsGenerating(true);

    try {
      const pdfBytes = createMemberReportPdf(report);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `laporan-anggota-${report.member.id}.pdf`;
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
      className="flex h-[150px] w-full items-center justify-center gap-3 rounded-xl bg-[#185440] px-5 text-white shadow-[0_12px_24px_rgba(23,79,62,0.18)] transition hover:bg-[#0f4333] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isGenerating}
      onClick={downloadReport}
      type="button"
    >
      <PrinterIcon className="h-6 w-6" />
      <span className="text-center text-sm font-extrabold">
        {isGenerating ? "Mencetak..." : "Cetak Laporan"}
      </span>
    </button>
  );
}

function createMemberReportPdf(report: MemberReportData) {
  const printedAt = formatPrintedDate(new Date());
  const pages = createReportPages(report, printedAt);
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages
      .map((_, index) => `${3 + index * 2} 0 R`)
      .join(" ")}] /Count ${pages.length} >>`,
  ];

  pages.forEach((content, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R /F2 ${4 + pages.length * 2} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    );
  });

  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  );

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

function createReportPages(report: MemberReportData, printedAt: string) {
  const pages: string[] = [];
  let commands: string[] = [];
  let y = 782;

  const startPage = () => {
    commands = [
      textAt(printedAt, 430, 812, 9),
      boldTextAt("KSP TARUNAJAYA", 50, 792, 18),
      textAt("Laporan Anggota", 50, 768, 14),
    ];
    y = 724;
  };
  const finishPage = () => {
    pages.push(commands.join("\n"));
  };
  const ensureSpace = (needed = 24) => {
    if (y - needed >= 50) {
      return;
    }

    finishPage();
    startPage();
  };
  const addSection = (title: string) => {
    ensureSpace(34);
    commands.push(boldTextAt(title, 50, y, 13));
    y -= 22;
  };
  const addLine = (line: string, size = 10) => {
    ensureSpace(18);
    commands.push(textAt(line, 50, y, size));
    y -= 18;
  };

  startPage();
  addSection("Data Anggota");
  addLine(`Nama Anggota : ${report.member.name}`);
  addLine(`ID Anggota : ${report.member.id}`);

  y -= 8;
  addSection("Simpanan Anggota");
  report.savings.forEach((saving) => {
    addLine(`${saving.label} : ${saving.amount}`);
  });

  y -= 8;
  addSection("Pinjaman Anggota");
  if (report.loans.length > 0) {
    report.loans.forEach((loan) => {
      addLine(
        `${loan.id} | ${loan.date} | ${loan.amount} | ${loan.interest} | ${loan.tenor} | ${loan.status}`,
      );
    });
  } else {
    addLine("Tidak ada pinjaman anggota.");
  }

  y -= 8;
  addSection("Riwayat Transaksi Anggota");
  if (report.transactions.length > 0) {
    report.transactions.forEach((transaction) => {
      addLine(
        `${transaction.date} | ${transaction.id} | ${transaction.description} | ${transaction.amount} | ${transaction.status}`,
        9,
      );
    });
  } else {
    addLine("Belum ada riwayat transaksi.");
  }

  y -= 8;
  addSection("Estimasi SHU");
  addLine(`Total Estimasi SHU Diterima : ${report.estimatedShu}`);
  finishPage();

  return pages;
}

function formatPrintedDate(date: Date) {
  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
  const day = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(date);

  return `Dicetak: ${time} - ${day}`;
}

function textAt(value: string, x: number, y: number, size: number) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

function boldTextAt(value: string, x: number, y: number, size: number) {
  return `BT /F2 ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

function escapePdfText(value: string) {
  return value
    .replace(/[^\x20-\x7E]/g, " ")
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

function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 3h10v5H7V3Zm-2 7h14a3 3 0 0 1 3 3v5h-4v3H6v-3H2v-5a3 3 0 0 1 3-3Zm3 7v2h8v-5H8v3Zm10-3h2v-1h-2v1Z" />
    </svg>
  );
}
