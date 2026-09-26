type Status = "active" | "locked" | "taken_down";

const config: Record<Status, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-ink text-white" },
  locked: { label: "Terkunci", className: "bg-transparent text-text-faint border border-border" },
  taken_down: { label: "Diturunkan", className: "bg-coral text-white" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status];
  return (
    <span
      className={`font-manrope font-bold text-[11px] uppercase tracking-wide px-3 py-1 rounded-lg ${className}`}
    >
      {label}
    </span>
  );
}
