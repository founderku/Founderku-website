import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { OwnerPreviewBanner } from "@/components/OwnerPreviewBanner";
import { toWhatsAppLink } from "@/lib/validators";
import type { StoreStyleId } from "@/lib/types";

export interface EtalaseData {
  productName: string;
  tagline: string;
  originalPrice: number | null;
  promoPrice: number | null;
  highlights: string[];
  imageUrl: string | null;
  whatsappNumber: string;
  showWatermark: boolean;
  storeSlug: string | null;
}

function formatRupiah(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "";
  return "Rp " + value.toLocaleString("id-ID");
}

function useWaLink(data: EtalaseData) {
  const msg = `Halo! Saya mau pesan ${data.productName} (${formatRupiah(
    data.promoPrice
  )}) dari web. Apakah stok masih ada?`;
  return data.whatsappNumber ? toWhatsAppLink(data.whatsappNumber, msg) : "#";
}

function Logo() {
  return (
    <Link
      href="/pajangin"
      className="absolute top-6 left-6 z-20 flex items-center gap-2 group"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pajangin-assets/logo.jpeg"
        alt="Pajangin"
        className="w-8 h-8 rounded-xl transition-transform group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

function StoreLink({ storeSlug, className }: { storeSlug: string | null; className: string }) {
  if (!storeSlug) return null;
  return (
    <Link href={`/toko/${storeSlug}`} className={className}>
      Lihat produk lain dari toko ini →
    </Link>
  );
}

// ============================================================
// KLASIK - gaya asli Pajangin (dark hero + kartu mengambang)
// ============================================================
function Klasik({ data }: { data: EtalaseData }) {
  const waLink = useWaLink(data);
  return (
    <div className="min-h-screen bg-bg-soft">
      <div className="relative">
        <Logo />
        <span className="absolute top-8 left-1/2 -translate-x-1/2" />
      </div>
      <div className="bg-ink px-6 pt-20 pb-24 sm:pt-24 sm:pb-32">
        <Reveal className="max-w-2xl mx-auto text-center">
          <span className="inline-block font-manrope font-bold text-xs uppercase tracking-widest text-amber mb-5">
            Etalase Digital
          </span>
          <h1 className="font-manrope font-extrabold text-4xl sm:text-6xl tracking-tight text-white text-balance leading-[1.05]">
            {data.productName}
          </h1>
          {data.tagline && (
            <p className="mt-5 text-lg text-ink-soft max-w-lg mx-auto">
              {data.tagline}
            </p>
          )}
        </Reveal>
      </div>

      <div className="px-6 -mt-14 sm:-mt-20 pb-16">
        <Reveal delayMs={100} className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_30px_60px_-30px_rgba(20,19,31,0.22)]">
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-amber to-coral flex items-center justify-center">
              {data.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.imageUrl} alt={data.productName} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="text-white/85 text-sm font-manrope font-semibold">Foto produk</span>
              )}
              {data.showWatermark && (
                <div className="absolute bottom-3 right-3 text-[11px] font-manrope font-semibold text-white bg-ink/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  Powered by Pajangin
                </div>
              )}
            </div>
            <div className="p-7 sm:p-8">
              <h2 className="font-manrope font-extrabold text-2xl sm:text-3xl tracking-tight mb-2">{data.productName || "Nama produk"}</h2>
              <p className="text-base text-text-soft mb-6">{data.tagline || "Tagline singkat produk kamu"}</p>
              <div className="flex items-baseline gap-3 mb-6">
                {data.originalPrice ? <span className="text-base text-text-faint line-through">{formatRupiah(data.originalPrice)}</span> : null}
                <span className="font-manrope font-extrabold text-3xl text-coral">{formatRupiah(data.promoPrice) || "Rp 0"}</span>
              </div>
              <hr className="border-border mb-6" />
              <ul className="text-[15px] space-y-3 mb-2">
                {data.highlights.filter((h) => h.trim()).map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-text-soft"><span className="text-indigo font-bold">✓</span>{h}</li>
                ))}
              </ul>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-center gap-2 glass-amber text-ink font-manrope font-extrabold text-base py-4 rounded-2xl transition-transform hover:-translate-y-0.5">
                💬 Chat via WhatsApp
              </a>
            </div>
          </div>
          <StoreLink storeSlug={data.storeSlug} className="block text-center mt-5 text-sm font-manrope font-bold text-ink border-b-2 border-amber" />
        </Reveal>
      </div>

      <div className="bg-ink px-6 py-8">
        <Reveal className="max-w-md mx-auto text-center">
          <p className="text-sm text-ink-faint">Halaman ini dibuat dengan <span className="font-manrope font-bold text-white">Pajangin</span></p>
        </Reveal>
      </div>
    </div>
  );
}

// ============================================================
// HANGAT - editorial cafe/resto (ref: template Lambert) - foto full
// bleed jadi hero, judul besar nempel di atas foto, nuansa krem hangat
// ============================================================
function Hangat({ data }: { data: EtalaseData }) {
  const waLink = useWaLink(data);
  return (
    <div className="min-h-screen bg-[#F5EEE3]">
      <div className="relative w-full h-[70vh] min-h-[420px] overflow-hidden">
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.imageUrl} alt={data.productName} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#3E2A1E] to-[#8B5A2B]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a120c]/85 via-[#1a120c]/25 to-[#1a120c]/40" />
        <Logo />
        <Reveal className="absolute inset-0 flex flex-col items-center justify-end text-center pb-14 px-6">
          <span className="font-manrope font-bold text-[11px] uppercase tracking-[0.25em] text-[#E8C89A] mb-4">
            Selamat Datang
          </span>
          <h1 className="font-manrope font-bold text-4xl sm:text-6xl text-white text-balance leading-[1.05] max-w-2xl">
            {data.productName}
          </h1>
        </Reveal>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <Reveal>
          <span className="font-manrope font-bold text-[11px] uppercase tracking-[0.2em] text-[#8B5A2B]">Cerita Singkat</span>
          <p className="mt-4 text-lg text-[#4A3B2E] leading-relaxed">
            {data.tagline || "Tagline singkat produk kamu"}
          </p>
          <div className="mt-8 flex items-baseline justify-center gap-3">
            {data.originalPrice ? <span className="text-base text-[#A6947F] line-through">{formatRupiah(data.originalPrice)}</span> : null}
            <span className="font-manrope font-extrabold text-3xl text-[#8B5A2B]">{formatRupiah(data.promoPrice) || "Rp 0"}</span>
          </div>
        </Reveal>
      </div>

      {data.highlights.filter((h) => h.trim()).length > 0 && (
        <div className="bg-[#3E2A1E] px-6 py-14">
          <Reveal className="max-w-2xl mx-auto">
            <h3 className="text-center font-manrope font-bold text-xs uppercase tracking-[0.2em] text-[#E8C89A] mb-8">
              Kenapa Pilih Ini
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              {data.highlights.filter((h) => h.trim()).map((h, i) => (
                <div key={i}>
                  <p className="text-white text-sm">{h}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      )}

      <div className="px-6 py-16 text-center">
        <Reveal>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#3E2A1E] text-white font-manrope font-bold text-base px-9 py-4 rounded-lg hover:-translate-y-0.5 transition-transform">
            💬 Chat via WhatsApp
          </a>
          <div className="mt-5">
            <StoreLink storeSlug={data.storeSlug} className="text-sm font-manrope font-bold text-[#8B5A2B] border-b-2 border-[#8B5A2B]" />
          </div>
        </Reveal>
      </div>

      {data.showWatermark && (
        <div className="bg-[#3E2A1E] px-6 py-6 text-center">
          <p className="text-xs text-[#E8C89A]/70">Powered by <span className="font-manrope font-bold text-white">Pajangin</span></p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MINIMALIS - clean e-commerce (ref: template Saudagar) - bersih,
// sage green + krem, banyak white space
// ============================================================
function Minimalis({ data }: { data: EtalaseData }) {
  const waLink = useWaLink(data);
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#E4E8E1] px-6 py-5 flex items-center justify-center relative">
        <Logo />
        <span className="font-manrope font-extrabold text-lg tracking-wide text-[#3D4A3D]">
          {data.storeSlug ? data.storeSlug.toUpperCase() : "TOKO"}
        </span>
      </div>

      <Reveal className="max-w-md mx-auto px-6 pt-10">
        <div className="bg-[#EFEDE3] rounded-2xl overflow-hidden aspect-square relative">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.imageUrl} alt={data.productName} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#5C7A5C] text-sm font-manrope font-semibold">
              Foto produk
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delayMs={100} className="max-w-md mx-auto px-6 py-8 text-center">
        <h1 className="font-manrope font-semibold text-2xl tracking-tight text-[#1F291F] mb-2">
          {data.productName}
        </h1>
        <p className="text-sm text-[#6B7A6B] mb-5">{data.tagline}</p>
        <div className="flex items-baseline justify-center gap-3 mb-6">
          {data.originalPrice ? <span className="text-sm text-[#A8B3A8] line-through">{formatRupiah(data.originalPrice)}</span> : null}
          <span className="font-manrope font-bold text-2xl text-[#1F291F]">{formatRupiah(data.promoPrice) || "Rp 0"}</span>
        </div>

        {data.highlights.filter((h) => h.trim()).length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {data.highlights.filter((h) => h.trim()).map((h, i) => (
              <span key={i} className="text-xs font-manrope font-semibold bg-[#EFEDE3] text-[#3D4A3D] px-3 py-1.5 rounded-full">
                {h}
              </span>
            ))}
          </div>
        )}

        <a href={waLink} target="_blank" rel="noopener noreferrer" className="block bg-[#5C7A5C] text-white font-manrope font-semibold text-sm py-3.5 rounded-md hover:bg-[#4A644A] transition-colors">
          💬 Chat via WhatsApp
        </a>
        <div className="mt-5">
          <StoreLink storeSlug={data.storeSlug} className="text-xs font-manrope font-semibold text-[#5C7A5C] border-b border-[#5C7A5C]" />
        </div>
      </Reveal>

      {data.showWatermark && (
        <div className="border-t border-[#E4E8E1] px-6 py-5 text-center mt-6">
          <p className="text-[11px] text-[#8B978B]">Powered by <span className="font-manrope font-bold text-[#1F291F]">Pajangin</span></p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ELEGAN - boutique pastel (ref: template Elzatta) - lembut, mauve,
// tombol pil, nama produk kayak wordmark brand
// ============================================================
function Elegan({ data }: { data: EtalaseData }) {
  const waLink = useWaLink(data);
  return (
    <div className="min-h-screen bg-[#FBF3F1]">
      <div className="relative px-6 pt-8 pb-4 text-center">
        <Logo />
        <span className="font-manrope font-semibold text-[10px] uppercase tracking-[0.3em] text-[#9C6B7A]">
          Koleksi Pilihan
        </span>
        <h1 className="font-manrope font-semibold text-3xl sm:text-4xl tracking-tight text-[#5C3A45] mt-2">
          {data.productName}
        </h1>
      </div>

      <Reveal className="max-w-md mx-auto px-6 mt-6">
        <div className="rounded-[32px] overflow-hidden aspect-[4/5] relative bg-gradient-to-br from-[#FBF3F1] to-[#E8CFD4]">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.imageUrl} alt={data.productName} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#9C6B7A] text-sm font-manrope font-semibold">
              Foto produk
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delayMs={100} className="max-w-md mx-auto px-6 py-8 text-center">
        <p className="text-sm text-[#8A6670] mb-5">{data.tagline}</p>
        <div className="flex items-baseline justify-center gap-3 mb-6">
          {data.originalPrice ? <span className="text-sm text-[#C9AAB2] line-through">{formatRupiah(data.originalPrice)}</span> : null}
          <span className="font-manrope font-bold text-2xl text-[#9C6B7A]">{formatRupiah(data.promoPrice) || "Rp 0"}</span>
        </div>

        {data.highlights.filter((h) => h.trim()).length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {data.highlights.filter((h) => h.trim()).map((h, i) => (
              <span key={i} className="w-3 h-3 rounded-full bg-[#9C6B7A]" title={h} />
            ))}
            <span className="text-xs text-[#8A6670] w-full mt-2">
              {data.highlights.filter((h) => h.trim()).join(" • ")}
            </span>
          </div>
        )}

        <a href={waLink} target="_blank" rel="noopener noreferrer" className="block bg-[#9C6B7A] text-white font-manrope font-semibold text-sm py-3.5 rounded-full hover:bg-[#875A68] transition-colors">
          💬 Chat via WhatsApp
        </a>
        <div className="mt-5">
          <StoreLink storeSlug={data.storeSlug} className="text-xs font-manrope font-semibold text-[#9C6B7A] border-b border-[#9C6B7A]" />
        </div>
      </Reveal>

      {data.showWatermark && (
        <div className="px-6 py-6 text-center">
          <p className="text-[11px] text-[#B594A0]">Powered by <span className="font-manrope font-bold text-[#5C3A45]">Pajangin</span></p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// BOLD - editorial streetwear (ref: template Aurum) - hitam-putih,
// kontras tinggi, tipografi besar, sudut tegas
// ============================================================
function Bold({ data }: { data: EtalaseData }) {
  const waLink = useWaLink(data);
  const activeHighlights = data.highlights.filter((h) => h.trim());
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative w-full h-[60vh] min-h-[380px] overflow-hidden border-b border-white/15">
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.imageUrl} alt={data.productName} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125" />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        <Logo />
        <span className="absolute top-6 right-6 z-20 font-manrope font-extrabold text-[10px] uppercase tracking-widest bg-white text-black px-3 py-1.5">
          Produk Terbaru
        </span>
        <Reveal className="absolute inset-0 flex flex-col items-center justify-end text-center pb-12 px-6">
          <h1 className="font-manrope font-extrabold text-4xl sm:text-6xl uppercase tracking-tight leading-[0.95] text-balance">
            {data.productName}
          </h1>
        </Reveal>
      </div>

      <Reveal delayMs={100} className="max-w-xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-white/60 mb-6">{data.tagline}</p>
        <div className="flex items-baseline justify-center gap-3 mb-8">
          {data.originalPrice ? <span className="text-sm text-white/40 line-through">{formatRupiah(data.originalPrice)}</span> : null}
          <span className="font-manrope font-extrabold text-3xl">{formatRupiah(data.promoPrice) || "Rp 0"}</span>
        </div>

        {activeHighlights.length > 0 && (
          <div className={`grid gap-px bg-white/15 mb-8 ${activeHighlights.length === 1 ? "grid-cols-1" : activeHighlights.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {activeHighlights.map((h, i) => (
              <div key={i} className="bg-black py-5 px-3">
                <p className="text-xs font-manrope font-bold uppercase tracking-wide">{h}</p>
              </div>
            ))}
          </div>
        )}

        <a href={waLink} target="_blank" rel="noopener noreferrer" className="block bg-white text-black font-manrope font-extrabold text-sm uppercase tracking-wide py-4 hover:bg-white/90 transition-colors">
          💬 Chat via WhatsApp
        </a>
        <div className="mt-5">
          <StoreLink storeSlug={data.storeSlug} className="text-xs font-manrope font-bold uppercase tracking-wide text-white border-b border-white" />
        </div>
      </Reveal>

      {data.showWatermark && (
        <div className="border-t border-white/15 px-6 py-6 text-center">
          <p className="text-[11px] text-white/50 uppercase tracking-wide">Powered by <span className="font-manrope font-bold text-white">Pajangin</span></p>
        </div>
      )}
    </div>
  );
}

const LAYOUTS: Record<StoreStyleId, (props: { data: EtalaseData }) => React.JSX.Element> = {
  klasik: Klasik,
  hangat: Hangat,
  minimalis: Minimalis,
  elegan: Elegan,
  bold: Bold,
};

export function EtalasePage({
  data,
  style,
  isOwner = false,
}: {
  data: EtalaseData;
  style: StoreStyleId;
  isOwner?: boolean;
}) {
  const Layout = LAYOUTS[style] ?? Klasik;
  return (
    <>
      {isOwner && <OwnerPreviewBanner />}
      <div className={isOwner ? "pt-9" : undefined}>
        <Layout data={data} />
      </div>
    </>
  );
}
