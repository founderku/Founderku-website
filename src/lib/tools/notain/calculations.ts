// Semua logika hitung subtotal, diskon, pajak, dan total invoice.
// Dipisah dari komponen UI supaya gampang dites.

export interface ItemInvoice {
  id: string;
  nama: string;
  qty: number;
  hargaSatuan: number;
}

export type ModeDiskon = 'persen' | 'nominal';

export interface PengaturanPotongan {
  diskonMode: ModeDiskon;
  diskonPersen: number;
  diskonNominal: number;
  pajakPersen: number; // PPN atau pajak lain, dihitung setelah diskon
}

export interface HasilInvoice {
  subtotal: number;
  jumlahDiskon: number;
  setelahDiskon: number;
  jumlahPajak: number;
  total: number;
}

export function hitungSubtotalItem(item: ItemInvoice): number {
  return item.qty * item.hargaSatuan;
}

export function hitungSubtotal(items: ItemInvoice[]): number {
  return items.reduce((total, item) => total + hitungSubtotalItem(item), 0);
}

export function hitungInvoice(items: ItemInvoice[], potongan: PengaturanPotongan): HasilInvoice {
  const subtotal = hitungSubtotal(items);

  let jumlahDiskon =
    potongan.diskonMode === 'persen'
      ? (subtotal * potongan.diskonPersen) / 100
      : potongan.diskonNominal;
  // Diskon gak boleh lebih besar dari subtotal (hindari total minus).
  jumlahDiskon = Math.min(Math.max(jumlahDiskon, 0), subtotal);

  const setelahDiskon = subtotal - jumlahDiskon;
  const jumlahPajak = (setelahDiskon * potongan.pajakPersen) / 100;
  const total = setelahDiskon + jumlahPajak;

  return { subtotal, jumlahDiskon, setelahDiskon, jumlahPajak, total };
}

export function formatRupiah(nilai: number): string {
  if (!isFinite(nilai)) return 'Rp 0';
  return 'Rp ' + Math.round(nilai).toLocaleString('id-ID');
}

export function buatId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Bikin nomor invoice default berdasarkan tanggal hari ini, misal INV/20260915/001. */
export function buatNomorInvoiceDefault(nomorUrut: number, tanggal: Date = new Date()): string {
  const yyyy = tanggal.getFullYear();
  const mm = String(tanggal.getMonth() + 1).padStart(2, '0');
  const dd = String(tanggal.getDate()).padStart(2, '0');
  const urut = String(nomorUrut).padStart(3, '0');
  return `INV/${yyyy}${mm}${dd}/${urut}`;
}

export function formatTanggalIndonesia(tanggalIso: string): string {
  if (!tanggalIso) return '';
  const d = new Date(tanggalIso + 'T00:00:00');
  if (isNaN(d.getTime())) return tanggalIso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
