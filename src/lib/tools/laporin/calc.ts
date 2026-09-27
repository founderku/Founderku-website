// Laporin: laporan bulanan untuk investor (teks siap kirim).

export interface Metrik {
  nama: string;
  ini: number;
  lalu: number;
  satuan: "angka" | "rp" | "persen";
}

export interface DataLaporan {
  nama: string;
  bulan: string; // YYYY-MM
  ringkasan: string;
  metrik: Metrik[];
  capaian: string;
  tantangan: string;
  rencana: string;
  bantuan: string;
  kas: number;
  burn: number;
  penutup: string;
}

const BLN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function namaBulan(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return "";
  return `${BLN[Number(m[2]) - 1] ?? ""} ${m[1]}`;
}

export function perubahan(ini: number, lalu: number): number | null {
  if (!lalu) return null;
  return ((ini - lalu) / Math.abs(lalu)) * 100;
}

export function runwayBulan(kas: number, burn: number): number | null {
  return burn > 0 ? kas / burn : null;
}

function angka(n: number, satuan: Metrik["satuan"]): string {
  const f = new Intl.NumberFormat("id-ID", { maximumFractionDigits: satuan === "persen" ? 1 : 0 }).format(n);
  return satuan === "rp" ? `Rp ${f}` : satuan === "persen" ? `${f}%` : f;
}

function poin(teks: string): string[] {
  return teks
    .split("\n")
    .map((x) => x.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

// Susun teks email lengkap. Bagian kosong tidak ditampilkan.
export function susunTeks(d: DataLaporan): string {
  const baris: string[] = [];
  const judul = `Update ${d.nama || "startup"}${namaBulan(d.bulan) ? " - " + namaBulan(d.bulan) : ""}`;
  baris.push(judul, "");
  if (d.ringkasan.trim()) baris.push(d.ringkasan.trim(), "");
  const mt = d.metrik.filter((m) => m.nama.trim());
  if (mt.length) {
    baris.push("METRIK UTAMA");
    mt.forEach((m) => {
      const p = perubahan(m.ini, m.lalu);
      const arah = p === null ? "" : ` (${p >= 0 ? "+" : ""}${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(p)}% dari bulan lalu)`;
      baris.push(`- ${m.nama.trim()}: ${angka(m.ini, m.satuan)}${arah}`);
    });
    baris.push("");
  }
  if (d.kas > 0 || d.burn > 0) {
    const r = runwayBulan(d.kas, d.burn);
    baris.push("KAS");
    if (d.kas > 0) baris.push(`- Kas: ${angka(d.kas, "rp")}`);
    if (d.burn > 0) baris.push(`- Burn rate: ${angka(d.burn, "rp")} per bulan`);
    if (r !== null) baris.push(`- Runway: sekitar ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(r)} bulan`);
    baris.push("");
  }
  const bagian: [string, string][] = [
    ["CAPAIAN", d.capaian],
    ["TANTANGAN", d.tantangan],
    ["RENCANA BULAN DEPAN", d.rencana],
    ["BUTUH BANTUAN", d.bantuan],
  ];
  bagian.forEach(([j, t]) => {
    const p = poin(t);
    if (p.length) baris.push(j, ...p.map((x) => `- ${x}`), "");
  });
  if (d.penutup.trim()) baris.push(d.penutup.trim());
  return baris.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
