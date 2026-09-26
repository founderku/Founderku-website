"use client";

import { useState } from "react";
import { PRICING, formatRupiah, periodSuffix } from "@/lib/pricing";

export function UpgradePlanPicker() {
  const prices = PRICING.prices;
  const [selected, setSelected] = useState<string>(prices[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const selectedPrice = prices.find((p) => p.id === selected);

  async function handleUpgrade() {
    if (!selectedPrice) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // Cuma kirim id pilihan. Nominalnya ditentukan server dari
      // data/pricing.json, bukan dari browser.
      const res = await fetch("/api/xendit/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: selectedPrice.id }),
      });
      const result = await res.json();

      if (!res.ok) {
        setLoading(false);
        setErrorMsg(result.error ?? "Gagal membuat pembayaran. Coba lagi.");
        return;
      }

      // Redirect ke halaman pembayaran Xendit (hosted, di luar Founderku)
      window.location.assign(result.url);
    } catch {
      setLoading(false);
      setErrorMsg("Gagal terhubung ke server. Coba lagi.");
    }
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {prices.map((price) => {
          const isSelected = selected === price.id;
          return (
            <button
              key={price.id}
              onClick={() => setSelected(price.id)}
              className={`text-left rounded-2xl p-5 border-2 transition-all ${
                isSelected
                  ? "border-amber bg-amber/5"
                  : "border-border bg-white hover:border-ink/20"
              }`}
            >
              <p className="font-manrope font-bold text-sm mb-1">
                {price.label.id}
                {price.note?.id && (
                  <span className="ml-2 text-[10px] glass-amber text-ink px-2 py-0.5 rounded-full">
                    {price.note.id}
                  </span>
                )}
              </p>
              <p className="font-manrope font-extrabold text-2xl">
                {formatRupiah(price.amount)}
                <span className="text-xs font-normal text-text-faint">
                  {periodSuffix(price.days)}
                </span>
              </p>
            </button>
          );
        })}
      </div>

      {errorMsg && <p className="text-sm text-coral mb-4">{errorMsg}</p>}

      <button
        onClick={handleUpgrade}
        disabled={loading || !selectedPrice}
        className="w-full bg-amber text-ink font-manrope font-bold text-sm py-3.5 rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading
          ? "Menyiapkan pembayaran..."
          : selectedPrice
          ? `Bayar ${formatRupiah(selectedPrice.amount)}`
          : "Pilih paket"}
      </button>
      <p className="text-[11px] text-text-faint text-center mt-3">
        Kamu akan diarahkan ke halaman pembayaran aman dari Xendit. Bayar
        sekali per periode, tidak ada tagihan otomatis.
      </p>
    </div>
  );
}
