// Header sederhana buat halaman aplikasi (akun, harga). Link ke
// halaman situs statis (/, /tools.html, dst) sengaja pakai <a> biasa,
// bukan <Link> Next.js, karena itu file HTML statis, bukan halaman
// Next.js, jadi harus dibuka dengan reload penuh.
import Link from "next/link";

export function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="flex items-center justify-between gap-4 mb-10">
      <a href="/" className="inline-flex items-center gap-2 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/favicon.svg"
          alt="Founderku"
          className="w-8 h-8 transition-transform group-hover:-translate-y-0.5"
        />
        <span className="font-manrope font-extrabold text-sm">Founderku</span>
      </a>
      <nav className="flex items-center gap-4 text-xs font-manrope font-bold text-text-soft">
        <a href="/tools.html" className="hover:text-ink transition-colors">
          Tools
        </a>
        <a href="/katalog.html" className="hover:text-ink transition-colors hidden sm:inline">
          Katalog
        </a>
        <Link href="/harga" className="hover:text-ink transition-colors">
          Harga
        </Link>
        {isLoggedIn ? (
          <Link href="/akun" className="text-ink border-b-2 border-amber">
            Akun
          </Link>
        ) : (
          <Link href="/masuk" className="text-ink border-b-2 border-amber">
            Masuk
          </Link>
        )}
      </nav>
    </header>
  );
}
