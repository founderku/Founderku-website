import type { Profile } from "@/lib/types";

// Status akses akun Founderku. Aturannya SAMA dengan fungsi
// has_pro_access di supabase/schema.sql: Pro aktif kalau trial ATAU
// langganan berbayar masih berlaku.
export interface AccessStatus {
  hasPro: boolean;
  onTrial: boolean;
  isPaid: boolean;
  trialEndsAt: Date | null;
  proExpiresAt: Date | null;
  // Tanggal akses Pro berakhir (yang paling lama di antara trial/bayar)
  activeUntil: Date | null;
  daysLeft: number;
}

export function getAccessStatus(
  profile: Pick<Profile, "trial_ends_at" | "pro_expires_at"> | null,
  now: Date = new Date()
): AccessStatus {
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const proExpiresAt = profile?.pro_expires_at ? new Date(profile.pro_expires_at) : null;
  const isPaid = !!proExpiresAt && proExpiresAt > now;
  const onTrial = !isPaid && !!trialEndsAt && trialEndsAt > now;
  const hasPro = isPaid || onTrial;
  const activeUntil = isPaid ? proExpiresAt : onTrial ? trialEndsAt : null;
  const daysLeft = activeUntil
    ? Math.max(0, Math.ceil((activeUntil.getTime() - now.getTime()) / 86_400_000))
    : 0;
  return { hasPro, onTrial, isPaid, trialEndsAt, proExpiresAt, activeUntil, daysLeft };
}

export function formatTanggal(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

// Kalau akun gak punya akses Pro, cuma 2 halaman TERLAMA (yang gak
// di-takedown) yang tetap tayang. Sisanya "terkunci" sampai upgrade.
// Dipakai dashboard (nandain terkunci) dan halaman publik (nyembunyiin).
export function lockedPageIds(
  pages: { id: string; status: string; created_at: string }[],
  hasPro: boolean,
  freeLimit: number
): Set<string> {
  if (hasPro) return new Set();
  const live = pages
    .filter((p) => p.status !== "taken_down")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return new Set(live.slice(freeLimit).map((p) => p.id));
}
