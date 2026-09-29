import { Bricolage_Grotesque, Fraunces, Space_Grotesk } from "next/font/google";

// Huruf judul khusus style toko. preload dimatikan supaya halaman lain
// tidak ikut mengunduh; huruf baru diunduh kalau style-nya dipakai.
const serif = Fraunces({
  variable: "--pj-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  preload: false,
});

const grotesk = Space_Grotesk({
  variable: "--pj-grotesk",
  subsets: ["latin"],
  preload: false,
});

const playful = Bricolage_Grotesque({
  variable: "--pj-playful",
  subsets: ["latin"],
  preload: false,
});

export const ETALASE_FONTS = `${serif.variable} ${grotesk.variable} ${playful.variable}`;
