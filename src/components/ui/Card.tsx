import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  variant = "light",
}: {
  children: ReactNode;
  className?: string;
  variant?: "light" | "dark";
}) {
  const variantClass =
    variant === "dark"
      ? "bg-ink border border-ink-border text-white"
      : "bg-bg-soft border border-border";

  return (
    <div className={`${variantClass} rounded-[24px] p-6 ${className}`}>
      {children}
    </div>
  );
}
