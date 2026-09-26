import type { Metadata } from "next";
import Link from "next/link";
import { LegalContact, LegalLayout, LegalSection, legalLinkClass } from "@/components/legal/LegalLayout";
import { PRICING, formatRupiah, periodSuffix } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan · Founderku",
  description:
    "Syarat & Ketentuan penggunaan akun Founderku, Pajangin, tools Founderku, dan Founderku Pro.",
};

// Syarat & Ketentuan resmi Founderku. Harga dan lama trial dibaca dari
// public/data/pricing.json (jangan tulis nominal langsung di sini).
const NAMA_PT = (
  <span className="font-semibold text-ink">
    PT Talenthra Karya Nusantara (NIB: 0909250086011)
  </span>
);

const b = "text-ink";

export default function SyaratPage() {
  const daftarHarga = PRICING.prices
    .map((p) => `${formatRupiah(p.amount)}${periodSuffix(p.days)}`)
    .join(" atau ");

  return (
    <LegalLayout title="Syarat & Ketentuan" updatedAt="26 September 2026" active="syarat">
      <p className="text-sm text-text-soft leading-relaxed">
        Dengan membuat akun atau menggunakan Layanan, Anda menyetujui Syarat
        &amp; Ketentuan ini dan{" "}
        <Link href="/privasi" className={legalLinkClass}>
          Kebijakan Privasi
        </Link>{" "}
        kami.
      </p>

      <LegalSection title="1. Tentang Layanan">
        <p>
          Founderku (&quot;kami&quot;) disediakan oleh {NAMA_PT}. Layanan di
          founderku.com (&quot;Layanan&quot;) meliputi:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong className={b}>Akun Founderku</strong>: satu akun untuk semua layanan Founderku.</li>
          <li><strong className={b}>Pajangin</strong>: pembuatan halaman jualan sederhana yang menghubungkan penjual dengan pembeli lewat WhatsApp.</li>
          <li><strong className={b}>Tools Founderku</strong>: Notain (invoice dan kwitansi), Pajakin (simulasi PPh Final UMKM), Kontrakin (surat perjanjian), Jalanin (roadmap usaha), dan Sehatin (cek kesehatan bisnis).</li>
          <li><strong className={b}>{PRICING.planName}</strong>: paket berbayar yang membuka semua fitur di atas.</li>
          <li><strong className={b}>Katalog program</strong>: informasi program Founderku atau mitra beserta tautan pendaftarannya.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Akun Pengguna">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Anda wajib memberikan informasi yang benar saat mendaftar.</li>
          <li>Pendaftaran dengan email wajib diverifikasi dengan kode yang kami kirim ke email Anda.</li>
          <li>Anda bertanggung jawab menjaga kerahasiaan kata sandi dan semua aktivitas di akun Anda.</li>
          <li>Satu orang tidak boleh membuat banyak akun untuk mengulang trial atau menghindari batas paket Free.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Paket, Trial, dan Pembayaran">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className={b}>Free:</strong> tools Founderku bisa dipakai
            gratis dengan data tersimpan di browser Anda. Pajangin maksimal 2
            halaman aktif per akun, dengan tulisan &quot;Powered by
            Pajangin&quot;. Menghapus halaman tidak menambah kuota di luar
            batas 2 halaman tersebut.
          </li>
          <li>
            <strong className={b}>{PRICING.planName}:</strong> {daftarHarga}.
            Membuka halaman Pajangin tanpa batas dan tanpa watermark, serta
            menyimpan data tools ke akun agar bisa dibuka dari perangkat lain.
          </li>
          <li>
            <strong className={b}>Trial:</strong> akun baru otomatis
            mendapat trial gratis {PRICING.trialDays} hari, satu kali per
            akun, tanpa pembayaran di awal. Jika Anda membayar Pro saat trial
            masih berjalan, masa Pro dihitung mulai setelah trial berakhir,
            jadi sisa trial tidak hangus.
          </li>
          <li>
            Pembayaran diproses oleh Xendit dan dilakukan per periode.{" "}
            <strong className={b}>Tidak ada tagihan otomatis</strong>: Pro
            hanya diperpanjang jika Anda membayar lagi.
          </li>
          <li>
            Harga dapat berubah sewaktu-waktu. Perubahan harga tidak
            berlaku untuk periode yang sudah Anda bayar.
          </li>
          <li>
            Tidak ada pengembalian dana (refund) atas pembayaran{" "}
            {PRICING.planName}, kecuali diwajibkan oleh hukum yang berlaku
            atau terjadi kesalahan tagihan dari pihak kami.
          </li>
          <li>
            Saat trial atau Pro berakhir, akun kembali ke Free. Halaman
            Pajangin di atas batas Free dikunci (disembunyikan), bukan
            dihapus. Data tools yang sudah tersimpan di akun tetap bisa
            dibuka dan dihapus, tetapi perubahan baru hanya tersimpan di
            browser sampai Pro aktif lagi.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Pajangin: Etalase, Bukan Pihak Transaksi">
        <p>Pajangin hanya menyediakan etalase digital. Kami:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong className={b}>Tidak menjadi pihak</strong> dalam jual-beli antara pemilik halaman (penjual) dan pembeli yang menghubungi lewat WhatsApp.</li>
          <li><strong className={b}>Tidak bertanggung jawab</strong> atas kebenaran informasi produk, kualitas barang, pengiriman, atau sengketa dari transaksi tersebut.</li>
          <li><strong className={b}>Tidak memproses pembayaran</strong> jual-beli produk. Pembayaran itu terjadi langsung antara penjual dan pembeli, di luar sistem kami.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Tools Founderku: Alat Bantu, Bukan Nasihat Profesional">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Hasil tools (perhitungan pajak, dokumen invoice dan perjanjian,
            roadmap, dan skor kesehatan bisnis) adalah{" "}
            <strong className={b}>alat bantu dan simulasi</strong>, bukan
            nasihat pajak, hukum, atau keuangan.
          </li>
          <li>
            Pajakin menghitung berdasarkan aturan yang kami ketahui saat tool
            dibuat. Aturan pajak bisa berubah, jadi pastikan kembali ke
            konsultan pajak atau kantor pajak sebelum membayar atau melapor.
          </li>
          <li>
            Dokumen Kontrakin adalah templat umum. Untuk perjanjian bernilai
            besar atau berisiko tinggi, konsultasikan ke notaris atau
            konsultan hukum sebelum ditandatangani.
          </li>
          <li>
            Anda bertanggung jawab memeriksa kebenaran isi setiap dokumen
            sebelum dipakai, dikirim, atau ditandatangani.
          </li>
          <li>
            Data yang hanya tersimpan di browser bisa hilang jika data
            browser dihapus atau perangkat berganti. Simpan dokumen penting
            (misalnya dalam bentuk PDF) di tempat Anda sendiri.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Konten dan Moderasi">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Anda bertanggung jawab penuh atas konten yang Anda unggah atau masukkan, termasuk foto, deskripsi produk, dan data orang lain di dalam dokumen.</li>
          <li>Konten di halaman Pajangin yang melanggar hukum, hak pihak lain, atau ketentuan ini dapat kami turunkan (takedown), dan Anda akan diberi tahu beserta alasannya.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Larangan Penggunaan">
        <p>Anda dilarang menggunakan Layanan untuk:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Menjual barang atau jasa ilegal.</li>
          <li>Menipu, memalsukan identitas, atau membuat invoice, kwitansi, atau perjanjian palsu.</li>
          <li>Memasukkan data pribadi orang lain tanpa hak.</li>
          <li>Mencoba menembus keamanan sistem, mengakses data pengguna lain, atau mengganggu jalannya Layanan.</li>
          <li>Menyalahgunakan sistem, misalnya membuat banyak akun untuk mengulang trial.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Penghentian Akun">
        <p>
          Anda bisa menghapus akun kapan saja dari halaman Akun. Penghapusan
          bersifat permanen dan tidak bisa dibatalkan, dan sisa masa Pro yang
          sudah dibayar ikut hangus.
        </p>
        <p>
          Kami berhak menangguhkan atau menghentikan akun yang melanggar
          Syarat &amp; Ketentuan ini, dengan atau tanpa pemberitahuan
          sebelumnya tergantung tingkat pelanggarannya.
        </p>
      </LegalSection>

      <LegalSection title="9. Ketersediaan Layanan dan Batasan Tanggung Jawab">
        <p>
          Kami berusaha menjaga Layanan tetap berjalan, tetapi tidak menjamin
          Layanan selalu tersedia tanpa gangguan atau bebas kesalahan.
          Sepanjang diizinkan hukum yang berlaku, kami tidak bertanggung jawab
          atas kerugian tidak langsung, kehilangan pendapatan, atau kerugian
          lain yang timbul dari penggunaan Layanan, termasuk gangguan teknis,
          kehilangan data di browser, kesalahan hasil tools, atau kegagalan
          transaksi antara penjual dan pembeli.
        </p>
      </LegalSection>

      <LegalSection title="10. Perubahan Ketentuan">
        <p>
          Kami dapat mengubah Syarat &amp; Ketentuan ini. Perubahan penting
          akan kami informasikan lewat email atau pemberitahuan di situs
          sebelum berlaku. Dengan tetap menggunakan Layanan setelah perubahan
          berlaku, Anda dianggap menyetujuinya.
        </p>
      </LegalSection>

      <LegalSection title="11. Hukum yang Berlaku">
        <p>
          Syarat &amp; Ketentuan ini tunduk pada hukum Republik Indonesia.
          Perselisihan akan diupayakan selesai secara musyawarah terlebih
          dahulu.
        </p>
      </LegalSection>

      <LegalSection title="12. Kontak">
        <p>
          Pertanyaan terkait Syarat &amp; Ketentuan dapat diajukan lewat{" "}
          <LegalContact />.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
