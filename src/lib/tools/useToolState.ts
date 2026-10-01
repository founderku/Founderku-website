"use client";

import { useCallback, useEffect, useState, type SetStateAction } from "react";
import { catatPerubahan } from "./cloud";
import { daftarkanNamaData, dengarProyek, kunciData, proyekAktif } from "./proyek";
import type { ToolId } from "./registry";

// Penyimpanan standar untuk tools baru: isi tool disimpan di browser
// (localStorage) dengan kunci "<idtool>-<nama>", lalu otomatis ikut
// tersimpan ke akun lewat cloud.ts kalau user login dengan trial/Pro.
//
// Tool bisa punya banyak proyek (proyek.ts): kunci data mengikuti proyek
// yang sedang dibuka, dan isi tool otomatis berganti saat proyek dipindah.
//
// Tool dibungkus ToolFrame, yang baru menampilkan tool SETELAH data dari
// akun selesai diambil. Jadi saat komponen ini pertama jalan, localStorage
// sudah berisi data terbaru.

function baca<T>(key: string, awal: T): T {
  if (typeof window === "undefined") return awal;
  try {
    const mentah = window.localStorage.getItem(key);
    if (!mentah) return awal;
    const isi = JSON.parse(mentah) as T;
    // Gabung dengan nilai awal supaya kolom baru (versi tool lebih baru)
    // tetap punya nilai bawaan.
    if (awal && typeof awal === "object" && !Array.isArray(awal) && isi && typeof isi === "object") {
      return { ...awal, ...isi };
    }
    return isi;
  } catch {
    return awal;
  }
}

// simpan: false saat isi baru dibaca (buka tool / pindah proyek), supaya
// tidak langsung ditulis ulang
type Kotak<T> = { key: string; state: T; simpan: boolean };

export function useToolState<T>(toolId: ToolId, nama: string, awal: T) {
  daftarkanNamaData(toolId, nama);
  const [proyek, setProyek] = useState(() => proyekAktif(toolId));
  const key = kunciData(toolId, nama, proyek);
  const [kotak, setKotak] = useState<Kotak<T>>(() => ({ key, state: baca(key, awal), simpan: false }));

  useEffect(() => dengarProyek(toolId, () => setProyek(proyekAktif(toolId))), [toolId]);

  // Proyek berganti: muat isi proyek itu (pola "state turunan" React)
  if (kotak.key !== key) setKotak({ key, state: baca(key, awal), simpan: false });

  useEffect(() => {
    if (!kotak.simpan) return;
    try {
      window.localStorage.setItem(kotak.key, JSON.stringify(kotak.state));
      catatPerubahan(kotak.key);
    } catch {
      // penyimpanan penuh / diblokir: tool tetap jalan selama halaman terbuka
    }
  }, [kotak]);

  const setState = useCallback((v: SetStateAction<T>) => {
    setKotak((k) => ({
      ...k,
      state: typeof v === "function" ? (v as (prev: T) => T)(k.state) : v,
      simpan: true,
    }));
  }, []);

  // Kosongkan: hapus dari browser (dan dari akun), kembali ke nilai awal
  const reset = useCallback(
    (nilai?: T) => {
      setKotak((k) => {
        try {
          window.localStorage.removeItem(k.key);
          catatPerubahan(k.key);
        } catch {
          // abaikan
        }
        return { key: k.key, state: nilai ?? awal, simpan: nilai !== undefined };
      });
    },
    // awal sengaja tidak dipantau: nilai bawaan tool tidak berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return [kotak.state, setState, reset] as const;
}
