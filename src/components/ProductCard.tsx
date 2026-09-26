import { toWhatsAppLink } from "@/lib/validators";
import { STORE_STYLES } from "@/lib/storeStyles";
import type { StoreStyleId } from "@/lib/types";

export interface ProductCardData {
  productName: string;
  tagline: string;
  originalPrice: number | null;
  promoPrice: number | null;
  highlights: string[];
  imageUrl: string | null;
  whatsappNumber: string;
  showWatermark: boolean;
}

function formatRupiah(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "";
  return "Rp " + value.toLocaleString("id-ID");
}

// Ini komponen "Golden Template" yang sudah disepakati: satu layout
// baku yang otomatis rapi, dipakai di preview form editor DAN di
// halaman publik founderku.com/l/[slug]. Tampilannya bisa
// disesuaikan lewat prop `style` (lihat src/lib/storeStyles.ts), yang
// dipilih user di halaman "Edit Style Tokomu".
export function ProductCard({
  data,
  style = "klasik",
}: {
  data: ProductCardData;
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
    <div
      className={`${s.card} overflow-hidden shadow-[0_30px_60px_-30px_rgba(20,19,31,0.22)]`}
    >
      {/* Foto produk jadi elemen utama - ukuran dominan, bukan sekadar aksen */}
      <div
        className={`relative w-full aspect-[4/3] bg-gradient-to-br from-amber to-coral flex items-center justify-center ${s.photoWrap}`}
      >
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.imageUrl}
            alt={data.productName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="text-white/85 text-sm font-manrope font-semibold">
            Foto produk
          </span>
        )}
        {data.showWatermark && (
          <div
            className={`absolute bottom-3 right-3 text-[11px] font-manrope font-semibold px-3 py-1.5 rounded-lg z-10 backdrop-blur-sm ${s.watermark}`}
          >
            Powered by Pajangin
          </div>
        )}
      </div>

      <div className="p-7 sm:p-8">
        {s.eyebrow !== "hidden" && (
          <p className={`${s.eyebrow} mb-2`}>Etalase Digital</p>
        )}
        <h2 className={`${s.name} mb-2 text-balance`}>
          {data.productName || "Nama produk"}
        </h2>
        <p className={`${s.tagline} mb-6`}>
          {data.tagline || "Tagline singkat produk kamu"}
        </p>

        <div className="flex items-baseline gap-3 mb-6">
          {data.originalPrice ? (
            <span className={s.priceOld}>
              {formatRupiah(data.originalPrice)}
            </span>
          ) : null}
          <span className={s.priceNew}>
            {formatRupiah(data.promoPrice) || "Rp 0"}
          </span>
        </div>

        <hr className={`${s.divider} mb-6`} />

        <ul className="text-[15px] space-y-3 mb-2">
          {data.highlights
            .filter((h) => h.trim().length > 0)
            .map((h, i) => (
              <li key={i} className="flex gap-2.5 text-text-soft">
                <span className={`${s.highlightCheck} font-bold`}>✓</span>
                {h}
              </li>
            ))}
        </ul>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-6 flex items-center justify-center gap-2 text-base py-4 transition-transform hover:-translate-y-0.5 ${s.cta}`}
        >
          💬 Chat via WhatsApp
        </a>
      </div>
    </div>
  );
}
