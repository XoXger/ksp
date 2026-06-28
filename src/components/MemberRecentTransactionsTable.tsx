"use client";

import { useState } from "react";

export type MemberRecentTransactionRow = {
  id: string;
  amount: number;
  date: string;
  description: string;
  status: string;
  type: string;
};

const TRANSACTIONS_PER_PAGE = 5;

export function MemberRecentTransactionsTable({
  transactions,
}: {
  transactions: MemberRecentTransactionRow[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * TRANSACTIONS_PER_PAGE;
  const visibleTransactions = transactions.slice(
    startIndex,
    startIndex + TRANSACTIONS_PER_PAGE,
  );
  const visibleStart = transactions.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(
    startIndex + TRANSACTIONS_PER_PAGE,
    transactions.length,
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b border-[#e0e3df] text-left text-sm font-extrabold uppercase tracking-[0.14em] text-[#26322e]">
              <th className="px-7 py-5">Tanggal</th>
              <th className="px-5 py-5">Jenis</th>
              <th className="px-5 py-5">Deskripsi</th>
              <th className="px-5 py-5 text-right">Nominal</th>
              <th className="px-7 py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleTransactions.map((transaction) => (
              <TransactionTableRow key={transaction.id} {...transaction} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-[#e0e3df] px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm sm:text-base">
          Menampilkan {visibleStart} hingga {visibleEnd} transaksi dari{" "}
          {transactions.length} transaksi
        </p>
        {totalPages > 1 ? (
          <div className="flex items-center gap-3">
            <button
              aria-label="Halaman sebelumnya"
              className="grid h-9 w-9 place-items-center rounded-full border border-[#d8d8ca] text-[#10231d] transition hover:bg-[#f3f2d8] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              type="button"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              return (
                <button
                  className={`grid h-9 w-9 place-items-center rounded-full font-extrabold transition ${
                    safeCurrentPage === page
                      ? "bg-[#075f48] text-white"
                      : "text-[#10231d] hover:bg-[#f3f2d8]"
                  }`}
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  type="button"
                >
                  {page}
                </button>
              );
            })}
            <button
              aria-label="Halaman berikutnya"
              className="grid h-9 w-9 place-items-center rounded-full border border-[#d8d8ca] text-[#10231d] transition hover:bg-[#f3f2d8] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              type="button"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

function TransactionTableRow({
  date,
  type,
  description,
  amount,
  status,
}: MemberRecentTransactionRow) {
  const normalizedType = type.toLowerCase();
  const isOut =
    normalizedType.includes("angsuran") ||
    normalizedType.includes("pembayaran");
  const isPending = status === "Pending";
  const isRejected = status === "Ditolak";

  return (
    <tr className="border-b border-[#e0e3df] text-base last:border-b-0">
      <td className="px-7 py-5">{date}</td>
      <td className="px-5 py-5">
        <span className="inline-flex items-center gap-3">
          {isOut ? (
            <ArrowUpIcon className="h-5 w-5 text-[#d71920]" />
          ) : (
            <ArrowDownIcon className="h-5 w-5 text-[#10231d]" />
          )}
          {type}
        </span>
      </td>
      <td className="px-5 py-5">{description}</td>
      <td className="px-5 py-5 text-right">
        {formatSignedCurrency(amount, isOut)}
      </td>
      <td className="px-7 py-5 text-right">
        <span
          className={`inline-flex rounded-full px-4 py-1 text-sm ${
            isPending
              ? "bg-[#e5e5cb] text-[#6c6b4e]"
              : isRejected
                ? "bg-[#fff2f2] text-[#d71920] ring-1 ring-[#f1b6b6]"
              : "bg-[#ddf8ee] text-[#0f614b]"
          }`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatSignedCurrency(value: number, isNegative: boolean) {
  return `${isNegative ? "-" : "+"} ${formatCurrency(value)}`;
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 4h2v12l4-4 1.4 1.4L12 19.8l-6.4-6.4L7 12l4 4V4Z" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m12 4.2 6.4 6.4L17 12l-4-4v12h-2V8l-4 4-1.4-1.4L12 4.2Z" />
    </svg>
  );
}
