// Ikon rapi untuk tiap tool (pengganti screenshot di halaman akun).
// Tool baru yang belum punya ikon di sini otomatis pakai huruf depan.
const ICONS: Record<string, { from: string; to: string; path: React.ReactNode }> = {
  pajangin: {
    from: "#f2a623",
    to: "#e15c3e",
    path: (
      <>
        <path d="M4 10v10h16V10" />
        <path d="M3 10l1.6-5h14.8L21 10" />
        <path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  notain: {
    from: "#7a78c4",
    to: "#4f4bb0",
    path: (
      <>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v4h4" />
        <path d="M10 12h5M10 16h5" />
      </>
    ),
  },
  pajakin: {
    from: "#2fbf8f",
    to: "#16876a",
    path: (
      <>
        <path d="M18 6L6 18" />
        <circle cx="7.5" cy="7.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </>
    ),
  },
  kontrakin: {
    from: "#4f8df5",
    to: "#2f5fc4",
    path: (
      <>
        <path d="M14 3H6v18h12V7z" />
        <path d="M14 3v4h4" />
        <path d="M9 16c1.2-1.6 2.3-1.6 3 0s1.8 1 3-.8" />
      </>
    ),
  },
  jalanin: {
    from: "#1fb5c6",
    to: "#10808f",
    path: (
      <>
        <path d="M5 21V4" />
        <path d="M5 4h12l-2.5 4L17 12H5" />
      </>
    ),
  },
  sehatin: {
    from: "#f06a8a",
    to: "#c93f63",
    path: (
      <>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        <path d="M8.5 12h2l1-2 2 4 1-2h1.5" />
      </>
    ),
  },
};

export function ToolIcon({ id, name, size = 44 }: { id: string; name: string; size?: number }) {
  const icon = ICONS[id];
  const from = icon?.from ?? "#9a98c9";
  const to = icon?.to ?? "#6d6aa8";
  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl text-white flex-shrink-0 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.45)]"
      style={{ width: size, height: size, background: `linear-gradient(145deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {icon ? (
        <svg
          viewBox="0 0 24 24"
          width={size * 0.52}
          height={size * 0.52}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon.path}
        </svg>
      ) : (
        <span className="font-manrope font-extrabold" style={{ fontSize: size * 0.42 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}

// Deskripsi singkat 1 baris per tool (versi panjangnya ada di tools.json)
export const TOOL_SHORT: Record<string, string> = {
  pajangin: "Halaman jualan + tombol WhatsApp, jadi dalam hitungan menit.",
  notain: "Bikin invoice rapi buat pelanggan kamu.",
  pajakin: "Hitung simulasi pajak UMKM (PPh Final 0,5%).",
  kontrakin: "Bikin surat perjanjian kerja sama sederhana.",
  jalanin: "Checklist langkah demi langkah membangun usaha.",
  sehatin: "Cek kesehatan usahamu di 5 aspek penting.",
};
