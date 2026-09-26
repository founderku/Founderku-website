import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccessStatus, type AccessStatus } from "@/lib/access";
import { ensureTrialStarted } from "@/lib/trial";
import type { Profile } from "@/lib/types";

// Ambil akun yang lagi login + status aksesnya. Kalau belum login,
// langsung dilempar ke /masuk. Sekalian mulai trial kalau akun ini
// belum pernah dapat (misal login pakai email+password, yang gak lewat
// /auth/callback).
export async function requireAccount(nextPath: string): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
  profile: Profile | null;
  access: AccessStatus;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/masuk?next=" + encodeURIComponent(nextPath));

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (profile && !profile.trial_ends_at) {
    await ensureTrialStarted(user.id);
    ({ data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single<Profile>());
  }

  return { supabase, user, profile, access: getAccessStatus(profile) };
}
