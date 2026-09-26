"use client";

import { useEffect, useState } from "react";
import {
  dengarStatus,
  kirimSebelumPergi,
  siapkanSinkron,
  type StatusSinkron,
  type ToolId,
} from "@/lib/tools/cloud";
import styles from "./ToolFrame.module.css";

// Paling lama nunggu data dari akun sebelum tool tetap ditampilkan
const BATAS_TUNGGU_MS = 4000;

// Bingkai semua tools: bar tipis di atas (logo, balik ke daftar tools,
// status simpan ke akun) + tool-nya. Tool baru ditampilkan setelah data
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
      <header className={`${styles.bar} no-print`}>
        <div className={styles.kiri}>
          <a href="/" className={styles.logo} aria-label="Founderku, ke beranda">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/favicon.svg" alt="" width={26} height={26} />
          </a>
          <a href="/tools.html" className={styles.balik}>
            <span aria-hidden="true">←</span> Tools
          </a>
          <span className={styles.garis} aria-hidden="true" />
          <span className={styles.nama}>{toolName}</span>
        </div>
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
      </header>
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
