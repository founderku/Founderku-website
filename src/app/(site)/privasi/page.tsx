import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalContact,
  LegalLayout,
  LegalSection,
  legalLinkClass,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Kebijakan Privasi · Founderku",
  description:
    "Cara Founderku mengumpulkan, memakai, menyimpan, dan melindungi data kamu di akun Founderku, Pajangin, dan tools Founderku.",
};

// Kebijakan Privasi resmi Founderku (berlaku untuk akun Founderku,
// Pajangin, 5 tools, dan Founderku Pro). Kalau cara kerja sistem berubah
// (misal ada data baru yang disimpan), halaman ini WAJIB ikut diubah.
const NAMA_PT = (
  <span className="font-semibold text-ink">
    PT Talenthra Karya Nusantara (NIB: 0909250086011)
  </span>
);

const b = "text-ink";

export default function PrivasiPage() {
  return (
    <LegalLayout title="Kebijakan Privasi" updatedAt="26 September 2026" active="privasi">
      <p className="text-sm text-text-soft leading-relaxed">
        Kebijakan Privasi ini menjelaskan bagaimana Founderku (&quot;kami&quot;),
        yang dikelola oleh {NAMA_PT}, mengumpulkan, menggunakan, menyimpan,
        dan melindungi data pribadi Anda (&quot;Anda&quot;,
        &quot;Pengguna&quot;) saat menggunakan founderku.com, termasuk akun
        Founderku, Pajangin, tools Founderku (Notain, Pajakin, Kontrakin,
        Jalanin, Sehatin), dan paket Founderku Pro (&quot;Layanan&quot;).
        Kebijakan ini disusun mengikuti Undang-Undang Nomor 27 Tahun 2022
        tentang Pelindungan Data Pribadi (UU PDP).
      </p>

      <LegalSection title="1. Data yang Kami Kumpulkan">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className={b}>Data akun:</strong> alamat email, nama
            panggilan, dan kata sandi (disimpan dalam bentuk terenkripsi satu
            arah). Jika Anda masuk lewat Google, kami menerima nama, alamat
            email, dan foto profil dari akun Google Anda.
          </li>
          <li>
            <strong className={b}>Status paket:</strong> tanggal mulai dan
            berakhirnya trial serta masa aktif Founderku Pro.
          </li>
          <li>
            <strong className={b}>Data Pajangin:</strong> nama toko dan alamat
            halaman, nama produk, tagline, harga, keunggulan produk, foto
            produk, dan nomor WhatsApp yang Anda cantumkan. Data ini memang
            ditujukan untuk tampil publik di halaman jualan Anda.
          </li>
          <li>
            <strong className={b}>Data tools Founderku</strong> (lihat bagian
            2 untuk tempat penyimpanannya): info usaha, nama dan alamat
            pembeli, daftar barang, dan nomor invoice (Notain); nama, alamat,
            jabatan, nomor KTP/NPWP para pihak, dan isi perjanjian
            (Kontrakin); angka omzet (Pajakin); progress checklist (Jalanin);
            dan jawaban kuesioner (Sehatin).
          </li>
          <li>
            <strong className={b}>Data pembayaran langganan:</strong> paket
            yang dipilih, nominal, status, dan nomor tagihan dari Xendit.
            Kami <strong className={b}>tidak menerima dan tidak
            menyimpan</strong> nomor kartu, data rekening, atau data
            pembayaran sensitif lain. Semua itu diproses langsung oleh Xendit.
          </li>
          <li>
            <strong className={b}>Data teknis:</strong> untuk penghitung klik
            halaman Pajangin, alamat IP pengunjung diubah dulu menjadi kode
            acak satu arah (hash) sebelum disimpan, dan hanya dipakai untuk
            mencegah satu pengunjung terhitung berkali-kali. Penyedia hosting
            kami juga mencatat log server standar (seperti alamat IP dan jenis
            browser) untuk keamanan dan perbaikan gangguan.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Di Mana Data Tools Disimpan">
        <p>Tools Founderku bisa dipakai tanpa akun. Tempat penyimpanan datanya:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className={b}>Tanpa login, atau login tanpa trial/Pro
            aktif:</strong> data hanya tersimpan di browser perangkat Anda
            (penyimpanan lokal browser) dan <strong className={b}>tidak
            dikirim</strong> ke server kami.
          </li>
          <li>
            <strong className={b}>Login dengan trial atau Pro aktif:</strong>{" "}
            data juga disimpan di akun Anda di server kami, supaya bisa dibuka
            dari perangkat lain. Status penyimpanannya selalu terlihat di bar
            atas setiap tool.
          </li>
          <li>
            Data di browser bisa dilihat siapa pun yang memakai browser yang
            sama. Di perangkat bersama, sebaiknya keluar dari akun setelah
            selesai. Saat Anda keluar, data tools milik akun Anda otomatis
            dibersihkan dari browser tersebut.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Data Orang Lain yang Anda Masukkan">
        <p>
          Sebagian tools meminta data orang lain, misalnya nama dan alamat
          pembeli di invoice atau nomor KTP pihak dalam perjanjian. Untuk data
          ini, Anda yang menentukan tujuan penggunaannya, dan Anda
          bertanggung jawab memastikan Anda berhak memakai data tersebut.
          Kami hanya menyimpannya untuk Anda: kami tidak menghubungi orang
          tersebut, tidak membagikan datanya, dan tidak memakainya untuk
          tujuan lain.
        </p>
      </LegalSection>

      <LegalSection title="4. Tujuan Penggunaan Data">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Menjalankan Layanan: akun, halaman jualan Pajangin, tools, dan penyimpanan ke akun.</li>
          <li>Verifikasi akun (kode verifikasi lewat email) dan pencegahan penyalahgunaan.</li>
          <li>Memproses pembayaran Founderku Pro dan mencatat masa aktifnya.</li>
          <li>Mengirim email terkait akun Anda, misalnya kode verifikasi atau pemberitahuan penting tentang akun dan halaman Anda.</li>
          <li>Memantau performa Layanan secara keseluruhan (tidak untuk mengenali Anda secara pribadi ke pihak luar).</li>
        </ul>
        <p>
          Kami <strong className={b}>tidak menjual</strong> data pribadi
          Anda, tidak memakai isi data tools Anda untuk iklan, dan tidak
          membacanya kecuali diperlukan untuk menangani laporan masalah dari
          Anda atau diwajibkan hukum.
        </p>
      </LegalSection>

      <LegalSection title="5. Penyedia Layanan dan Lokasi Data">
        <p>Kami memakai penyedia berikut untuk menjalankan Layanan:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong className={b}>Supabase</strong>: database, sistem login, dan penyimpanan foto. Server di Singapura.</li>
          <li><strong className={b}>Vercel</strong>: hosting situs dan server aplikasi. Server utama di Singapura.</li>
          <li><strong className={b}>Xendit</strong>: pemrosesan pembayaran langganan.</li>
          <li><strong className={b}>Resend</strong>: pengiriman email seperti kode verifikasi.</li>
          <li><strong className={b}>Google</strong>: login dengan Google (jika Anda memilihnya) dan penyediaan huruf (font) di halaman.</li>
        </ul>
        <p>
          Karena sebagian server berada di luar Indonesia, data Anda dapat
          diproses di luar wilayah Indonesia. Kami memilih penyedia yang
          menerapkan standar pelindungan data yang memadai, sesuai ketentuan
          UU PDP. Kami juga dapat membuka data jika diwajibkan oleh hukum yang
          berlaku.
        </p>
      </LegalSection>

      <LegalSection title="6. Keamanan Data">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Setiap akun hanya bisa membaca dan mengubah datanya sendiri. Aturan ini dijalankan langsung di database, bukan hanya di tampilan.</li>
          <li>Status paket (trial dan Pro) tidak bisa diubah dari browser, hanya oleh sistem kami di server.</li>
          <li>Semua koneksi memakai HTTPS (terenkripsi).</li>
          <li>Kata sandi disimpan dalam bentuk terenkripsi satu arah, tidak pernah sebagai teks biasa.</li>
          <li>Foto produk disimpan dengan nama file acak supaya tidak bisa ditebak.</li>
          <li>Kunci akses server tidak pernah ditaruh di kode yang bisa dilihat publik.</li>
        </ul>
        <p>
          Tidak ada sistem yang 100% aman. Jika terjadi kebocoran data yang
          menyangkut data Anda, kami akan memberi tahu Anda sesuai ketentuan
          UU PDP.
        </p>
      </LegalSection>

      <LegalSection title="7. Berapa Lama Data Disimpan">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Data akun dan data yang Anda simpan di akun disimpan selama akun Anda ada.</li>
          <li>
            Saat trial atau Pro berakhir, data tools yang sudah tersimpan di
            akun <strong className={b}>tidak dihapus</strong>. Anda tetap bisa
            membuka dan menghapusnya, tetapi perubahan baru hanya tersimpan di
            browser sampai Pro aktif lagi. Halaman Pajangin di atas batas Free
            dikunci (disembunyikan), bukan dihapus.
          </li>
          <li>
            Saat Anda menghapus akun, kami menghapus profil, halaman jualan,
            foto produk, riwayat pembayaran di sistem kami, dan data tools
            Anda. Catatan transaksi di Xendit tetap disimpan oleh Xendit
            sesuai kebijakan dan kewajiban hukum mereka.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Hak Anda sebagai Pemilik Data">
        <p>Sesuai UU PDP, Anda berhak untuk:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong className={b}>Mengakses</strong> data Anda. Sebagian besar data bisa langsung Anda lihat di halaman <Link href="/akun" className={legalLinkClass}>Akun</Link>, dashboard Pajangin, dan di setiap tool.</li>
          <li><strong className={b}>Memperbaiki</strong> data, misalnya mengubah nama di halaman Akun atau mengedit halaman jualan.</li>
          <li><strong className={b}>Menghapus</strong> data: lewat tombol reset/hapus di setiap tool, menghapus halaman jualan, atau menghapus akun sepenuhnya di halaman Akun.</li>
          <li><strong className={b}>Meminta salinan</strong> data Anda dalam format yang umum dipakai, lewat kontak di bawah.</li>
          <li><strong className={b}>Menarik persetujuan</strong> penggunaan data tertentu, dengan konsekuensi sebagian Layanan mungkin tidak bisa berfungsi.</li>
        </ul>
        <p>Permintaan lewat kontak kami tanggapi paling lambat 3 x 24 jam sesuai ketentuan UU PDP.</p>
      </LegalSection>

      <LegalSection title="9. Cookie dan Penyimpanan Browser">
        <p>Kami hanya memakai penyimpanan browser yang diperlukan agar Layanan berjalan:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Cookie login, supaya Anda tetap masuk.</li>
          <li>Pilihan tema terang/gelap.</li>
          <li>Data tools dan catatan sinkronisasinya (lihat bagian 2).</li>
        </ul>
        <p>
          Kami <strong className={b}>tidak memakai</strong> pixel iklan atau
          pelacak pihak ketiga (seperti Meta Pixel atau TikTok Pixel).
        </p>
      </LegalSection>

      <LegalSection title="10. Program di Katalog">
        <p>
          Program di katalog Founderku dapat memakai formulir pendaftaran
          dari pihak lain (misalnya Google Form). Data yang Anda isi di sana
          diproses oleh penyelenggara program dan penyedia formulir tersebut,
          sesuai kebijakan mereka masing-masing.
        </p>
      </LegalSection>

      <LegalSection title="11. Anak di Bawah Umur">
        <p>
          Layanan ditujukan untuk pelaku usaha dan tidak ditujukan untuk anak
          di bawah 17 tahun tanpa pendampingan orang tua atau wali.
        </p>
      </LegalSection>

      <LegalSection title="12. Perubahan Kebijakan">
        <p>
          Kami dapat memperbarui Kebijakan Privasi ini. Perubahan penting
          akan kami informasikan lewat email atau pemberitahuan di situs
          sebelum berlaku.
        </p>
      </LegalSection>

      <LegalSection title="13. Kontak">
        <p>
          Pertanyaan atau permintaan terkait data pribadi dapat diajukan lewat{" "}
          <LegalContact />.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
