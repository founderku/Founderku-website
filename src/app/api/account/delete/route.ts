import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  // Identifikasi user yang minta hapus akun lewat client biasa (respect
  // session/cookie dia) - jangan pernah percaya body request buat nentuin
  // user_id yang mau dihapus, itu bisa disalahgunain buat hapus akun
  // orang lain.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const admin = createAdminClient();

  // Hapus semua foto produk user ini di Storage dulu. Supabase Storage
  // TIDAK otomatis kehapus pas baris database-nya kehapus (beda dari
  // foreign key cascade), jadi harus dihapus manual di sini.
  const { data: files } = await admin.storage
    .from("product-photos")
    .list(user.id);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${user.id}/${f.name}`);
    await admin.storage.from("product-photos").remove(paths);
  }

  // Hapus akunnya. Ini otomatis nge-cascade hapus baris di profiles,
  // pages, subscriptions, takedowns - semua sudah didefinisikan
  // "on delete cascade" lewat foreign key di schema.sql, jadi cukup
  // hapus baris auth.users-nya aja lewat Admin API.
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
