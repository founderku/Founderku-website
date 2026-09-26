"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // "/" itu halaman statis (bukan halaman Next.js), jadi pakai reload penuh.
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
