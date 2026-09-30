import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EtalasePage, type EtalaseData } from "@/components/etalase/EtalasePage";
import { TokoPage } from "@/components/etalase/TokoPage";
import { STORE_STYLES } from "@/lib/storeStyles";
import type { PageRow, StoreProfile, StoreStyleId } from "@/lib/types";

// Data contoh untuk penjual yang belum punya halaman
const DEMO_PAGES: PageRow[] = [
  ["pastel", "Pastel Isi Sayur & Telur", "Kulit renyah, isi padat, digoreng dadakan tiap pesanan.", 30000, 24000, "/ isi 10", "p16", "produk"],
  ["mie", "Mie Goreng Rumahan", "Bumbu racikan sendiri, porsi kenyang.", null, 15000, "", "p11", "produk"],
  ["rambutan", "Rambutan Binjai 1 kg", "Manis, ngelotok, dipetik pagi hari.", 28000, 22000, "/ kg", "p13", "produk"],
  ["batik", "Kain Batik Tulis", "Dibuat tangan, motif asli pesisir.", null, null, "", "p02", "produk"],
  ["kelas", "Kelas Membatik Pemula", "2 jam praktik langsung, bahan sudah termasuk.", 150000, 120000, "/ orang", "p07", "jasa"],
].map(([slug, name, tagline, orig, promo, unit, img, kind], i) => ({
  id: `demo-${i}`,
  user_id: "demo",
  slug: String(slug),
  product_name: String(name),
  tagline: String(tagline),
  original_price: orig as number | null,
  promo_price: promo as number | null,
  price_unit: String(unit),
  highlights: ["Tanpa pengawet", "Bisa pesan versi frozen", "Gratis sambal cabai rawit"],
  image_url: `/pajangin-assets/photos/${img}.jpg`,
  whatsapp_number: "081200000000",
  kind: kind as PageRow["kind"],
  status: "active",
  click_count: 0,
  created_at: "",
  updated_at: "",
}));

function toEtalase(p: PageRow, storeSlug: string | null, watermark: boolean): EtalaseData {
  return {
    productName: p.product_name,
    tagline: p.tagline ?? "",
    originalPrice: p.original_price,
    promoPrice: p.promo_price,
    priceUnit: p.price_unit ?? "",
    highlights: p.highlights ?? [],
    imageUrl: p.image_url,
    whatsappNumber: p.whatsapp_number,
    showWatermark: watermark,
    storeSlug,
    kind: p.kind ?? "produk",
  };
}

export default async function StylePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ styleId: string }>;
  searchParams: Promise<{ embed?: string; view?: string }>;
}) {
  const { styleId } = await params;
  const { embed, view } = await searchParams;
  if (!(styleId in STORE_STYLES)) notFound();
  const style = styleId as StoreStyleId;
  const isEmbed = embed === "1";
  const isToko = view === "toko";

  // Kalau penjual sudah login dan punya halaman, preview memakai data
  // miliknya sendiri. Kalau belum, pakai data contoh.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let pages: PageRow[] = [];
  let storeSlug: string | null = null;
  let isPro = false;
  if (user) {
    const [{ data: rows }, { data: owner }] = await Promise.all([
      supabase
        .from("pages")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(12)
        .returns<PageRow[]>(),
      supabase.rpc("get_store_profile_by_id", { lookup_id: user.id }),
    ]);
    pages = rows ?? [];
    const prof = (owner as StoreProfile[] | null)?.[0];
    storeSlug = prof?.store_slug ?? null;
    isPro = !!prof?.has_pro;
  }
  const usingDemo = pages.length === 0;
  if (usingDemo) {
    pages = DEMO_PAGES;
    storeSlug = "dapur-bu-sari";
    isPro = false;
  }

  const content = isToko ? (
    <TokoPage style={style} preview data={{ storeSlug: storeSlug ?? "tokomu", isPro, products: pages }} />
  ) : (
    <EtalasePage style={style} preview data={toEtalase(pages.find((p) => p.image_url) ?? pages[0], storeSlug, !isPro)} />
  );

  if (isEmbed) {
    // Dipakai di dalam bingkai HP di halaman pilih style. Tombol di dalamnya
    // dimatikan supaya jadi tampilan saja.
    return <div className="pointer-events-none select-none">{content}</div>;
  }

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-40 bg-ink text-white text-center py-2.5 px-4 text-xs font-manrope font-semibold flex items-center justify-center gap-3">
        <span>
          Pratinjau style &quot;{STORE_STYLES[style].label}&quot;{usingDemo ? " pakai data contoh" : " pakai data tokomu"}.
        </span>
        <Link href="/pajangin/dashboard/style" className="underline font-bold whitespace-nowrap">
          Kembali pilih style
        </Link>
      </div>
      <div className="pt-9">{content}</div>
    </div>
  );
}
