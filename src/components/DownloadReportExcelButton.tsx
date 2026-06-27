"use client";

type ReportExcelRow = {
  category: string;
  transactions: string;
  amount: string;
};

export function DownloadReportExcelButton({
  rows,
}: {
  rows: readonly ReportExcelRow[];
}) {
  const downloadExcel = () => {
    const tableRows = rows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.category)}</td>
            <td>${escapeHtml(row.transactions)}</td>
            <td>${escapeHtml(row.amount)}</td>
          </tr>
        `,
      )
      .join("");

    const excelContent = `
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Total Transaksi</th>
                <th>Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([excelContent], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "rincian-laporan-koperasi.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="flex h-12 items-center justify-center gap-3 rounded-full bg-[#f0f0d8] px-7 text-sm font-extrabold text-[#10231d] ring-1 ring-black/20"
      onClick={downloadExcel}
      type="button"
    >
      <TableIcon className="h-4 w-4" />
      Unduh Excel
    </button>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function TableIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 5h16v14H4V5Zm2 2v2h4V7H6Zm6 0v2h6V7h-6Zm-6 4v2h4v-2H6Zm6 0v2h6v-2h-6Zm-6 4v2h4v-2H6Zm6 0v2h6v-2h-6Z" />
    </svg>
  );
}
