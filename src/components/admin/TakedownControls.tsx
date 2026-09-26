"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pill } from "@/components/ui/Pill";

export function TakedownControls({
  pageId,
  status,
}: {
  pageId: string;
  status: "active" | "locked" | "taken_down";
}) {
  const router = useRouter();
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleTakedown() {
    if (!reason.trim()) {
      setErrorMsg("Alasan wajib diisi.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const supabase = createClient();

    // Catat alasan + ubah status sekaligus (1 transaksi) lewat fungsi
    // database yang cuma bisa dipakai admin.
    const { error } = await supabase.rpc("admin_set_page_status", {
      target_page_id: pageId,
      new_status: "taken_down",
      takedown_reason: reason.trim(),
    });

    setLoading(false);
    if (error) {
      setErrorMsg("Gagal: " + error.message);
      return;
    }

    setShowReasonBox(false);
    setReason("");
    router.refresh();
  }

  async function handleRestore() {
    const confirmed = window.confirm(
      "Pulihkan halaman ini jadi aktif lagi?"
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_page_status", {
      target_page_id: pageId,
      new_status: "active",
    });

    setLoading(false);
    if (error) {
      setErrorMsg("Gagal: " + error.message);
      return;
    }
    router.refresh();
  }

  if (status === "taken_down") {
    return (
      <div>
        <Pill variant="outline" onClick={handleRestore} disabled={loading}>
          {loading ? "Memproses..." : "Pulihkan"}
        </Pill>
        {errorMsg && <p className="text-xs text-coral mt-1">{errorMsg}</p>}
      </div>
    );
  }

  if (showReasonBox) {
    return (
      <div className="w-64">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Alasan diturunkan (akan dilihat pemilik halaman)"
          className="w-full border border-border rounded-xl px-3 py-2 text-xs mb-2"
          rows={3}
        />
        <div className="flex items-center gap-2">
          <Pill
            variant="solid-dark"
            onClick={handleTakedown}
            disabled={loading}
            className="text-xs"
          >
            {loading ? "Memproses..." : "Konfirmasi Turunkan"}
          </Pill>
          <button
            onClick={() => {
              setShowReasonBox(false);
              setErrorMsg(null);
            }}
            className="text-xs text-text-faint"
          >
            Batal
          </button>
        </div>
        {errorMsg && <p className="text-xs text-coral mt-1">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <Pill variant="outline" onClick={() => setShowReasonBox(true)}>
      Turunkan
    </Pill>
  );
}
