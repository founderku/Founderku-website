import { createBrowserClient } from "@supabase/ssr";

// Dipakai di komponen yang jalan di browser (client component).
// Pakai anon key saja, aman ditaruh di browser karena akses datanya
// tetap dibatasi oleh Row Level Security (RLS) di Supabase.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
