"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function StickyCta({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Baru muncul setelah user scroll dikit, biar nggak norak muncul
    // barengan sama hero pas halaman baru dibuka.
    function onScroll() {
      if (window.scrollY > 400) setVisible(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="sticky-cta fixed bottom-5 left-5 z-40 max-w-[280px] bg-ink/55 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] hidden sm:block">
      <button
        onClick={() => setDismissed(true)}
        aria-label="Tutup"
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs"
      >
        ✕
      </button>
      {isLoggedIn ? (
        <>
          <p className="font-manrope font-extrabold text-sm text-white mb-1 pr-4">
            Kelola tokomu
          </p>
          <p className="text-xs text-white/70 mb-3">
            Lanjut atur halaman jualan kamu di dashboard.
          </p>
          <Link
            href="/pajangin/dashboard"
            className="block text-center font-manrope font-bold text-sm glass-amber text-ink py-2.5 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            Lihat Toko
          </Link>
        </>
      ) : (
        <>
          <p className="font-manrope font-extrabold text-sm text-white mb-1 pr-4">
            Mulai pajang produkmu
          </p>
          <p className="text-xs text-white/70 mb-3">
            Pakai akun Founderku kamu, jadi dalam hitungan menit.
          </p>
          <Link
            href="/pajangin/dashboard"
            className="block text-center font-manrope font-bold text-sm glass-amber text-ink py-2.5 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            Mulai Pakai
          </Link>
        </>
      )}
    </div>
  );
}
