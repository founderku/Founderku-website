import { AnimatedBackdrop } from "@/components/AnimatedBackdrop";

// Latar halaman dashboard Pajangin. Sekarang sama dengan halaman akun:
// warna lembut yang bergerak pelan, ikut mode terang/gelap (lihat
// .fk-app dan .fk-backdrop di globals.css). Prop `variant` dari versi
// lama masih diterima (tapi gak dipakai lagi) supaya pemanggil lama gak
// perlu diubah.
export function PageBackdrop({}: { variant?: "dashboard" | "form" | "style" }) {
  return <AnimatedBackdrop />;
}
