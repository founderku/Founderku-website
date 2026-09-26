import { ButtonHTMLAttributes, ReactNode } from "react";

type PillVariant = "solid-dark" | "solid-amber" | "outline";

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PillVariant;
  children: ReactNode;
}

const variantClass: Record<PillVariant, string> = {
  "solid-dark": "bg-ink text-white hover:bg-ink/90",
  "solid-amber": "glass-amber text-ink",
  outline: "bg-transparent text-ink border border-border hover:bg-bg-soft",
};

// Nama komponen ("Pill") dipertahankan supaya tidak perlu ubah import di
// semua halaman, tapi bentuknya sekarang sudah tidak pil penuh lagi -
// mengikuti arahan gaya Shopify: tombol besar, sudut membulat sedang.
export function Pill({
  variant = "solid-dark",
  children,
  className = "",
  ...props
}: PillProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-manrope font-bold text-[15px] px-6 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
