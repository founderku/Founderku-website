import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

// Isi halaman ini adalah Kebijakan Privasi resmi Pajangin.
const NAMA_PT = (
  <span className="font-semibold">
    PT Talenthra Karya Nusantara (NIB: 0909250086011)
  </span>
);

export default function PrivasiPage() {
  return (
    <LegalLayout title="Kebijakan Privasi" updatedAt="29 Juli 2026">
      <p className="text-sm text-text-soft leading-relaxed -mt-4 mb-2">
        Kebijakan Privasi ini menjelaskan bagaimana Pajangin (&quot;kami&quot;,
        &quot;Layanan&quot;), sebuah produk dari {NAMA_PT}, mengumpulkan,
        menggunakan, menyimpan, dan melindungi data pribadi Anda
        (&quot;Anda&quot;, &quot;Pengguna&quot;) saat menggunakan layanan
        pembuatan halaman jualan digital di founderku.com.
        Kebijakan ini disusun mengikuti prinsip-prinsip Undang-Undang Nomor
        27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
      </p>

      <LegalSection title="1. Data yang Kami Kumpulkan">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-ink">Data akun:</strong> alamat email,
            kata sandi (dalam bentuk terenkripsi), atau data dari akun
            Google jika Anda mendaftar lewat Google OAuth.
          </li>
          <li>
            <strong className="text-ink">Data halaman jualan:</strong> nama
            produk, tagline, harga, foto produk, nomor WhatsApp yang Anda
            cantumkan.
          </li>
          <li>
            <strong className="text-ink">Data transaksi langganan:</strong>{" "}
            riwayat pembayaran Pro, status langganan (diproses lewat Xendit
            sebagai penyedia payment gateway).
          </li>
          <li>
            <strong className="text-ink">Data teknis otomatis:</strong>{" "}
            jumlah klik pada halaman Anda (untuk fitur counter di
            dashboard).
          </li>
        </ul>
        <p>
          Kami <strong className="text-ink">tidak mengumpulkan</strong> data
          kartu kredit/debit atau data pembayaran sensitif secara langsung -
          itu diproses oleh Xendit sebagai pihak ketiga yang memiliki
          kebijakan privasi sendiri.
        </p>
      </LegalSection>

      <LegalSection title="2. Tujuan Penggunaan Data">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Menyediakan dan menjalankan fitur Layanan (membuat, menampilkan, mengelola halaman jualan Anda).</li>
          <li>Verifikasi akun dan pencegahan penyalahgunaan (misalnya rate limiting saat pendaftaran).</li>
          <li>Memproses pembayaran langganan Pro dan menerbitkan invoice.</li>
          <li>Mengirim notifikasi terkait akun Anda (verifikasi email, status langganan, takedown halaman jika berlaku).</li>
          <li>Menganalisis performa Layanan secara agregat (bukan untuk mengidentifikasi Anda secara individu ke pihak luar).</li>
        </ul>
        <p>
          Kami <strong className="text-ink">tidak menjual</strong> data
          pribadi Anda ke pihak ketiga mana pun.
        </p>
      </LegalSection>

      <LegalSection title="3. Penyimpanan dan Keamanan Data">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Data disimpan menggunakan infrastruktur Supabase (database dan storage foto).</li>
          <li>Foto produk disimpan dengan nama file acak (bukan nama asli), untuk mencegah penebakan/pengaksesan foto pengguna lain.</li>
          <li>Kata sandi disimpan dalam bentuk terenkripsi (hashed), tidak pernah dalam bentuk teks biasa.</li>
          <li>Akses ke data sensitif backend (kunci service_role Supabase) dibatasi hanya untuk sistem server, tidak pernah ditempatkan di kode yang bisa diakses publik.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Hak Anda sebagai Pemilik Data">
        <p>Sesuai UU PDP, Anda berhak untuk:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong className="text-ink">Mengakses</strong> data pribadi yang kami simpan tentang Anda.</li>
          <li><strong className="text-ink">Meminta koreksi</strong> data yang tidak akurat.</li>
          <li>
            <strong className="text-ink">Meminta penghapusan permanen</strong>{" "}
            akun dan seluruh data terkait (bukan sekadar dinonaktifkan) -
            permintaan ini dapat diajukan lewat channel dukungan resmi kami.
          </li>
          <li>
            <strong className="text-ink">Menarik persetujuan</strong>{" "}
            penggunaan data tertentu, dengan konsekuensi Layanan mungkin
            tidak dapat berfungsi penuh.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Berbagi Data dengan Pihak Ketiga">
        <p>Kami membagikan data secara terbatas dengan:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong className="text-ink">Xendit</strong>, untuk memproses pembayaran langganan Pro.</li>
          <li><strong className="text-ink">Supabase</strong>, sebagai penyedia infrastruktur database dan penyimpanan.</li>
          <li>Pihak ketiga lain hanya jika diwajibkan oleh hukum yang berlaku.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Cookie dan Teknologi Pelacakan">
        <p>
          Layanan menggunakan cookie/session sederhana untuk keperluan login
          dan fungsi dasar. Versi awal (v1) tidak menggunakan pixel iklan
          pihak ketiga (Meta Pixel, TikTok Pixel, dll).
        </p>
      </LegalSection>

      <LegalSection title="7. Perubahan Kebijakan">
        <p>
          Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
          Perubahan signifikan akan diinformasikan lewat email atau
          notifikasi di dashboard.
        </p>
      </LegalSection>

      <LegalSection title="8. Kontak">
        <p>
          Pertanyaan terkait privasi data dapat diajukan lewat email{" "}
          <a href="mailto:founderku@gmail.com" className="text-indigo font-semibold">
            founderku@gmail.com
          </a>{" "}
          atau WhatsApp{" "}
          <a
            href="https://wa.me/6285710477257"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo font-semibold"
          >
            +62 857-1047-7257
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
