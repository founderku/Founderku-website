"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    FK?: { mount: () => void };
  }
}

// Memasang navigasi & footer bersama (public/assets/fk-site.js) ke halaman
// aplikasi. Skrip dimuat sekali; saat pindah halaman tanpa reload,
// navigasinya dipasang ulang lewat FK.mount().
export function FkNavMount() {
  useEffect(() => {
    if (window.FK) {
      window.FK.mount();
      return;
    }
    if (document.querySelector('script[data-fk-site]')) return;
    const s = document.createElement("script");
    s.src = "/assets/fk-site.js";
    s.async = true;
    s.dataset.fkSite = "1";
    document.body.appendChild(s);
  }, []);
  return null;
}
