import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Angka bisnis untuk tab Dashboard di admin panel (public/admin.html).
// Pakai sesi login user (bukan service_role): fungsi admin_stats() di
// database sendiri yang menolak akun yang bukan admin. Isinya cuma angka
// hitungan, tanpa email atau data pribadi.
const noStore = { "Cache-Control": "private, no-store" };

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "belum_login" }, { status: 401, headers: noStore });
  }

  const { data, error } = await supabase.rpc("admin_stats");
  if (error) {
    // 42501 = bukan admin (ditolak oleh fungsi database)
    const bukanAdmin = error.code === "42501";
    return NextResponse.json(
      { error: bukanAdmin ? "bukan_admin" : "gagal_memuat" },
      { status: bukanAdmin ? 403 : 500, headers: noStore },
    );
  }
  return NextResponse.json(data, { headers: noStore });
}
