"use client";

import { useRouter } from "next/navigation";

export function UpgradeToast() {
  const router = useRouter();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="bg-ink text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-manrope font-bold mb-0.5">
            Pembayaran diterima!
          </p>
          <p className="text-xs text-ink-soft">
            Akun Pro kamu akan aktif dalam beberapa saat. Kalau badge belum
            berubah, coba refresh halaman ini sebentar lagi.
          </p>
        </div>
        <button
          onClick={() => router.replace("/pajangin/dashboard")}
          aria-label="Tutup notifikasi"
          className="text-ink-faint hover:text-white text-sm leading-none flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
