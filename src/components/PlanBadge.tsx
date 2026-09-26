"use client";

import { useState } from "react";
import Link from "next/link";
import { PRICING, formatRupiah, periodSuffix } from "@/lib/pricing";

export function PlanBadge({
  isPro,
  onTrial = false,
  daysLeft = 0,
}: {
  isPro: boolean;
  onTrial?: boolean;
  daysLeft?: number;
}) {
  const [open, setOpen] = useState(false);
  const cheapest = [...PRICING.prices].sort((a, b) => a.amount - b.amount)[0];

  if (isPro) {
    return (
      <Link
        href="/akun"
        className="glass-amber font-manrope font-bold text-xs px-4 py-2 rounded-full text-ink"
      >
        {onTrial ? `TRIAL PRO · ${daysLeft} hari lagi` : "PRO"}
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-ink text-white font-manrope font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 hover:-translate-y-0.5 active:scale-95 transition-all"
      >
        FREE
        <span className="text-[10px] opacity-70">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <>
          {/* Backdrop tak terlihat buat nutup popover kalau klik di luar */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
          />
          {/* Di HP: dipusatkan ke layar (fixed) biar gak pernah kepotong
              batas layar, gak peduli tombolnya ada di mana. Di layar
              lebih lebar (sm+): nempel di bawah tombol seperti biasa. */}
          <div className="glass-dark fixed inset-x-4 top-1/2 -translate-y-1/2 sm:absolute sm:inset-x-auto sm:translate-y-0 sm:right-0 sm:top-full sm:mt-2 sm:w-64 z-30 rounded-2xl p-5 shadow-2xl animate-[modal-in_0.2s_cubic-bezier(0.16,1,0.3,1)]">
            <p className="font-manrope font-extrabold text-sm text-white mb-3">
              Upgrade ke {PRICING.planName}
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex gap-2 text-xs text-ink-soft">
                <span className="text-amber font-bold">✓</span>
                Halaman jualan tanpa batas
              </li>
              <li className="flex gap-2 text-xs text-ink-soft">
                <span className="text-amber font-bold">✓</span>
                Tanpa watermark Pajangin
              </li>
              <li className="flex gap-2 text-xs text-ink-soft">
                <span className="text-amber font-bold">✓</span>
                Halaman toko gabungan
              </li>
            </ul>
            {cheapest && (
              <p className="font-manrope font-extrabold text-white text-sm mb-3">
                {formatRupiah(cheapest.amount)}
                <span className="text-xs font-semibold text-ink-soft">
                  {" "}
                  {periodSuffix(cheapest.days)}
                </span>
              </p>
            )}
            <Link
              href="/harga"
              className="glass-amber block text-center font-manrope font-bold text-sm text-ink py-2.5 rounded-xl"
            >
              Lihat Detail Upgrade
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
