import Link from "next/link";

// Cuma dirender kalau yang buka halaman publik ini adalah pemiliknya
// sendiri (lagi login & id-nya cocok) - pembeli biasa nggak akan pernah
// lihat banner ini sama sekali.
export function OwnerPreviewBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-indigo text-white text-center py-2 px-4 text-xs font-manrope font-semibold flex items-center justify-center gap-2">
      <span>Ini tampilan yang dilihat pembelimu.</span>
      <Link href="/pajangin/dashboard" className="underline font-bold whitespace-nowrap">
        ← Kembali ke Dashboard
      </Link>
    </div>
  );
}
