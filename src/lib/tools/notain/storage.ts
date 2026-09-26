// Info penjual (nama usaha, alamat, telepon) disimpan terpisah dari draft invoice,
// supaya waktu bikin "Invoice baru" gak perlu ngetik ulang data usaha.

import { ItemInvoice, PengaturanPotongan } from './calculations';
import { catatPerubahan } from '../cloud';

const KEY_PENJUAL = 'notain-penjual-v1';
const KEY_DRAFT = 'notain-draft-v1';
const KEY_COUNTER = 'notain-counter-v1';

export interface InfoPenjual {
  namaUsaha: string;
  alamat: string;
  telepon: string;
}

export interface DraftInvoice {
  nomorInvoice: string;
  tanggal: string; // format YYYY-MM-DD
  namaPembeli: string;
  alamatPembeli: string;
  items: ItemInvoice[];
  potongan: PengaturanPotongan;
  catatan: string;
}

function bacaJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const mentah = window.localStorage.getItem(key);
    if (!mentah) return null;
    return JSON.parse(mentah) as T;
  } catch (error) {
    console.error(`Gagal membaca ${key}:`, error);
    return null;
  }
}

function tulisJson(key: string, data: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
    catatPerubahan(key);
    return true;
  } catch (error) {
    console.error(`Gagal menyimpan ${key}:`, error);
    return false;
  }
}

export function muatInfoPenjual(): InfoPenjual | null {
  return bacaJson<InfoPenjual>(KEY_PENJUAL);
}

export function simpanInfoPenjual(data: InfoPenjual): boolean {
  return tulisJson(KEY_PENJUAL, data);
}

export function muatDraft(): DraftInvoice | null {
  return bacaJson<DraftInvoice>(KEY_DRAFT);
}

export function simpanDraft(data: DraftInvoice): boolean {
  return tulisJson(KEY_DRAFT, data);
}

export function ambilDanNaikkanCounter(): number {
  const sekarang = bacaJson<number>(KEY_COUNTER) ?? 1;
  tulisJson(KEY_COUNTER, sekarang + 1);
  return sekarang;
}

export function hapusSemuaData(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(KEY_PENJUAL);
    catatPerubahan(KEY_PENJUAL);
    window.localStorage.removeItem(KEY_DRAFT);
    catatPerubahan(KEY_DRAFT);
    window.localStorage.removeItem(KEY_COUNTER);
    catatPerubahan(KEY_COUNTER);
    return true;
  } catch (error) {
    console.error('Gagal menghapus data:', error);
    return false;
  }
}

export function hapusDraftSaja(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(KEY_DRAFT);
    catatPerubahan(KEY_DRAFT);
    return true;
  } catch (error) {
    console.error('Gagal menghapus draft:', error);
    return false;
  }
}
