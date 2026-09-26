import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRICING } from "@/lib/pricing";

// Mulai trial Founderku Pro buat akun ini, kalau belum pernah.
// Dipanggil tiap kali user masuk (callback login dan halaman akun),
// tapi fungsi database start_trial cuma ngisi SEKALI seumur akun, jadi
// aman dipanggil berkali-kali. Lama trial ikut data/pricing.json
// (bisa diubah di admin panel, berlaku buat akun baru).
export async function ensureTrialStarted(userId: string): Promise<void> {
  if (!PRICING.trialDays || PRICING.trialDays <= 0) return;
  const admin = createAdminClient();
  const { error } = await admin.rpc("start_trial", {
    uid: userId,
    trial_days: PRICING.trialDays,
  });
  if (error) console.error("start_trial gagal:", error.message);
}
