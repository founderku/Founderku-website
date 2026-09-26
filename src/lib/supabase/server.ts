import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Dipakai di server component, server action, atau route handler.
// Tetap pakai anon key (bukan service_role), supaya RLS tetap berlaku
// sesuai user yang sedang login.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Bisa diabaikan kalau dipanggil dari Server Component murni
            // (bukan Server Action/Route Handler) - middleware yang
            // menangani refresh session di kasus itu.
          }
        },
      },
    }
  );
}
