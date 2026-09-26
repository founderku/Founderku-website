"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export function PreviewModal() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Nutup otomatis begitu user scroll atau klik di luar kartu preview -
    // dibikin kayak popover ringan, bukan modal yang harus ditutup manual.
    function handleScroll() {
      setOpen(false);
    }
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="font-manrope font-bold text-base px-7 py-4 rounded-2xl border border-white/25 text-white hover:bg-white/5 active:scale-95 transition-all"
      >
        Lihat contoh
      </button>

      {/* Dirender lewat portal ke document.body - biar TIDAK kepotong sama
          section hero yang punya overflow-hidden (buat nampung foto
          marquee), dan posisinya beneran fixed ke layar, bukan ketarik
          sama transform dari komponen Reveal di sekitarnya. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 pointer-events-none">
            <div
              ref={panelRef}
              className="modal-panel pointer-events-auto w-full max-w-[280px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-[22px] overflow-hidden shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/pajangin-assets/photos/p11.jpg"
                  alt="Kopi Susu Gula Aren"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="p-5">
                  <h3 className="font-manrope font-extrabold text-lg tracking-tight mb-1">
                    Kopi Susu Gula Aren
                  </h3>
                  <p className="text-xs text-text-soft mb-3">
                    Kopi susu premium, gula aren asli.
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xs text-text-faint line-through">
                      Rp 12.000
                    </span>
                    <span className="font-manrope font-extrabold text-xl text-coral">
                      Rp 8.000
                    </span>
                  </div>
                  <Link
                    href="/masuk"
                    className="glass-amber block text-center text-ink font-manrope font-extrabold text-sm py-3 rounded-xl"
                  >
                    💬 Chat via WhatsApp
                  </Link>
                </div>
              </div>
              <p className="text-center text-white/70 text-[11px] mt-3">
                Klik di mana aja buat nutup
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
