import { OwnerPreviewBanner } from "@/components/OwnerPreviewBanner";
import { StoreProductTile } from "@/components/StoreProductTile";
import { Reveal } from "@/components/ui/Reveal";
import type { PageRow, StoreStyleId } from "@/lib/types";

export interface TokoData {
  storeSlug: string;
  isPro: boolean;
  products: PageRow[];
}

function toTileData(p: PageRow) {
  return {
    slug: p.slug,
    productName: p.product_name,
    tagline: p.tagline,
    promoPrice: p.promo_price,
    originalPrice: p.original_price,
    highlights: p.highlights,
    imageUrl: p.image_url,
    whatsappNumber: p.whatsapp_number,
  };
}

function Empty() {
  return (
    <p className="text-center text-text-soft py-16">
      Toko ini belum punya produk aktif saat ini. Coba lagi lain waktu.
    </p>
  );
}

function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/pajangin-assets/logo.jpeg"
      alt="Pajangin"
      className="absolute top-6 left-6 z-20 w-8 h-8 rounded-xl"
    />
  );
}

// ============================================================
// KLASIK
// ============================================================
function Klasik({ data }: { data: TokoData }) {
  return (
    <div className="min-h-screen bg-bg-soft">
      <div className="relative bg-ink px-6 pt-14 pb-16 sm:pt-20 sm:pb-20 text-center">
        <Logo />
        <Reveal className="max-w-2xl mx-auto">
          <span className="inline-block font-manrope font-bold text-xs uppercase tracking-widest text-amber mb-5">
            Etalase Digital
          </span>
          <h1 className="font-manrope font-extrabold text-4xl sm:text-5xl tracking-tight text-white text-balance leading-[1.05]">
            {data.storeSlug}
          </h1>
          <p className="mt-5 text-lg text-ink-soft">
            {data.products.length > 0 ? `${data.products.length} produk tersedia` : "Belum ada produk aktif"}
          </p>
        </Reveal>
      </div>
      <div className="px-6 py-14">
        {data.products.length === 0 ? (
          <Empty />
        ) : (
          <Reveal className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-5">
            {data.products.map((p) => (
              <StoreProductTile key={p.id} style="klasik" data={toTileData(p)} />
            ))}
          </Reveal>
        )}
      </div>
      {!data.isPro && (
        <div className="bg-ink px-6 py-8 text-center">
          <p className="text-sm text-ink-faint">Powered by <span className="font-manrope font-bold text-white">Pajangin</span></p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// HANGAT - editorial cafe (ref: Lambert)
// ============================================================
function Hangat({ data }: { data: TokoData }) {
  const heroPhoto = data.products.find((p) => p.image_url)?.image_url;
  return (
    <div className="min-h-screen bg-[#F5EEE3]">
      <div className="relative w-full h-[45vh] min-h-[280px] overflow-hidden">
        {heroPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroPhoto} alt={data.storeSlug} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#3E2A1E] to-[#8B5A2B]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a120c]/85 via-[#1a120c]/25 to-[#1a120c]/40" />
        <Logo />
        <Reveal className="absolute inset-0 flex flex-col items-center justify-end text-center pb-10 px-6">
          <span className="font-manrope font-bold text-[11px] uppercase tracking-[0.25em] text-[#E8C89A] mb-3">
            Selamat Datang di
          </span>
          <h1 className="font-manrope font-bold text-4xl sm:text-5xl text-white text-balance">
            {data.storeSlug}
          </h1>
        </Reveal>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-center font-manrope font-bold text-xs uppercase tracking-[0.2em] text-[#8B5A2B] mb-10">
          Menu Kami
        </h2>
        {data.products.length === 0 ? (
          <Empty />
        ) : (
          <Reveal className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {data.products.map((p) => (
              <StoreProductTile key={p.id} style="hangat" data={toTileData(p)} />
            ))}
          </Reveal>
        )}
      </div>

      {!data.isPro && (
        <div className="bg-[#3E2A1E] px-6 py-6 text-center">
          <p className="text-xs text-[#E8C89A]/70">Powered by <span className="font-manrope font-bold text-white">Pajangin</span></p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MINIMALIS - clean shop (ref: Saudagar)
// ============================================================
function Minimalis({ data }: { data: TokoData }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative border-b border-[#E4E8E1] px-6 py-5 flex items-center justify-center">
        <Logo />
        <span className="font-manrope font-extrabold text-lg tracking-wide text-[#3D4A3D] uppercase">
          {data.storeSlug}
        </span>
      </div>
      <div className="bg-[#EFEDE3] px-6 py-10 text-center">
        <p className="text-sm text-[#5C7A5C] font-manrope font-semibold">
          {data.products.length > 0 ? `${data.products.length} produk tersedia` : "Belum ada produk aktif"}
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-14">
        {data.products.length === 0 ? (
          <Empty />
        ) : (
          <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.products.map((p) => (
              <StoreProductTile key={p.id} style="minimalis" data={toTileData(p)} />
            ))}
          </Reveal>
        )}
      </div>
      {!data.isPro && (
        <div className="border-t border-[#E4E8E1] px-6 py-5 text-center">
          <p className="text-[11px] text-[#8B978B]">Powered by <span className="font-manrope font-bold text-[#1F291F]">Pajangin</span></p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ELEGAN - boutique pastel (ref: Elzatta)
// ============================================================
function Elegan({ data }: { data: TokoData }) {
  return (
    <div className="min-h-screen bg-[#FBF3F1]">
      <div className="relative px-6 pt-10 pb-8 text-center">
        <Logo />
        <span className="font-manrope font-semibold text-[10px] uppercase tracking-[0.3em] text-[#9C6B7A]">
          Koleksi Kami
        </span>
        <h1 className="font-manrope font-semibold text-3xl sm:text-4xl tracking-tight text-[#5C3A45] mt-2">
          {data.storeSlug}
        </h1>
      </div>
      <div className="max-w-5xl mx-auto px-6 pb-14">
        {data.products.length === 0 ? (
          <Empty />
        ) : (
          <Reveal className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {data.products.map((p) => (
              <StoreProductTile key={p.id} style="elegan" data={toTileData(p)} />
            ))}
          </Reveal>
        )}
      </div>
      {!data.isPro && (
        <div className="px-6 py-6 text-center">
          <p className="text-[11px] text-[#B594A0]">Powered by <span className="font-manrope font-bold text-[#5C3A45]">Pajangin</span></p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// BOLD - editorial streetwear (ref: Aurum)
// ============================================================
function Bold({ data }: { data: TokoData }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative border-b border-white/15 px-6 py-12 text-center">
        <Logo />
        <h1 className="font-manrope font-extrabold text-4xl sm:text-6xl uppercase tracking-tight">
          {data.storeSlug}
        </h1>
        <p className="text-white/50 text-sm mt-3">
          {data.products.length > 0 ? `${data.products.length} produk tersedia` : "Belum ada produk aktif"}
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-14">
        {data.products.length === 0 ? (
          <p className="text-center text-white/50 py-16">Toko ini belum punya produk aktif saat ini.</p>
        ) : (
          <Reveal className="grid grid-cols-2 md:grid-cols-3 gap-px">
            {data.products.map((p) => (
              <div key={p.id} className="bg-black p-3 border border-white/15">
                <StoreProductTile style="bold" data={toTileData(p)} />
              </div>
            ))}
          </Reveal>
        )}
      </div>
      {!data.isPro && (
        <div className="border-t border-white/15 px-6 py-6 text-center">
          <p className="text-[11px] text-white/50 uppercase tracking-wide">Powered by <span className="font-manrope font-bold text-white">Pajangin</span></p>
        </div>
      )}
    </div>
  );
}

const LAYOUTS: Record<StoreStyleId, (props: { data: TokoData }) => React.JSX.Element> = {
  klasik: Klasik,
  hangat: Hangat,
  minimalis: Minimalis,
  elegan: Elegan,
  bold: Bold,
};

export function TokoPage({
  data,
  style,
  isOwner = false,
}: {
  data: TokoData;
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
