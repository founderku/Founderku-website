import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessStatus } from "@/lib/access";
import { AI_LIMIT, aiAktif, bersihkanPesan, instruksiSistem, tanyaGemini, type Lang } from "@/lib/ai";

// Asisten AI Founderku. Hanya untuk user yang login, dengan jatah harian
// (tabel ai_usage, cuma jumlah pemakaian). Isi percakapan tidak disimpan.
export const maxDuration = 30;

const noStore = { "Cache-Control": "private, no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

async function jatah(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase.from("profiles").select("trial_ends_at, pro_expires_at").eq("id", userId).single();
  const akses = getAccessStatus(profile);
  return { limit: akses.hasPro ? AI_LIMIT.pro : AI_LIMIT.free, plan: akses.hasPro ? "pro" : "free" };
}

function hariIniWIB(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

// Status untuk tombol chat: aktif atau tidak, sudah login, sisa jatah
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ enabled: aiAktif(), loggedIn: false });
  const { limit, plan } = await jatah(supabase, user.id);
  const { data } = await supabase.from("ai_usage").select("count").eq("user_id", user.id).eq("day", hariIniWIB()).maybeSingle();
  const used = data?.count ?? 0;
  return json({ enabled: aiAktif(), loggedIn: true, plan, limit, used, remaining: Math.max(0, limit - used) });
}

export async function POST(req: NextRequest) {
  // Tolak kiriman dari situs lain
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return json({ error: "asal_tidak_sah" }, 403);
  if (!aiAktif()) return json({ error: "belum_aktif" }, 503);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "belum_login" }, 401);

  let body: { messages?: unknown; lang?: unknown; page?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "isi_tidak_sah" }, 400);
  }
  const pesan = bersihkanPesan(body.messages);
  if (!pesan) return json({ error: "isi_tidak_sah" }, 400);
  const lang: Lang = body.lang === "en" || body.lang === "tr" ? body.lang : "id";
  const halaman = typeof body.page === "string" && body.page.startsWith("/") ? body.page : "/";

  const { limit } = await jatah(supabase, user.id);
  const admin = createAdminClient();
  const { data: sisa, error } = await admin.rpc("ai_take_quota", { uid: user.id, batas: limit });
  if (error) return json({ error: "gagal" }, 500);
  if (typeof sisa !== "number" || sisa < 0) return json({ error: "jatah_habis", limit, remaining: 0 }, 429);

  const hasil = await tanyaGemini(pesan, instruksiSistem(lang, halaman));
  if (!hasil.ok) {
    // AI gagal menjawab: jatah dikembalikan
    await admin.rpc("ai_refund_quota", { uid: user.id });
    return json({ error: hasil.alasan, remaining: sisa + 1, limit }, hasil.alasan === "diblokir" ? 422 : 503);
  }
  return json({ text: hasil.text, remaining: sisa, limit });
}
