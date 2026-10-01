"use client";

// Banyak proyek per tool (misal 3 ide bisnis di Validasiin).
//
// - Daftar proyek disimpan di kunci "<idtool>-proyek" (ikut ke akun).
// - Proyek pertama (id "1") memakai kunci data lama "<idtool>-<nama>",
//   jadi data yang sudah ada otomatis jadi "Proyek 1". Proyek lain
//   memakai "<idtool>-<nama>-p<id>".
// - Proyek yang sedang dibuka hanya diingat di browser ini
//   ("fk-proyek-<idtool>", tidak ikut ke akun).
// - Akun Free: 1 proyek. Pro: tanpa batas (dibatasi kuota simpanan akun).

import { catatPerubahan } from "./cloud";
import type { ToolId } from "./registry";

export type Proyek = { id: string; nama: string };

const EVENT = "fk:proyek";
export const PROYEK_FREE = 1;
export const PROYEK_MAKS = 30; // pengaman supaya kuota simpanan akun tidak habis di satu tool

const kunciDaftar = (t: ToolId) => `${t}-proyek`;
const kunciAktif = (t: ToolId) => `fk-proyek-${t}`;

// Nama kunci data tiap tool (dicatat useToolState) supaya data proyek
// yang dihapus ikut terhapus
const namaData = new Map<string, string>();
export function daftarkanNamaData(t: ToolId, nama: string) {
  namaData.set(t, nama);
}

export function kunciData(t: ToolId, nama: string, id: string) {
  return id === "1" ? `${t}-${nama}` : `${t}-${nama}-p${id}`;
}

function bersihkanNama(n: string) {
  return n.replace(/\s+/g, " ").trim().slice(0, 40);
}

export function daftarProyek(t: ToolId): Proyek[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(kunciDaftar(t)) || "null");
    const list = Array.isArray(v?.list) ? v.list : [];
    const ok = list.filter(
      (p: unknown): p is Proyek =>
        !!p && typeof (p as Proyek).id === "string" && /^[a-z0-9]{1,8}$/.test((p as Proyek).id) && typeof (p as Proyek).nama === "string",
    );
    if (!ok.some((p: Proyek) => p.id === "1")) ok.unshift({ id: "1", nama: "Proyek 1" });
    return ok;
  } catch {
    return [{ id: "1", nama: "Proyek 1" }];
  }
}

function simpanDaftar(t: ToolId, list: Proyek[]) {
  try {
    window.localStorage.setItem(kunciDaftar(t), JSON.stringify({ list }));
    catatPerubahan(kunciDaftar(t));
  } catch {
    // penyimpanan penuh: daftar hanya berlaku selama halaman terbuka
  }
}

export function proyekAktif(t: ToolId): string {
  if (typeof window === "undefined") return "1";
  try {
    const id = window.localStorage.getItem(kunciAktif(t)) || "1";
    return daftarProyek(t).some((p) => p.id === id) ? id : "1";
  } catch {
    return "1";
  }
}

function umumkan(t: ToolId) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: t }));
}

export function dengarProyek(t: ToolId, f: () => void) {
  const h = (e: Event) => {
    if ((e as CustomEvent).detail === t) f();
  };
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

export function pilihProyek(t: ToolId, id: string) {
  try {
    window.localStorage.setItem(kunciAktif(t), id);
  } catch {
    // abaikan
  }
  umumkan(t);
}

export function buatProyek(t: ToolId, nama: string): string | null {
  const list = daftarProyek(t);
  if (list.length >= PROYEK_MAKS) return null;
  let id = "";
  do id = Math.random().toString(36).slice(2, 7);
  while (!/^[a-z0-9]{5}$/.test(id) || list.some((p) => p.id === id));
  simpanDaftar(t, [...list, { id, nama: bersihkanNama(nama) || `Proyek ${list.length + 1}` }]);
  pilihProyek(t, id);
  return id;
}

export function gantiNamaProyek(t: ToolId, id: string, nama: string) {
  const n = bersihkanNama(nama);
  if (!n) return;
  simpanDaftar(
    t,
    daftarProyek(t).map((p) => (p.id === id ? { ...p, nama: n } : p)),
  );
  umumkan(t);
}

// Proyek 1 tidak bisa dihapus (cukup dikosongkan lewat tombol Kosongkan)
export function hapusProyek(t: ToolId, id: string) {
  if (id === "1") return;
  const nama = namaData.get(t);
  if (nama) {
    const k = kunciData(t, nama, id);
    try {
      window.localStorage.removeItem(k);
      catatPerubahan(k);
    } catch {
      // abaikan
    }
  }
  simpanDaftar(
    t,
    daftarProyek(t).filter((p) => p.id !== id),
  );
  pilihProyek(t, "1");
}
