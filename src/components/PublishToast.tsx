"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublishToast({ slug }: { slug: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const link = `founderku.com/l/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopied(true);
    } catch {
      // Kalau gagal (misal browser lama/gak izinin akses clipboard),
      // biarin aja - user masih bisa lihat & salin manual dari teks link.
    }
  }

  function dismiss() {
    // Bersihin query param dari URL biar toast gak muncul lagi kalau
    // halaman di-refresh, tanpa perlu reload penuh.
    router.replace("/pajangin/dashboard");
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="bg-ink text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-manrope font-bold mb-0.5">
            Halaman kamu sudah aktif!
          </p>
          <p className="text-xs text-ink-soft truncate">
            Link-nya: {link}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="glass-amber text-ink text-xs font-manrope font-bold px-3 py-2 rounded-xl whitespace-nowrap flex-shrink-0"
        >
          {copied ? "Tersalin!" : "Salin Link"}
        </button>
        <button
          onClick={dismiss}
          aria-label="Tutup notifikasi"
          className="text-ink-faint hover:text-white text-sm leading-none flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
