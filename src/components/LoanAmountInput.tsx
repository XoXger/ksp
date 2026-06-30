"use client";

import { useState } from "react";

export function LoanAmountInput() {
  const [value, setValue] = useState("");

  const numericValue = value.replace(/[^\d]/g, "");
  const formattedValue = numericValue
    ? new Intl.NumberFormat("id-ID").format(Number(numericValue))
    : "";

  return (
    <input
      className="min-w-0 flex-1 bg-transparent outline-none"
      inputMode="numeric"
      name="amount"
      onChange={(event) => setValue(event.target.value.replace(/[^\d]/g, ""))}
      value={formattedValue}
    />
  );
}
