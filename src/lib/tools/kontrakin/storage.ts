import { PihakInfo, DraftKontrak } from './document';
import { catatPerubahan } from '../cloud';

const KEY_PIHAK_PERTAMA = 'kontrakin-pihak-pertama-v1';
const KEY_DRAFT = 'kontrakin-draft-v1';

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

export function muatPihakPertama(): PihakInfo | null {
  return bacaJson<PihakInfo>(KEY_PIHAK_PERTAMA);
}

export function simpanPihakPertama(data: PihakInfo): boolean {
  return tulisJson(KEY_PIHAK_PERTAMA, data);
}

export function muatDraft(): DraftKontrak | null {
  return bacaJson<DraftKontrak>(KEY_DRAFT);
}

export function simpanDraft(data: DraftKontrak): boolean {
  return tulisJson(KEY_DRAFT, data);
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

export function hapusSemuaData(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(KEY_PIHAK_PERTAMA);
    catatPerubahan(KEY_PIHAK_PERTAMA);
    window.localStorage.removeItem(KEY_DRAFT);
    catatPerubahan(KEY_DRAFT);
    return true;
  } catch (error) {
    console.error('Gagal menghapus data:', error);
    return false;
  }
}
