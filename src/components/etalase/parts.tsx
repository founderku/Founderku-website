import s from "./etalase.module.css";

// Potongan kecil yang dipakai halaman produk dan halaman toko.

export type PageKind = "produk" | "jasa" | "lainnya";

export function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.86 9.86 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

export function kindOf(kind: string | null | undefined): PageKind {
  return kind === "jasa" || kind === "lainnya" ? kind : "produk";
}

export const KIND_TEXT: Record<PageKind, { label: string; cta: string; short: string; steps: string; items: string }> = {
  produk: { label: "Produk", cta: "Pesan via WhatsApp", short: "Pesan", steps: "Cara pesan", items: "Produk" },
  jasa: { label: "Jasa", cta: "Booking via WhatsApp", short: "Booking", steps: "Cara booking", items: "Jasa" },
  lainnya: { label: "Spesial", cta: "Chat via WhatsApp", short: "Chat", steps: "Cara pesan", items: "Lainnya" },
};

export const STEPS: Record<PageKind, [string, string][]> = {
  produk: [
    ["Chat penjual", "Tekan tombol WhatsApp, pesan sudah terisi otomatis."],
    ["Sepakati pesanan", "Atur jumlah, pengiriman, dan pembayaran langsung dengan penjual."],
    ["Pesanan diterima", "Barang dikirim atau diambil sesuai kesepakatan."],
  ],
  jasa: [
    ["Ceritakan kebutuhanmu", "Tekan tombol WhatsApp dan jelaskan yang kamu perlukan."],
    ["Sepakati jadwal dan harga", "Atur detail pekerjaan langsung dengan penyedia jasa."],
    ["Jasa dikerjakan", "Pekerjaan dimulai sesuai jadwal yang disepakati."],
  ],
  lainnya: [
    ["Chat penjual", "Tekan tombol WhatsApp, pesan sudah terisi otomatis."],
    ["Sepakati detailnya", "Tanyakan dan atur semuanya langsung dengan penjual."],
    ["Selesai", "Transaksi berjalan sesuai kesepakatan kalian berdua."],
  ],
};

export function rupiah(value: number): string {
  return "Rp " + value.toLocaleString("id-ID");
}

// Diskon hanya ditampilkan kalau harga normal benar-benar lebih tinggi
// dari harga promo (data asli penjual, bukan angka karangan).
export function discountOf(original: number | null | undefined, promo: number | null | undefined) {
  if (!original || promo === null || promo === undefined || !(original > promo)) return null;
  const pct = Math.round(((original - promo) / original) * 100);
  if (pct < 1) return null;
  return { pct, amount: original - promo };
}

export function Photo({
  src,
  alt,
  discountPct,
  watermark = false,
  className = "",
  eager = false,
}: {
  src: string | null;
  alt: string;
  discountPct?: number | null;
  watermark?: boolean;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div className={`${s.photo} ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} />
      ) : (
        <span className={s.photoEmpty} aria-hidden="true">
          {(alt || "?").trim().charAt(0).toUpperCase()}
        </span>
      )}
      {discountPct ? <span className={s.badge}>Hemat {discountPct}%</span> : null}
      {watermark && <span className={s.watermark}>Powered by Pajangin</span>}
    </div>
  );
}
