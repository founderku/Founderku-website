// Kompetitorin: tabel perbandingan fitur + peta posisi 2 sumbu.

export interface Pesaing {
  nama: string;
  harga: string;
  x: number; // 1-10 sumbu mendatar
  y: number; // 1-10 sumbu tegak
  punya: boolean[]; // per kriteria
}

// Kriteria yang produk kita punya dan dimiliki paling banyak setengah
// pesaing = pembeda.
export function pembeda(kriteria: string[], kita: boolean[], pesaing: Pesaing[]): string[] {
  const n = pesaing.length;
  return kriteria.filter((k, i) => {
    if (!k.trim() || !kita[i]) return false;
    const jml = pesaing.filter((p) => p.punya[i]).length;
    return n === 0 || jml <= n / 2;
  });
}

// Kriteria yang dimiliki mayoritas pesaing tapi belum kita punya = celah.
export function celah(kriteria: string[], kita: boolean[], pesaing: Pesaing[]): string[] {
  const n = pesaing.length;
  if (!n) return [];
  return kriteria.filter((k, i) => k.trim() && !kita[i] && pesaing.filter((p) => p.punya[i]).length > n / 2);
}
