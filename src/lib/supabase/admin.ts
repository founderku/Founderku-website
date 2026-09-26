import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// PENTING: file ini pakai kunci service_role, yang bisa lewatin semua
// RLS. Import "server-only" di baris atas bikin build ERROR kalau ada
// yang gak sengaja import file ini dari client component - itu
// pengaman biar kunci rahasia ini gak pernah ke-bundle ke kode yang
// jalan di browser.
//
// Cuma dipakai buat operasi yang emang butuh akses penuh, misalnya
// hapus akun user (butuh hapus baris auth.users lewat Admin API, yang
// gak bisa dilakuin user biasa lewat anon key).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
