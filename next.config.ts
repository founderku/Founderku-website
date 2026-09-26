import type { NextConfig } from "next";

const securityHeaders = [
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
