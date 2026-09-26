"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hapusDataToolLokal } from "@/lib/tools/cloud";
import { Pill } from "@/components/ui/Pill";

const CONFIRM_WORD = "HAPUS";

export function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setErrorMsg(null);

    const res = await fetch("/api/account/delete", { method: "POST" });
    const result = await res.json();

    if (!res.ok) {
      setLoading(false);
      setErrorMsg(result.error ?? "Gagal menghapus akun. Coba lagi.");
      return;
    }

    // Akunnya udah kehapus di server, sesi lokal juga dibersihin biar
    // gak nyisa token yang udah gak valid, terus balik ke landing page.
    const supabase = createClient();
    await supabase.auth.signOut();
    hapusDataToolLokal();
    // "/" itu halaman statis (bukan halaman Next.js), jadi pakai reload penuh.
    window.location.assign("/");
  }

  return (
    <div className="border border-coral/30 bg-coral/5 rounded-2xl p-6">
      <h2 className="font-manrope font-extrabold text-base text-coral mb-1.5">
        Hapus Akun
      </h2>
      <p className="text-sm text-text-soft mb-4">
        Ini akan menghapus akun kamu, semua halaman produk, foto, dan data
        lain terkait secara <strong>permanen</strong>. Tidak bisa
        dibatalkan setelah ini dilakukan.
      </p>

      {!showConfirm ? (
        <Pill
          variant="outline"
          onClick={() => setShowConfirm(true)}
          className="border-coral text-coral hover:bg-coral/10"
        >
          Hapus Akun Saya
        </Pill>
      ) : (
        <div>
          <p className="text-xs text-text-soft mb-2">
            Ketik <span className="font-manrope font-bold">{CONFIRM_WORD}</span>{" "}
            di kolom ini buat konfirmasi:
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm mb-3"
            placeholder={CONFIRM_WORD}
          />
          {errorMsg && (
            <p className="text-xs text-coral mb-3">{errorMsg}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={confirmText !== CONFIRM_WORD || loading}
              className="bg-coral text-white font-manrope font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Menghapus..." : "Hapus Permanen Sekarang"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
                setErrorMsg(null);
              }}
              className="text-xs text-text-faint"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
