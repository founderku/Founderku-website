import type { NextConfig } from "next";

// Alamat Supabase (dipakai browser buat login & simpan data)
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();
const supabaseWs = supabaseOrigin.replace(/^http/, "ws");

// Content Security Policy: daftar sumber yang BOLEH dimuat/dihubungi
// browser di situs ini. Kalau suatu saat ada celah yang bikin kode asing
// ikut jalan, kode itu tetap gak bisa kirim data ke server lain, gak bisa
// memuat skrip dari luar, dan situs gak bisa ditaruh di iframe web lain.
// ('unsafe-inline' masih perlu karena halaman statis & Next.js memakai
// skrip di dalam halaman.)
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs} https://api.github.com https://*.workers.dev`,
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Paksa browser selalu pakai HTTPS ke situs ini (1 tahun)
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  // Cegah browser "nebak-nebak" tipe file (mitigasi sebagian serangan
  // XSS lewat file yang di-upload user, misal foto produk).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Cegah situs Pajangin ditaruh di dalam <iframe> web LAIN (mitigasi
  // clickjacking). SAMEORIGIN (bukan DENY) supaya preview style di
  // /dashboard/style tetap bisa jalan - itu sengaja nge-iframe halaman
  // Pajangin sendiri buat nampilin preview.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Batasi info yang dikirim browser ke situs lain pas orang klik link
  // keluar dari Pajangin (misal ke WhatsApp).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Matikan akses ke kamera/mikrofon/lokasi browser dari halaman Pajangin
  // secara default - situs ini gak butuh itu sama sekali.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Jangan umumkan mesin situs (header "x-powered-by: Next.js")
  poweredByHeader: false,
  // Halaman-halaman situs founderku.com (index.html, tools.html, dst) masih
  // berupa file HTML statis di folder public/. Next.js otomatis nyajiin
  // /tools.html dll, tapi alamat "/" perlu diarahkan manual ke index.html.
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
  },
  async redirects() {
    return [
      // Alamat lama Pajangin, jaga-jaga kalau ada yang nyimpen link-nya.
      { source: "/login", destination: "/masuk", permanent: true },
      { source: "/register", destination: "/daftar", permanent: true },
      { source: "/dashboard/:path*", destination: "/pajangin/dashboard/:path*", permanent: true },
      { source: "/beranda", destination: "/pajangin", permanent: true },
      // Daftar tools ada di halaman statis tools.html
      { source: "/tools", destination: "/tools.html", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
