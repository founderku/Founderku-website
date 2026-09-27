// Data blog dibaca dari public/data/blog.json (file yang sama dengan yang
// diedit lewat admin.html). Setiap kali admin menyimpan post, situs
// di-deploy ulang dan halaman /blog/<slug> ikut dibuat ulang.
import blogData from "@public/data/blog.json";
import toolsData from "@public/data/tools.json";

export type Lang = "id" | "en" | "tr";
export type Teks = string | Partial<Record<Lang, string>>;

export interface Post {
  id: string;
  slug: string;
  title: Teks;
  excerpt?: Teks;
  content?: Teks;
  category?: string;
  coverGradient?: string;
  date?: string;
  // Tanggal terbit (YYYY-MM-DD) untuk Google, opsional
  published?: string;
  // Tool yang dibahas artikel, opsional
  tool?: string;
  order?: number;
}

export interface ToolRingkas {
  id: string;
  name: string;
  short: Teks;
  href: string;
}

export const SITE = "https://founderku.com";

// Teks sesuai bahasa, kalau kosong pakai bahasa Indonesia
export function pick(t: Teks | undefined, lang: Lang = "id"): string {
  if (!t) return "";
  if (typeof t === "string") return t;
  return t[lang] || t.id || "";
}

export const CATEGORY: Record<string, Record<Lang, string>> = {
  update: { id: "Update", en: "Update", tr: "Güncelleme" },
  product: { id: "Produk", en: "Product", tr: "Ürün" },
  "case-study": { id: "Studi kasus", en: "Case study", tr: "Vaka çalışması" },
  panduan: { id: "Panduan", en: "Guide", tr: "Rehber" },
};

export function categoryLabel(c: string | undefined, lang: Lang = "id"): string {
  if (!c) return "";
  return CATEGORY[c]?.[lang] ?? c;
}

export const COVER: Record<string, string> = { amber: "art-a", coral: "art-b", indigo: "art-c" };

// Slug yang aman dipakai sebagai alamat (huruf kecil, angka, tanda hubung)
const SLUG_OK = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function allPosts(): Post[] {
  const posts = ((blogData as { posts?: Post[] }).posts ?? []).filter((p) => p && typeof p.slug === "string" && SLUG_OK.test(p.slug));
  return posts.slice().sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getPost(slug: string): Post | null {
  return allPosts().find((p) => p.slug === slug) ?? null;
}

interface ToolJson {
  id: string;
  name: string;
  short?: Teks;
  description?: Teks;
  linkUrl?: string;
  status?: string;
}

export function getTool(id: string | undefined): ToolRingkas | null {
  if (!id) return null;
  const t = ((toolsData as { tools?: ToolJson[] }).tools ?? []).find((x) => x.id === id);
  // Tool yang belum bisa dipakai tidak dipasang sebagai ajakan
  if (!t || t.status === "soon" || t.status === "hidden") return null;
  return { id: t.id, name: t.name, short: t.short || t.description || "", href: t.linkUrl || `/tools/${t.id}` };
}

// ---- Format isi artikel ----
// Isi ditulis sebagai teks biasa. Di awal baris boleh ada penanda:
//   "## "  subjudul          "### " subjudul kecil
//   "- "   poin              "1. "  langkah bernomor
//   "> "   kotak catatan/rumus
//   [[tool:runwayin]]  kartu ajakan ke tool
//   **teks**           huruf tebal (di dalam baris)
// Baris lain jadi paragraf. Semuanya ditampilkan sebagai teks, bukan HTML.

export type Inline = { b: boolean; s: string }[];

export type Block =
  | { t: "h2"; id: string; text: string }
  | { t: "h3"; text: string }
  | { t: "p"; inl: Inline }
  | { t: "ul"; items: Inline[] }
  | { t: "ol"; items: Inline[] }
  | { t: "note"; lines: Inline[] }
  | { t: "tool"; id: string };

export function parseInline(s: string): Inline {
  const out: Inline = [];
  const parts = s.split("**");
  // Kalau jumlah ** ganjil (lupa ditutup), tanda terakhir ditampilkan apa adanya
  if (parts.length % 2 === 0) {
    const last = parts.pop() ?? "";
    parts[parts.length - 1] += "**" + last;
  }
  parts.forEach((x, i) => {
    if (x) out.push({ b: i % 2 === 1, s: x });
  });
  return out;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseContent(src: string): Block[] {
  const blocks: Block[] = [];
  const ids = new Set<string>();
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const prev = blocks[blocks.length - 1];
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^\[\[tool:([a-z0-9-]+)\]\]$/))) {
      blocks.push({ t: "tool", id: m[1] });
    } else if (line.startsWith("### ")) {
      blocks.push({ t: "h3", text: line.slice(4).trim() });
    } else if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      let id = slugify(text) || "bagian";
      for (let n = 2; ids.has(id); n++) id = `${slugify(text) || "bagian"}-${n}`;
      ids.add(id);
      blocks.push({ t: "h2", id, text });
    } else if (line.startsWith("- ")) {
      const item = parseInline(line.slice(2).trim());
      if (prev?.t === "ul") prev.items.push(item);
      else blocks.push({ t: "ul", items: [item] });
    } else if ((m = line.match(/^\d+\.\s+(.*)$/))) {
      const item = parseInline(m[1]);
      if (prev?.t === "ol") prev.items.push(item);
      else blocks.push({ t: "ol", items: [item] });
    } else if (line.startsWith("> ") || line === ">") {
      const l = parseInline(line.slice(1).trim());
      if (prev?.t === "note") prev.lines.push(l);
      else blocks.push({ t: "note", lines: [l] });
    } else {
      blocks.push({ t: "p", inl: parseInline(line) });
    }
  }
  return blocks;
}

// Teks polos (tanpa penanda) untuk hitung waktu baca
export function plainText(src: string): string {
  return src
    .replace(/\[\[tool:[^\]]*\]\]/g, " ")
    .replace(/\*\*/g, "")
    .replace(/^(#{2,3} |- |\d+\.\s+|> ?)/gm, "");
}

export function readingMinutes(src: string): number {
  const words = plainText(src).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
