"use client";

import { useState } from "react";
import s from "./etalase.module.css";

// Tombol bagikan halaman: pakai menu bagikan bawaan HP kalau ada,
// kalau tidak, salin tautan halaman ini.
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Dibatalkan pengguna atau browser menolak, tidak perlu apa-apa
    }
  }

  return (
    <button type="button" className={s.iconBtn} onClick={share} aria-label="Bagikan halaman ini">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path d="M16 6l-4-4-4 4" />
        <path d="M12 2v14" />
      </svg>
      {copied ? "Tersalin" : "Bagikan"}
    </button>
  );
}
