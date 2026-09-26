"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bersihkanSaatLogout } from "@/lib/tools/cloud";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // Data tools milik akun ini jangan ketinggalan di browser
    bersihkanSaatLogout();
    // "/" itu halaman statis (bukan halaman Next.js), jadi pakai reload penuh.
    // Sengaja muat ulang penuh: "/" halaman statis, dan sisa data sesi
    // di memori browser ikut hilang.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-xs font-manrope font-bold text-text-soft hover:text-coral transition-colors disabled:opacity-50"
    >
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}
