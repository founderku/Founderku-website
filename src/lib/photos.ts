// Bantu hapus foto produk lama di bucket product-photos (milik sendiri).
// Dipakai saat foto diganti atau halaman dihapus, supaya kuota foto akun
// (60 file, lihat migration 018) tidak habis oleh foto yang tak terpakai.

import type { SupabaseClient } from "@supabase/supabase-js";

const PENANDA = "/storage/v1/object/public/product-photos/";

export function pathFotoMilik(url: string | null | undefined, userId: string): string | null {
  if (!url) return null;
  const i = url.indexOf(PENANDA);
  if (i < 0) return null;
  const path = decodeURIComponent(url.slice(i + PENANDA.length).split("?")[0]);
  return path.startsWith(`${userId}/`) && !path.includes("..") ? path : null;
}

// Gagal hapus tidak menghentikan proses (foto lama hanya jadi sampah kecil)
export async function hapusFotoLama(supabase: SupabaseClient, url: string | null | undefined, userId: string) {
  const path = pathFotoMilik(url, userId);
  if (!path) return;
  try {
    await supabase.storage.from("product-photos").remove([path]);
  } catch {
    // abaikan
  }
}
