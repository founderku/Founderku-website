// Latar belakang halaman dashboard/form: gradien warna hangat berlapis
// (bukan div + filter blur()) - efek "berawan" yang mirip, tapi jauh
// lebih ringan buat browser HP. filter:blur() dengan radius besar
// (yang dipakai versi sebelumnya) mahal banget buat GPU HP, apalagi di
// halaman yang juga nge-render beberapa iframe sekaligus (Ganti Style)
// - itu yang bikin Safari sempat crash pas di-scroll. Basisnya sama di
// semua halaman, posisi gradien dibedain dikit tiap halaman lewat prop
// `variant`, plus aksen bentuk berlian tipis.
const LAYOUT = {
  dashboard: {
    diamond: "bottom-16 right-10",
    gradient:
      "radial-gradient(ellipse 60% 45% at 10% 10%, rgba(255,255,255,0.9), transparent 60%), radial-gradient(ellipse 65% 55% at 92% 5%, rgba(196,183,156,0.5), transparent 65%), radial-gradient(ellipse 55% 45% at 5% 95%, rgba(238,229,210,0.7), transparent 60%)",
  },
  form: {
    diamond: "top-24 right-12 sm:right-16",
    gradient:
      "radial-gradient(ellipse 60% 45% at 8% 12%, rgba(255,255,255,0.9), transparent 60%), radial-gradient(ellipse 65% 60% at 95% 0%, rgba(196,183,156,0.5), transparent 65%), radial-gradient(ellipse 55% 45% at 5% 95%, rgba(238,229,210,0.7), transparent 60%)",
  },
  style: {
    diamond: "bottom-20 left-8 sm:left-14",
    gradient:
      "radial-gradient(ellipse 60% 45% at 10% 8%, rgba(255,255,255,0.9), transparent 60%), radial-gradient(ellipse 65% 60% at 100% 15%, rgba(196,183,156,0.5), transparent 65%), radial-gradient(ellipse 55% 45% at 0% 100%, rgba(238,229,210,0.7), transparent 60%)",
  },
} as const;

export function PageBackdrop({
  variant = "dashboard",
}: {
  variant?: keyof typeof LAYOUT;
}) {
  const layout = LAYOUT[variant];

  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden bg-[#f5f0e5]"
      style={{ backgroundImage: layout.gradient }}
      aria-hidden="true"
    >
      {/* Aksen bentuk berlian tipis */}
      <svg
        className={`absolute w-24 h-24 sm:w-32 sm:h-32 text-ink/10 ${layout.diamond}`}
        viewBox="0 0 100 100"
        fill="none"
      >
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="10"
          transform="rotate(45 50 50)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
