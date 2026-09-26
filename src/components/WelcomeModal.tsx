"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "pajangin_welcomed";

// Modal ini cuma muncul kalau: (1) user belum pernah nutup/lihat modal
// ini sebelumnya (dicek lewat localStorage - per browser, bukan per
// akun, tapi cukup buat kebutuhan onboarding ringan kayak gini), DAN
// (2) user belum punya halaman sama sekali (sinyal kuat "baru pertama
// kali pakai"). Begitu ditutup atau diklik tombolnya, tidak muncul lagi.
export function WelcomeModal({ hasPages }: { hasPages: boolean }) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    function checkWelcome() {
      if (hasPages) return;
      const alreadySeen = localStorage.getItem(STORAGE_KEY);
      if (!alreadySeen) setShow(true);
    }
    checkWelcome();
  }, [hasPages]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  }

  function handleStart() {
    dismiss();
    router.push("/pajangin/dashboard/new");
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/40 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] p-7 sm:p-8 max-w-sm w-full shadow-2xl">
        <h2 className="font-manrope font-extrabold text-xl mb-4">
          Selamat datang di Pajangin!
        </h2>
        <p className="text-sm text-text-soft mb-2">
          Cuma butuh 3 langkah buat punya halaman jualan sendiri:
        </p>
        <ol className="text-sm text-text-soft space-y-2 mb-6 list-decimal pl-5">
          <li>Isi info produk kamu</li>
          <li>Lihat hasilnya langsung</li>
          <li>Publish, langsung dapat link buat dibagikan</li>
        </ol>
        <button
          onClick={handleStart}
          className="w-full bg-amber text-ink font-manrope font-bold text-sm py-3 rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          Mulai Buat Halaman Pertama
        </button>
        <button
          onClick={dismiss}
          className="w-full text-center text-xs text-text-faint mt-3 py-1"
        >
          Nanti dulu
        </button>
      </div>
    </div>
  );
}
