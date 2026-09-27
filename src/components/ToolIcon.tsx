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
  validasiin: {
    from: "#8a85b8",
    to: "#5b5494",
    path: (
      <>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z" />
      </>
    ),
  },
  runwayin: {
    from: "#f2a93e",
    to: "#d9771f",
    path: (
      <>
        <path d="M3 17l5-5 4 3 7-8" />
        <path d="M14 7h5v5" />
      </>
    ),
  },
  unitin: {
    from: "#2a78d6",
    to: "#1c5cab",
    path: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v10M9.5 9.5c0-1 1.1-1.5 2.5-1.5s2.5.6 2.5 1.7c0 2.6-5 1.4-5 4.1 0 1.1 1.1 1.7 2.5 1.7s2.5-.5 2.5-1.5" />
      </>
    ),
  },
  sahamin: {
    from: "#e85f3d",
    to: "#b8432a",
    path: (
      <>
        <path d="M12 3v9h9" />
        <path d="M20.5 15A9 9 0 1 1 9 3.5" />
      </>
    ),
  },
  pitchin: {
    from: "#1a1730",
    to: "#4a3aa7",
    path: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M12 16v4M8 20h8M7 12l3-3 2 2 4-4" />
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
