"use client";

import { useState } from "react";

export function LoanInterestInput() {
  const [value, setValue] = useState("");

  return (
    <input
      className="min-w-0 flex-1 bg-transparent outline-none"
      inputMode="decimal"
      max={1.5}
      min={0.5}
      name="interest"
      onChange={(event) => {
        const normalizedValue = event.target.value
          .replace(",", ".")
          .replace(/[^\d.]/g, "");
        const parts = normalizedValue.split(".");
        const nextValue =
          parts.length > 1
            ? `${parts[0]}.${parts.slice(1).join("")}`
            : normalizedValue;

        if (!nextValue) {
          setValue("");
          return;
        }

        if (nextValue === ".") {
          setValue("0.");
          return;
        }

        if (nextValue.endsWith(".")) {
          setValue(nextValue);
          return;
        }

        const interest = Number(nextValue);

        if (!Number.isFinite(interest)) {
          return;
        }

        setValue(String(Math.min(interest, 1.5)));
      }}
      value={value}
    />
  );
}
