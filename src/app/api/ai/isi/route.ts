import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessStatus } from "@/lib/access";
import { AI_LIMIT, aiAktif, tanyaAI } from "@/lib/ai";
import { IDE_MAKS, SPEK_AI, bacaJawaban, instruksiIsi } from "@/lib/aiIsi";

// "Isi draf dengan AI" di tools. Khusus trial/Pro (dicek di server), memakai
// jatah AI harian yang sama dengan Asisten. Ide user tidak disimpan.
export const maxDuration = 40;

const noStore = { "Cache-Control": "private, no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return json({ error: "asal_tidak_sah" }, 403);
  if (!aiAktif()) return json({ error: "belum_aktif" }, 503);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "belum_login" }, 401);

  let body: { tool?: unknown; ide?: unknown; konteks?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "isi_tidak_sah" }, 400);
  }
  const tool = typeof body.tool === "string" ? body.tool : "";
  const spek = Object.prototype.hasOwnProperty.call(SPEK_AI, tool) ? SPEK_AI[tool] : null;
  const ide = typeof body.ide === "string" ? body.ide.trim().slice(0, IDE_MAKS) : "";
  if (!spek || ide.length < 10) return json({ error: "isi_tidak_sah" }, 400);
  // Konteks yang diizinkan: hanya pilihan model kanvas
  const konteks = { model: (body.konteks as { model?: unknown } | undefined)?.model === "bmc" ? "bmc" : "lean" };

  const { data: profile } = await supabase.from("profiles").select("trial_ends_at, pro_expires_at").eq("id", user.id).single();
  if (!getAccessStatus(profile).hasPro) return json({ error: "khusus_pro" }, 403);

  const admin = createAdminClient();
  const { data: sisa, error } = await admin.rpc("ai_take_quota", { uid: user.id, batas: AI_LIMIT.pro });
  if (error) return json({ error: "gagal" }, 500);
  if (typeof sisa !== "number" || sisa < 0) return json({ error: "jatah_habis", remaining: 0 }, 429);

  const hasil = await tanyaAI([{ role: "user", text: `Ide dari user:\n${ide}` }], instruksiIsi(spek, konteks), {
    maksToken: 2200,
    json: true,
  });
  const isi = hasil.ok ? bacaJawaban(hasil.text, spek, konteks) : null;
  if (!isi) {
    // AI gagal atau jawabannya tidak bisa dipakai: jatah dikembalikan
    await admin.rpc("ai_refund_quota", { uid: user.id });
    const alasan = hasil.ok ? "gagal" : hasil.alasan;
    return json({ error: alasan, remaining: sisa + 1 }, alasan === "diblokir" ? 422 : 503);
  }
  return json({ isi, remaining: sisa });
}
