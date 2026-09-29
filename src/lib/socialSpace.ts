import "server-only";
import { createClient } from "@/lib/supabase/server";

// Akun yang login (kalau ada) untuk halaman Social Space, plus status
// admin untuk menampilkan tab Moderasi. Aksesnya tetap dijaga database.
export async function getSsViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, isAdmin: false };
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return { userId: user.id, isAdmin: !!data?.is_admin };
}
