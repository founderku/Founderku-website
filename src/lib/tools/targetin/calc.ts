// Targetin: OKR (Objective & Key Results) dengan progres otomatis.

export interface KR {
  nama: string;
  awal: number;
  target: number;
  sekarang: number;
}

export interface Objective {
  nama: string;
  pemilik: string;
  kr: KR[];
}

// Progres 0-100. Bisa juga target turun (misal churn 8% -> 4%).
export function progresKR(k: KR): number | null {
  if (k.target === k.awal) return null;
  const p = ((k.sekarang - k.awal) / (k.target - k.awal)) * 100;
  return Math.max(0, Math.min(100, p));
}

export function progresObjective(o: Objective): number | null {
  const v = o.kr.filter((k) => k.nama.trim()).map(progresKR).filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export function statusOKR(p: number | null): "baik" | "hati" | "tertinggal" | null {
  if (p === null) return null;
  if (p >= 70) return "baik";
  if (p >= 40) return "hati";
  return "tertinggal";
}
