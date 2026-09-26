import { catatPerubahan } from '../cloud';
const KEY = 'jalanin-progress-v1';

export function muatProgress(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const mentah = window.localStorage.getItem(KEY);
    if (!mentah) return [];
    const parsed = JSON.parse(mentah);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Gagal memuat progress:', error);
    return [];
  }
}

export function simpanProgress(selesai: string[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(selesai));
    catatPerubahan(KEY);
    return true;
  } catch (error) {
    console.error('Gagal menyimpan progress:', error);
    return false;
  }
}

export function hapusProgress(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(KEY);
    catatPerubahan(KEY);
    return true;
  } catch (error) {
    console.error('Gagal menghapus progress:', error);
    return false;
  }
}
