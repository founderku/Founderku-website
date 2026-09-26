import { Jawaban } from './health';
import { catatPerubahan } from '../cloud';

const KEY = 'sehatin-jawaban-v1';

export function muatJawaban(): Jawaban {
  if (typeof window === 'undefined') return {};
  try {
    const mentah = window.localStorage.getItem(KEY);
    if (!mentah) return {};
    const parsed = JSON.parse(mentah);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    console.error('Gagal memuat jawaban:', error);
    return {};
  }
}

export function simpanJawaban(jawaban: Jawaban): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(jawaban));
    catatPerubahan(KEY);
    return true;
  } catch (error) {
    console.error('Gagal menyimpan jawaban:', error);
    return false;
  }
}

export function hapusJawaban(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(KEY);
    catatPerubahan(KEY);
    return true;
  } catch (error) {
    console.error('Gagal menghapus jawaban:', error);
    return false;
  }
}
