"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pill } from "@/components/ui/Pill";
import { STORE_STYLE_LIST, STORE_STYLES } from "@/lib/storeStyles";
import type { StoreStyleId } from "@/lib/types";

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 150;
}

// Pilih style toko. Pratinjau di kanan adalah halaman asli (produk atau
// toko) yang dirender dengan style terpilih dan data milik penjual, jadi
// yang terlihat di sini sama dengan yang dilihat pembeli setelah disimpan.
export function StyleSelector({
  userId,
  currentStyle,
  storeSlug,
}: {
  userId: string;
  currentStyle: StoreStyleId;
  storeSlug: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<StoreStyleId>(currentStyle);
  const [applied, setApplied] = useState<StoreStyleId>(currentStyle);
  const [view, setView] = useState<"produk" | "toko">("produk");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const preset = STORE_STYLES[selected];
  const previewUrl = `/pajangin/dashboard/style/preview/${selected}?view=${view}`;

  async function handleSave() {
    setSaving(true);
    setErrorMsg(null);
    const { error } = await createClient()
      .from("profiles")
      .update({ store_style: selected })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setErrorMsg("Gagal menyimpan: " + error.message);
      return;
    }
    setApplied(selected);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-x-8 gap-y-6 items-start lg:grid-rows-[auto_1fr]">
      <div className="order-1 lg:col-start-1 lg:row-start-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STORE_STYLE_LIST.map((p) => {
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelected(p.id);
                  setSaved(false);
                  setErrorMsg(null);
                }}
                className={`text-left rounded-[18px] overflow-hidden bg-white transition-all ${
                  isSelected ? "ring-2 ring-indigo -translate-y-0.5 shadow-lg" : "ring-1 ring-border hover:-translate-y-0.5"
                }`}
              >
                <div className="relative h-20 flex" style={{ background: p.swatch[0] }}>
                  <span className="absolute left-3 top-3 w-9 h-9 rounded-full" style={{ background: p.swatch[1] }} />
                  <span className="absolute left-9 top-7 w-9 h-9 rounded-full ring-2 ring-white/70" style={{ background: p.swatch[2] }} />
                  <span
                    className="absolute right-3 bottom-2 font-manrope font-extrabold text-2xl"
                    style={{ color: isLight(p.swatch[0]) ? p.swatch[2] : "#ffffff" }}
                  >
                    Aa
                  </span>
                  {p.isNew && (
                    <span className="absolute right-2 top-2 text-[10px] font-manrope font-extrabold bg-coral text-white px-2 py-0.5 rounded-full">
                      Baru
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-manrope font-extrabold text-sm">{p.label}</span>
                    {applied === p.id && (
                      <span className="text-[10px] font-manrope font-bold text-indigo bg-indigo/10 px-1.5 py-0.5 rounded-full">
                        Dipakai
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-text-faint mt-0.5 leading-snug">{p.cocokUntuk}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
        <div className="rounded-2xl ring-1 ring-border bg-white p-5">
          <p className="font-manrope font-extrabold text-lg">{preset.label}</p>
          <p className="text-sm text-text-soft mt-1">{preset.blurb}</p>
          <p className="text-xs text-text-faint mt-1">{preset.cocokUntuk}</p>
          <p className="text-xs text-text-soft mt-4">
            Semua style sudah termasuk: label hemat otomatis saat ada harga promo, tombol WhatsApp yang
            selalu terlihat di bawah layar, langkah cara pesan, dan tombol bagikan.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Pill variant="solid-dark" onClick={handleSave} disabled={saving || selected === applied}>
              {saving ? "Menyimpan..." : selected === applied ? "Style ini sedang dipakai" : `Pakai style ${preset.label}`}
            </Pill>
            {saved && (
              <p className="text-sm text-indigo">
                Tersimpan. Semua halamanmu langsung memakai style {STORE_STYLES[applied].label}.
                {storeSlug && (
                  <>
                    {" "}
                    <Link href={`/toko/${storeSlug}`} className="underline font-bold">
                      Lihat tokomu
                    </Link>
                  </>
                )}
              </p>
            )}
            {errorMsg && <p className="text-sm text-coral">{errorMsg}</p>}
          </div>
        </div>
      </div>

      <div className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6">
        <div className="flex justify-center gap-1 mb-3 p-1 rounded-full bg-bg-soft ring-1 ring-border w-fit mx-auto" role="group" aria-label="Jenis pratinjau">
          {(["produk", "toko"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-full text-xs font-manrope font-bold transition-colors ${
                view === v ? "bg-ink text-white" : "text-text-soft"
              }`}
            >
              {v === "produk" ? "Halaman produk" : "Halaman toko"}
            </button>
          ))}
        </div>
        <div className="mx-auto w-full max-w-[360px] rounded-[40px] bg-[#14131f] p-2.5 shadow-[0_30px_60px_-30px_rgba(20,19,31,0.45)]">
          <iframe
            key={previewUrl}
            src={`${previewUrl}&embed=1`}
            title={`Pratinjau style ${preset.label}`}
            className="block w-full rounded-[32px] border-0 bg-white"
            style={{ height: 640 }}
          />
        </div>
        <p className="text-center text-xs text-text-soft mt-3">
          Geser di dalam layar untuk melihat seluruh halaman.{" "}
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">
            Buka layar penuh
          </a>
        </p>
      </div>
    </div>
  );
}
