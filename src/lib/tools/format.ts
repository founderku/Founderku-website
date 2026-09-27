// Format angka untuk tools (gaya Indonesia: 1.250.000 dan 12,5%).

const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const desimal = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

export function rp(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return (n < 0 ? "-Rp " : "Rp ") + angka.format(Math.abs(Math.round(n)));
}

// Rupiah ringkas untuk label grafik: Rp 1,2 M / Rp 350 jt / Rp 12 rb
export function rpRingkas(n: number): string {
  if (!Number.isFinite(n)) return "-";
  const a = Math.abs(n);
  const s = n < 0 ? "-" : "";
  if (a >= 1e12) return `${s}Rp ${desimal.format(a / 1e12)} T`;
  if (a >= 1e9) return `${s}Rp ${desimal.format(a / 1e9)} M`;
  if (a >= 1e6) return `${s}Rp ${desimal.format(a / 1e6)} jt`;
  if (a >= 1e3) return `${s}Rp ${desimal.format(a / 1e3)} rb`;
  return `${s}Rp ${angka.format(a)}`;
}

export function nf(n: number, digit = 0): string {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: digit }).format(n);
}

export function pct(n: number, digit = 1): string {
  if (!Number.isFinite(n)) return "-";
  return `${nf(n, digit)}%`;
}

// Baca teks isian jadi angka: "1.250.000" -> 1250000, "2,5" -> 2.5
export function parseAngka(teks: string): number {
  const bersih = teks.replace(/[^\d,-]/g, "").replace(",", ".");
  const n = parseFloat(bersih);
  return Number.isFinite(n) ? n : 0;
}

// Tanggal lokal (bukan UTC) format YYYY-MM-DD, supaya pagi hari di WIB
// tidak tercatat sebagai tanggal kemarin.
export function tanggalLokal(t: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}
