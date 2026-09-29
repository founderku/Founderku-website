"use client";

// Isian tambahan editor Pajangin: jenis halaman (produk, jasa, lainnya)
// dan pilihan tampil di Etalase Social Space.

export type PageKind = "produk" | "jasa" | "lainnya";

export const KIND_LABEL: Record<PageKind, string> = { produk: "Produk", jasa: "Jasa", lainnya: "Lainnya" };

export function PageKindSelect({ value, onChange }: { value: PageKind; onChange: (v: PageKind) => void }) {
  return (
    <div>
      <label className="block text-xs font-manrope font-bold uppercase tracking-wide text-text-soft mb-1.5">
        Jenis halaman
      </label>
      <div className="flex gap-2" role="group" aria-label="Jenis halaman">
        {(Object.keys(KIND_LABEL) as PageKind[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={value === k}
            onClick={() => onChange(k)}
            className={`flex-1 border rounded-xl px-3 py-2.5 text-sm font-manrope font-bold transition-colors ${
              value === k ? "bg-ink text-white border-transparent" : "border-border text-text-soft"
            }`}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-text-faint mt-1">
        Jasa cocok untuk desain, les, foto, servis, dan sejenisnya. Lainnya untuk kelas, sewa, atau yang lain.
      </p>
    </div>
  );
}

export function PriceExtras({
  askPrice,
  onAskPrice,
  unit,
  onUnit,
}: {
  askPrice: boolean;
  onAskPrice: (v: boolean) => void;
  unit: string;
  onUnit: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm text-text-soft">
        <input type="checkbox" checked={askPrice} onChange={(e) => onAskPrice(e.target.checked)} />
        Tanpa harga, tampilkan &quot;Tanya harga&quot;
      </label>
      {!askPrice && (
        <div>
          <label className="block text-xs font-manrope font-bold uppercase tracking-wide text-text-soft mb-1.5">
            Satuan harga (boleh dikosongkan)
          </label>
          <input
            className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
            placeholder="/jam, /proyek, /porsi"
            maxLength={20}
            value={unit}
            onChange={(e) => onUnit(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

export function SocialToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 border border-border rounded-2xl p-4 cursor-pointer">
      <input type="checkbox" className="mt-1" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm">
        <span className="font-manrope font-bold block">Tampilkan di Social Space</span>
        <span className="text-text-soft text-xs block mt-0.5">
          Halaman ini ikut tampil di Etalase Social Space supaya dilihat pengguna Founderku lain. Pembeli
          menghubungimu langsung lewat WhatsApp. Founderku tidak memproses pembayaran.
        </span>
      </span>
    </label>
  );
}
