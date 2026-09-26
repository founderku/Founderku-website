import { catatPerubahan } from '../cloud';
const KEY = 'pajakin-draft-v1';

export interface DraftPajak {
  omzetSebelumBulanIni: number;
  omzetBulanIni: number;
}

export function muatDraft(): DraftPajak | null {
  if (typeof window === 'undefined') return null;
  try {
    const mentah = window.localStorage.getItem(KEY);
    if (!mentah) return null;
    return JSON.parse(mentah) as DraftPajak;
  } catch (error) {
    console.error('Gagal memuat data tersimpan:', error);
    return null;
  }
}

export function simpanDraft(data: DraftPajak): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
    catatPerubahan(KEY);
    return true;
  } catch (error) {
    console.error('Gagal menyimpan data:', error);
    return false;
  }
}
