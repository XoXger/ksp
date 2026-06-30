"use client";

import { useState } from "react";

export function LoanTenorInput() {
  const [value, setValue] = useState("");

  return (
    <input
      className="min-w-0 flex-1 bg-transparent outline-none"
      inputMode="numeric"
      max={12}
      min={4}
      name="tenor"
      onChange={(event) => {
        const numericValue = event.target.value.replace(/[^\d]/g, "");
        const tenor = Number(numericValue);

        if (!numericValue) {
          setValue("");
          return;
        }

        setValue(String(Math.min(tenor, 12)));
      }}
      value={value}
    />
  );
}
