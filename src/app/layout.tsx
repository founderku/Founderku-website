import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Founderku",
  description: "Satu akun buat semua tools Founderku, termasuk Pajangin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <html lang="id" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        {/* Buka koneksi ke Supabase lebih awal (sebelum request beneran
            dikirim), biar handshake-nya udah kelar duluan pas halaman
            butuh data - lumayan mempercepat load pertama form/dashboard. */}
        {supabaseUrl && (
          <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
        )}
      </head>
      <body className="min-h-screen bg-white text-ink font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
