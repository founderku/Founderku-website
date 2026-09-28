import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TOOL_IDS } from "@/lib/tools/registry";

// Hitung kunjungan tool (untuk tab Dashboard di admin panel). Dipanggil
// halaman tool sekali per tab per hari. Yang disimpan cuma angka per tool
// per hari (tabel tool_views): tanpa akun, IP, cookie, atau data pribadi.
const kosong = () => new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });

// Mesin pencari dan bot lain tidak ikut dihitung
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|monitor/i;

export async function POST(req: NextRequest) {
  // Tolak kiriman dari situs lain
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get("host")) return kosong();
    } catch {
      return kosong();
    }
  }
  if (BOT.test(req.headers.get("user-agent") || "")) return kosong();

  let tool: unknown;
  try {
    tool = ((await req.json()) as { tool?: unknown }).tool;
  } catch {
    return kosong();
  }
  // Hanya id tool yang memang ada
  if (typeof tool !== "string" || !(TOOL_IDS as readonly string[]).includes(tool)) return kosong();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return kosong();

  try {
    await createAdminClient().rpc("track_tool_view", { p_tool: tool });
  } catch {
    // Gagal mencatat tidak boleh mengganggu pengunjung
  }
  return kosong();
}
