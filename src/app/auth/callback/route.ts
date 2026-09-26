import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureTrialStarted } from "@/lib/trial";
import { safeNextPath } from "@/lib/validators";

// Supabase mengarahkan ke sini setelah Google OAuth berhasil,
// atau setelah user klik link verifikasi email.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    // Akun baru langsung dapat trial Founderku Pro (sekali seumur akun).
    if (data.user) await ensureTrialStarted(data.user.id);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
