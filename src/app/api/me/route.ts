import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { displayName } from "@/lib/names";

// Dipakai beranda statis (public/index.html) buat tahu pengunjung sudah
// login atau belum, supaya bisa nyapa "Hai, [nama]". Cuma ngasih nama
// panggilan, bukan email atau data lain.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = user
    ? { loggedIn: true, name: displayName(user) }
    : { loggedIn: false, name: null };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
