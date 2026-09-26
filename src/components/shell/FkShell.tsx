import type { ReactNode } from "react";
import { FkNavMount } from "./FkNavMount";

// Kerangka halaman aplikasi dengan tampilan yang sama dengan beranda:
// navigasi atas, bingkai bergaris, dan footer bersama. Gaya dasarnya dari
// /assets/fk-site.css (dipakai juga halaman statis), lalu komponen Tailwind
// lama ikut warna & font baru lewat .fk-page di globals.css.
export function FkShell({
  children,
  bare = false,
}: {
  children: ReactNode;
  // bare: isi halaman sudah punya bagian (.band) sendiri, misalnya /harga
  bare?: boolean;
}) {
  return (
    <>
      {/* Gaya bersama dengan halaman statis (file di public/), jadi tidak bisa di-import */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/assets/fk-site.css" precedence="default" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* Font Poppins sama dengan beranda */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        precedence="default"
      />
      <div className="fk-page fk-app">
        {/* Diisi oleh fk-site.js setelah halaman aktif */}
        <header className="nav" id="nav" data-fk-nav suppressHydrationWarning />
        <main className="frame">
          {bare ? children : <div className="band app-band">{children}</div>}
          <footer className="band" data-fk-foot suppressHydrationWarning />
        </main>
      </div>
      <FkNavMount />
    </>
  );
}
