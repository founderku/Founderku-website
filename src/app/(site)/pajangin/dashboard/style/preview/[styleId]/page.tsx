import { notFound } from "next/navigation";
import Link from "next/link";
import { EtalasePage } from "@/components/etalase/EtalasePage";
import { STORE_STYLES } from "@/lib/storeStyles";
import type { StoreStyleId } from "@/lib/types";

const DEMO_DATA = {
  productName: "Kopi Susu Gula Aren",
  tagline: "Kopi susu premium, dibuat fresh tiap hari pakai gula aren asli.",
  originalPrice: 12000,
  promoPrice: 8000,
  highlights: ["Gula aren asli", "Bisa request less sugar", "Kirim same-day"],
  imageUrl: "/pajangin-assets/photos/p11.jpg",
  whatsappNumber: "081200000000",
  showWatermark: true,
  storeSlug: "contoh-toko",
};

export default async function StylePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ styleId: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { styleId } = await params;
  const { embed } = await searchParams;
  const isEmbed = embed === "1";

  if (!(styleId in STORE_STYLES)) notFound();

  if (isEmbed) {
    // Mode embed: dipakai di dalam iframe kecil (kartu pilihan style),
    // tanpa banner/link, dan interaksi dimatiin biar cuma jadi preview
    // visual, bukan halaman yang bisa dipencet-pencet di dalam kartu.
    return (
      <div className="pointer-events-none select-none">
        <EtalasePage style={styleId as StoreStyleId} data={DEMO_DATA} />
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-40 bg-ink text-white text-center py-2.5 px-4 text-xs font-manrope font-semibold flex items-center justify-center gap-3">
        <span>Ini pratinjau style &quot;{STORE_STYLES[styleId as StoreStyleId].label}&quot; pakai data contoh.</span>
        <Link href="/pajangin/dashboard/style" className="underline font-bold whitespace-nowrap">
          ← Kembali Pilih Style
        </Link>
      </div>
      <div className="pt-9">
        <EtalasePage style={styleId as StoreStyleId} data={DEMO_DATA} />
      </div>
    </div>
  );
}
