// Nama panggilan buat sapaan "Hai, ...".
// Urutan: nama dari form daftar / Google, lalu bagian depan email.
export function displayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): string {
  const meta = user.user_metadata ?? {};
  const raw =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.given_name === "string" && meta.given_name) ||
    "";
  const first = raw.trim().split(/\s+/)[0];
  if (first) return first.slice(0, 24);
  const local = (user.email ?? "").split("@")[0].replace(/[._\-+0-9]+/g, " ").trim().split(/\s+/)[0] ?? "";
  if (!local) return "";
  return (local.charAt(0).toUpperCase() + local.slice(1)).slice(0, 24);
}
