"use client";

import { useEffect, useState } from "react";
import {
  dengarStatus,
  kirimSebelumPergi,
  siapkanSinkron,
  type StatusSinkron,
  type ToolId,
} from "@/lib/tools/cloud";
import { FkNavMount } from "@/components/shell/FkNavMount";
import styles from "./ToolFrame.module.css";

// Paling lama nunggu data dari akun sebelum tool tetap ditampilkan
const BATAS_TUNGGU_MS = 4000;

// Bingkai semua tools: navigasi yang sama dengan beranda (fk-nav.css +
// fk-site.js), bar tipis (Tools / nama tool, status simpan ke akun), lalu
// tool-nya. Tool baru ditampilkan setelah data
// dari akun selesai diambil, supaya tool langsung baca data terbaru.
export function ToolFrame({
  toolId,
  toolName,
  children,
}: {
  toolId: ToolId;
  toolName: string;
  children: React.ReactNode;
}) {
  const [siap, setSiap] = useState(false);
  const [status, setStatus] = useState<StatusSinkron>("memuat");

  useEffect(() => dengarStatus(setStatus), []);

  useEffect(() => {
    let selesai = false;
    const tampilkan = () => {
      if (!selesai) {
        selesai = true;
        setSiap(true);
      }
    };
    const batas = setTimeout(tampilkan, BATAS_TUNGGU_MS);
    siapkanSinkron(toolId, () => !selesai)
      .catch(() => {
        // Error apa pun di sinkron: tool tetap jalan pakai data browser
      })
      .finally(() => {
        clearTimeout(batas);
        tampilkan();
      });
    return () => clearTimeout(batas);
  }, [toolId]);

  useEffect(() => {
    const saatSembunyi = () => {
      if (document.visibilityState === "hidden") kirimSebelumPergi();
    };
    document.addEventListener("visibilitychange", saatSembunyi);
    window.addEventListener("pagehide", kirimSebelumPergi);
    return () => {
      document.removeEventListener("visibilitychange", saatSembunyi);
      window.removeEventListener("pagehide", kirimSebelumPergi);
    };
  }, []);

  const balikKeSini = encodeURIComponent(`/tools/${toolId}`);

  return (
    <>
      {/* Navigasi bersama (file di public/, jadi tidak bisa di-import). Cuma
          gaya nav, tanpa aturan elemen dasar, supaya tampilan tool tetap. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/assets/fk-nav.css" precedence="default" />
      <header className="nav no-print" id="nav" data-fk-nav suppressHydrationWarning />
      <FkNavMount />
      <div className={`${styles.bar} no-print`} data-tool-bar>
        <nav className={styles.kiri} aria-label="Lokasi">
          <a href="/tools.html" className={styles.balik}>
            Tools
          </a>
          <span className={styles.garis} aria-hidden="true">/</span>
          <span className={styles.nama}>{toolName}</span>
        </nav>
        <div className={styles.status} role="status" aria-live="polite">
          {status === "memuat" && <span className={styles.redup}>Menyiapkan...</span>}
          {status === "tamu" && (
            <>
              <span className={styles.teks}>Data cuma tersimpan di browser ini.</span>
              <a className={styles.aksi} href={`/masuk?next=${balikKeSini}`}>
                Masuk
              </a>
            </>
          )}
          {status === "free" && (
            <>
              <span className={styles.teks}>Simpan ke akun dengan Founderku Pro.</span>
              <a className={styles.aksi} href="/harga">
                Lihat Harga
              </a>
            </>
          )}
          {status === "tersimpan" && (
            <span className={styles.ok}>
              <span className={styles.titik} aria-hidden="true" />
              Tersimpan di akun
            </span>
          )}
          {status === "menyimpan" && (
            <span className={styles.redup}>
              <span className={`${styles.titik} ${styles.titikJalan}`} aria-hidden="true" />
              Menyimpan...
            </span>
          )}
          {status === "gagal" && (
            <span className={styles.gagal}>Belum tersimpan ke akun, data aman di browser ini</span>
          )}
        </div>
      </div>
      {siap ? (
        children
      ) : (
        <div className={styles.tunggu} aria-busy="true">
          <span className={styles.putar} aria-hidden="true" />
          Memuat {toolName}...
        </div>
      )}
    </>
  );
}
