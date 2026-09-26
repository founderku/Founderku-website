"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isValidSlugFormat, isSlugBlocked } from "@/lib/validators";

type Status = "idle" | "checking" | "ok" | "taken" | "invalid" | "same";

export function StoreSlugEditor({
  userId,
  currentStoreSlug,
}: {
  userId: string;
  currentStoreSlug: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentStoreSlug ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const checkAvailability = useCallback(
    async (slug: string) => {
      if (!slug || slug === currentStoreSlug) {
        setStatus(slug === currentStoreSlug && slug ? "same" : "idle");
        return;
      }
      if (!isValidSlugFormat(slug)) {
        setStatus("invalid");
        return;
      }
      if (isSlugBlocked(slug)) {
        setStatus("taken");
        return;
      }
      setStatus("checking");
      const supabase = createClient();
      const { data } = await supabase.rpc("get_store_profile_by_slug", {
        lookup_store_slug: slug,
      });
      setStatus(data && data.length > 0 ? "taken" : "ok");
    },
    [currentStoreSlug]
  );

  useEffect(() => {
    const timeout = setTimeout(() => checkAvailability(value), 400);
    return () => clearTimeout(timeout);
  }, [value, checkAvailability]);

  async function handleSave() {
    if (status !== "ok") return;
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ store_slug: value })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setSaveError("Gagal menyimpan. Coba lagi.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  const statusText: Record<Status, string | null> = {
    idle: null,
    checking: "Mengecek ketersediaan...",
    ok: "Tersedia, siap disimpan.",
    same: null,
    taken: "Sudah dipakai atau kata terlarang, coba yang lain.",
    invalid: "Cuma huruf kecil, angka, tanda hubung. Minimal 3 karakter.",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1.5">
        <span className="text-sm text-text-soft whitespace-nowrap">
          <span className="hidden sm:inline">founderku.com/toko/</span>
          <span className="sm:hidden">…/toko/</span>
        </span>
        <div className="flex items-center gap-1.5">
          <input
            className="flex-1 min-w-0 border border-border rounded-xl px-3.5 py-2.5 text-sm"
            value={value}
            onChange={(e) => {
              setSaved(false);
              setValue(e.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            placeholder="nama-toko-kamu"
          />
          <button
            onClick={handleSave}
            disabled={status !== "ok" || saving}
            className={`whitespace-nowrap font-manrope font-bold text-sm px-5 py-2.5 rounded-2xl transition-all ${
              status === "ok" && !saving
                ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                : "bg-bg-soft text-text-faint cursor-not-allowed"
            }`}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
      {statusText[status] && (
        <p
          className={`text-xs mt-1.5 ${
            status === "ok" ? "text-indigo" : "text-text-faint"
          }`}
        >
          {statusText[status]}
        </p>
      )}
      {saveError && <p className="text-xs text-coral mt-1.5">{saveError}</p>}
      {saved && (
        <p className="text-xs text-indigo mt-1.5">
          Tersimpan. Halaman toko kamu sekarang aktif di alamat di atas.
        </p>
      )}
    </div>
  );
}
