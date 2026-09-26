"use client";

import { useEffect, useState } from "react";

// Tombol "Share" cuma muncul kalau browser/HP-nya dukung Web Share API
// (hampir semua browser HP modern dukung - begitu dipencet langsung
// buka menu share asli HP: WhatsApp, Instagram, dll). Kalau gak
// didukung (misal beberapa browser desktop lama), tombol Share
// disembunyikan, tinggal "Salin Link" aja yang tetap selalu ada.
export function ShareLinkButtons({
  url,
  title,
  size = "default",
}: {
  url: string;
  title?: string;
  size?: "default" | "compact";
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    function checkShareSupport() {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        setCanShare(true);
      }
    }
    checkShareSupport();
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Kalau gagal (browser lama/gak izin akses clipboard), gak apa-apa
      // - user masih bisa salin manual dari teks link yang ditampilin.
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title: title ?? "Pajangin", url });
    } catch {
      // User batalin share, atau error - gak perlu ditampilin sebagai
      // error ke user, itu bukan kegagalan yang perlu dikasih tau.
    }
  }

  const btnClass =
    size === "compact"
      ? "text-xs font-manrope font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
      : "text-sm font-manrope font-bold px-4 py-2 rounded-xl whitespace-nowrap";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className={`${btnClass} bg-bg-soft text-ink border border-border hover:bg-white transition-colors`}
      >
        {copied ? "Tersalin!" : "Salin Link"}
      </button>
      {canShare && (
        <button
          onClick={handleShare}
          className={`${btnClass} glass-amber text-ink`}
        >
          Share
        </button>
      )}
    </div>
  );
}
