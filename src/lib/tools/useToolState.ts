"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { catatPerubahan } from "./cloud";
import type { ToolId } from "./registry";

// Penyimpanan standar untuk tools baru: isi tool disimpan di browser
// (localStorage) dengan kunci "<idtool>-<nama>", lalu otomatis ikut
// tersimpan ke akun lewat cloud.ts kalau user login dengan trial/Pro.
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

export function useToolState<T>(toolId: ToolId, nama: string, awal: T) {
  const key = `${toolId}-${nama}`;
  const [state, setState] = useState<T>(() => baca(key, awal));
  const lewati = useRef(true); // jangan tulis ulang saat baru dibuka

  useEffect(() => {
    if (lewati.current) {
      lewati.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
      catatPerubahan(key);
    } catch {
      // penyimpanan penuh / diblokir: tool tetap jalan selama halaman terbuka
    }
  }, [key, state]);

  // Kosongkan: hapus dari browser (dan dari akun), kembali ke nilai awal
  const reset = useCallback(
    (nilai?: T) => {
      try {
        window.localStorage.removeItem(key);
        catatPerubahan(key);
      } catch {
        // abaikan
      }
      lewati.current = nilai === undefined;
      setState(nilai ?? awal);
    },
    // awal sengaja tidak dipantau: nilai bawaan tool tidak berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [state, setState, reset] as const;
}
