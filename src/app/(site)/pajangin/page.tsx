import { LandingPage } from "@/components/LandingPage";
import { createClient } from "@/lib/supabase/server";

// Beda dari "/" (yang otomatis lempar user yang udah login ke dashboard),
// halaman ini SELALU nampilin landing page - dipakai sebagai tujuan tiap
// logo Pajangin/Founderku di dalam aplikasi (dashboard, form, halaman
// publik produk/toko), biar user yang udah login tetap bisa balik lihat
// landing page tanpa kelempar otomatis ke dashboard.
//
// Tetap ngecek status login: kalau user udah login, CTA di nav & sticky
// box berubah jadi "Lihat Toko" (bukan "Masuk"/"Daftar Gratis" yang
// bikin bingung seolah-olah belum login).
export default async function BerandaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingPage isLoggedIn={!!user} />;
}
