import "server-only";
import toolsData from "@public/data/tools.json";
import { PRICING, formatRupiah, periodSuffix } from "@/lib/pricing";
import { allPosts, pick as pickText } from "@/lib/blog";

// Asisten AI Founderku (tombol chat di semua halaman). Memakai Google
// Gemini API. Kunci API cuma ada di server (env GEMINI_API_KEY), tidak
// pernah dikirim ke browser.

export type Lang = "id" | "en" | "tr";

// Jatah pertanyaan per hari (tanggal WIB). Trial & Pro dapat lebih banyak.
export const AI_LIMIT = { free: 5, pro: 30 } as const;

// Batas isi supaya kuota Gemini tidak habis oleh pesan raksasa
export const MAX_PESAN = 12; // riwayat yang dikirim ke AI
export const MAX_KARAKTER_PESAN = 1500;
export const MAX_KARAKTER_TOTAL = 9000;

export interface PesanChat {
  role: "user" | "model";
  text: string;
}

export function aiAktif(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

// Validasi isi dari browser. Kembalikan null kalau tidak sah.
export function bersihkanPesan(masuk: unknown): PesanChat[] | null {
  if (!Array.isArray(masuk) || masuk.length === 0) return null;
  const hasil: PesanChat[] = [];
  for (const m of masuk.slice(-MAX_PESAN)) {
    if (!m || typeof m !== "object") return null;
    const role = (m as { role?: unknown }).role;
    const text = (m as { text?: unknown }).text;
    if ((role !== "user" && role !== "model") || typeof text !== "string") return null;
    const t = text.trim().slice(0, MAX_KARAKTER_PESAN);
    if (!t) continue;
    hasil.push({ role, text: t });
  }
  if (!hasil.length || hasil[hasil.length - 1].role !== "user") return null;
  // Gemini butuh percakapan diawali pesan user
  while (hasil.length && hasil[0].role !== "user") hasil.shift();
  let total = hasil.reduce((a, m) => a + m.text.length, 0);
  while (total > MAX_KARAKTER_TOTAL && hasil.length > 1) {
    total -= hasil.shift()!.text.length;
    while (hasil.length && hasil[0].role !== "user") total -= hasil.shift()!.text.length;
  }
  return hasil.length ? hasil : null;
}

const NAMA_BAHASA: Record<Lang, string> = { id: "Bahasa Indonesia santai tapi sopan", en: "English", tr: "Turkish (Türkçe)" };

interface ToolJson {
  id: string;
  name: string;
  short?: string | Partial<Record<Lang, string>>;
  description?: string | Partial<Record<Lang, string>>;
  linkUrl?: string;
  status?: string;
  external?: boolean;
}

// Instruksi sistem: siapa asistennya, gaya jawaban, dan daftar tools &
// artikel Founderku yang boleh direkomendasikan (dibaca dari data situs,
// jadi tool/artikel baru otomatis dikenali).
export function instruksiSistem(lang: Lang, halaman: string): string {
  const tools = ((toolsData as { tools?: ToolJson[] }).tools ?? [])
    .filter((t) => t.status !== "soon" && t.status !== "hidden")
    .map((t) => `- ${t.name} (${t.linkUrl || `/tools/${t.id}`}): ${pickText(t.short || t.description || "", "id")}`)
    .join("\n");
  const artikel = allPosts()
    .filter((p) => p.category === "panduan")
    .map((p) => `- ${pickText(p.title, "id")} (/blog/${p.slug})`)
    .join("\n");
  const harga = PRICING.prices.map((p) => `${formatRupiah(p.amount)}${periodSuffix(p.days)}`).join(" atau ");

  return [
    "Kamu adalah Asisten Founderku, asisten AI di situs founderku.com milik PT Talenthra Karya Nusantara.",
    "Founderku membantu pelaku UMKM dan founder startup di Indonesia membangun usaha lewat tools gratis, Pajangin (halaman jualan), panduan, dan jasa studio.",
    "",
    "Cara menjawab:",
    `- Jawab dalam ${NAMA_BAHASA[lang]}, kecuali user jelas memakai bahasa lain.`,
    "- Singkat dan praktis: maksimal sekitar 150 kata, pakai poin kalau membantu. Beri langkah konkret yang bisa langsung dilakukan.",
    "- Kalau ada tool Founderku yang cocok, sarankan dengan link relatif persis seperti di daftar, format [Nama](/tools/id). Maksimal 2 tool per jawaban. Jangan mengarang tool atau fitur yang tidak ada di daftar.",
    "- Untuk pajak, hukum, dan investasi: beri gambaran umum, lalu sarankan konsultasi ke profesional. Jangan memberi kepastian hukum atau janji keuntungan.",
    "- Jangan meminta data pribadi (nomor HP, alamat, nomor KTP, rekening, kata sandi). Kalau user mengirimnya, ingatkan untuk tidak membagikannya.",
    "- Tolak dengan sopan permintaan berbahaya, ilegal, atau di luar topik bisnis dan pengembangan diri, lalu tawarkan bantuan yang relevan.",
    "- Jangan pernah memakai tanda pisah panjang (em dash atau en dash). Pakai tanda hubung biasa atau koma.",
    "- Kalau tidak tahu, bilang tidak tahu. Jangan mengarang angka statistik atau sumber.",
    "",
    `Harga ${PRICING.planName}: ${harga}. Trial gratis ${PRICING.trialDays} hari otomatis saat daftar. Detail di /harga.`,
    "",
    "Tools Founderku:",
    tools,
    "",
    "Artikel panduan:",
    artikel,
    "",
    `User sedang membuka halaman: ${halaman.slice(0, 120)}`,
  ].join("\n");
}

// Aturan situs: tanpa em dash / en dash di teks mana pun
export function rapikanJawaban(t: string): string {
  return t
    .replace(/\s*[\u2014\u2013]\s*/g, " - ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type HasilAI = { ok: true; text: string } | { ok: false; alasan: "sibuk" | "diblokir" | "gagal" };

export async function tanyaGemini(pesan: PesanChat[], sistem: string): Promise<HasilAI> {
  const base = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const ctrl = new AbortController();
  const waktu = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const res = await fetch(`${base}/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistem }] },
        contents: pesan.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
      }),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (res.status === 429 || res.status === 503) return { ok: false, alasan: "sibuk" };
    if (!res.ok) return { ok: false, alasan: "gagal" };
    const j = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
      promptFeedback?: { blockReason?: string };
    };
    if (j.promptFeedback?.blockReason) return { ok: false, alasan: "diblokir" };
    const c = j.candidates?.[0];
    const teks = (c?.content?.parts ?? []).map((p) => p.text ?? "").join("");
    if (!teks.trim()) return { ok: false, alasan: c?.finishReason === "SAFETY" ? "diblokir" : "gagal" };
    return { ok: true, text: rapikanJawaban(teks) };
  } catch {
    return { ok: false, alasan: "gagal" };
  } finally {
    clearTimeout(waktu);
  }
}
