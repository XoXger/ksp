"use client";

export function LoginPasswordInput() {
  return (
    <input
      className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#26332f] outline-none placeholder:text-[#aeb8b2]"
      type="password"
      name="password"
      placeholder="••••••••"
      autoComplete="current-password"
      maxLength={8}
      pattern="[A-Za-z0-9]{8}"
      title="Kata sandi harus berisi 8 karakter huruf atau angka."
      onInput={(event) => {
        const input = event.currentTarget;
        input.value = input.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
      }}
    />
  );
}
