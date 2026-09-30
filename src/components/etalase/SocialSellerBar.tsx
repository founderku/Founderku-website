"use client";

// Strip tipis di atas halaman Pajangin yang tampil di Etalase Social Space:
// nama penjual (tautan ke profilnya) supaya pembeli tahu siapa yang jual,
// plus tombol kembali ke Etalase kalau pengunjung datang dari Social Space.

import { useEffect, useState } from "react";

export function SocialSellerBar({ seller }: { seller: { handle: string; name: string } | null }) {
  const [fromSs, setFromSs] = useState(false);

  useEffect(() => {
    try {
      const last = sessionStorage.getItem("ss-last");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage hanya ada di browser
      if (last) setFromSs(true);
    } catch {}
  }, []);

  if (!seller && !fromSs) return null;
  return (
    <div
      style={{
        background: "#1A1730",
        color: "#fff",
        fontFamily: "Poppins, system-ui, sans-serif",
        fontSize: 13.5,
        lineHeight: 1.3,
        padding: "9px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      {fromSs ? (
        <a
          href="/social-space"
          onClick={(e) => {
            if (window.history.length > 1 && document.referrer.startsWith(location.origin + "/social-space")) {
              e.preventDefault();
              window.history.back();
            }
          }}
          style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Etalase
        </a>
      ) : (
        <span />
      )}
      {seller && (
        <a
          href={`/social-space/u/${seller.handle}`}
          style={{ color: "rgba(255,255,255,.8)", textDecoration: "none", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          Dijual oleh <b style={{ color: "#fff", fontWeight: 600 }}>{seller.name}</b>
          <span style={{ color: "#F2A93E" }}> · Lihat profil →</span>
        </a>
      )}
    </div>
  );
}
