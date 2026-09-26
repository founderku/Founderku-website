import Link from "next/link";
import { toWhatsAppLink } from "@/lib/validators";
import { STORE_STYLES } from "@/lib/storeStyles";
import type { StoreStyleId } from "@/lib/types";

export interface StoreProductTileData {
  slug: string;
  productName: string;
  tagline?: string | null;
  promoPrice: number | null;
  originalPrice: number | null;
  highlights?: string[] | null;
  imageUrl: string | null;
  whatsappNumber: string;
}

function formatRupiah(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "";
  return "Rp " + value.toLocaleString("id-ID");
}

// Kartu ringkas buat grid halaman toko. Beda dari ProductCard (Golden
// Template) yang dipakai di halaman produk penuh - ini versi mini, cuma
// nampilin info penting biar orang bisa cepat lihat-lihat banyak produk
// sekaligus, baru klik buat lihat detail lengkap di halaman produknya.
// Ikutin style yang sama kayak ProductCard biar 1 toko konsisten.
export function StoreProductTile({
  data,
  style = "klasik",
}: {
  data: StoreProductTileData;
  style?: StoreStyleId;
}) {
  const s = STORE_STYLES[style];
  const waMessage = `Halo! Saya mau pesan ${data.productName} (${formatRupiah(
    data.promoPrice
  )}) dari web. Apakah stok masih ada?`;
  const waLink = data.whatsappNumber
    ? toWhatsAppLink(data.whatsappNumber, waMessage)
    : "#";

  return (
    <div className={`${s.card} overflow-hidden`}>
      <Link href={`/l/${data.slug}`} className="block">
        <div
          className={`relative w-full aspect-square bg-gradient-to-br from-amber to-coral flex items-center justify-center ${s.photoWrap}`}
        >
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt={data.productName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="text-white/85 text-xs font-manrope font-semibold">
              Foto produk
            </span>
          )}
          {/* Harga ditaruh sebagai badge di atas foto - biar kartu grid
              kerasa lebih "berisi" dan konsisten sama kesan visual
              Golden Template, bukan cuma foto polos + teks di bawah. */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-2.5">
            <p className="font-manrope font-extrabold text-sm text-white drop-shadow">
              {formatRupiah(data.promoPrice) || "Rp 0"}
            </p>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/l/${data.slug}`}>
          <h3 className={`${s.name} line-clamp-1`}>{data.productName}</h3>
        </Link>

        {data.tagline && (
          <p className={`${s.tagline} line-clamp-1 mt-1`}>{data.tagline}</p>
        )}

        {data.originalPrice ? (
          <p className={`${s.priceOld} mt-2`}>
            {formatRupiah(data.originalPrice)}
          </p>
        ) : null}

        {data.highlights && data.highlights.filter((h) => h.trim()).length > 0 && (
          <ul className="text-xs space-y-1 mt-2 mb-1">
            {data.highlights
              .filter((h) => h.trim().length > 0)
              .slice(0, 2)
              .map((h, i) => (
                <li key={i} className="flex gap-1.5 text-text-soft line-clamp-1">
                  <span className={`${s.highlightCheck} font-bold flex-shrink-0`}>
                    ✓
                  </span>
                  {h}
                </li>
              ))}
          </ul>
        )}

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 flex items-center justify-center gap-2 text-sm py-3 transition-transform hover:-translate-y-0.5 ${s.cta}`}
        >
          💬 Chat
        </a>
      </div>
    </div>
  );
}
