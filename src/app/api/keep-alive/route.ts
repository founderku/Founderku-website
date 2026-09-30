import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Penjaga supaya database Supabase (paket gratis) tidak "tidur" karena
// sepi. Dipanggil otomatis oleh Vercel sekali sehari (lihat vercel.json).
// Isinya cuma membaca 1 baris dengan kunci publik (anon), jadi tidak
// menyimpan, mengubah, atau mengembalikan data apa pun.
const jawab = (ok: boolean, status = 200) =>
  NextResponse.json({ ok }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req: NextRequest) {
  // Kalau CRON_SECRET diisi di Vercel, hanya jadwal Vercel yang boleh
  // memanggil (Vercel otomatis mengirim kunci ini di header).
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return jawab(false, 401);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return jawab(false, 500);

  const supabase = createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await supabase.from("pages").select("id").limit(1);
  return jawab(!error, error ? 502 : 200);
}
