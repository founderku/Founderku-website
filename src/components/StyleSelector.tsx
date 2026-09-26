"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pill } from "@/components/ui/Pill";
import { STORE_STYLE_LIST } from "@/lib/storeStyles";
import type { StoreStyleId } from "@/lib/types";

export function StyleSelector({
  userId,
  currentStyle,
}: {
  userId: string;
  currentStyle: StoreStyleId;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<StoreStyleId>(currentStyle);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setErrorMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ store_style: selected })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setErrorMsg("Gagal menyimpan: " + error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {STORE_STYLE_LIST.map((preset) => {
          const isSelected = selected === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setSelected(preset.id);
                setSaved(false);
                setErrorMsg(null);
              }}
              className={`text-left rounded-[24px] overflow-hidden transition-all bg-white ${
                isSelected
                  ? "ring-2 ring-indigo"
                  : "ring-1 ring-border hover:-translate-y-0.5"
              }`}
            >
              {/* Preview beneran dari halaman asli (bukan kartu mini) -
                  di-scale kecil di dalam iframe biar keliatan proporsi
                  seluruh halaman, bukan cuma satu elemen. */}
              <div className="relative w-full h-48 overflow-hidden bg-bg-soft pointer-events-none">
                <iframe
                  src={`/pajangin/dashboard/style/preview/${preset.id}?embed=1`}
                  title={`Preview ${preset.label}`}
                  className="absolute top-0 left-0 border-0"
                  style={{
                    width: "400%",
                    height: "400%",
                    transform: "scale(0.25)",
                    transformOrigin: "top left",
                  }}
                  scrolling="no"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="font-manrope font-extrabold text-sm">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-manrope font-bold text-indigo bg-indigo/10 px-2 py-0.5 rounded-full">
                      Terpilih
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-soft mt-1">{preset.blurb}</p>
                <p className="text-[11px] text-text-faint mt-1">
                  {preset.cocokUntuk}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Pill
          variant="solid-dark"
          onClick={handleSave}
          disabled={saving || selected === currentStyle}
        >
          {saving ? "Menyimpan..." : "Simpan Style Ini"}
        </Pill>
        {saved && (
          <p className="text-sm text-indigo">
            Tersimpan. Semua halaman produk kamu langsung ikut style baru.
          </p>
        )}
        {errorMsg && <p className="text-sm text-coral">{errorMsg}</p>}
      </div>
    </div>
  );
}
