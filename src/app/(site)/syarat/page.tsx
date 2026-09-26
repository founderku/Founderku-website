import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import { PRICING, formatRupiah, periodSuffix } from "@/lib/pricing";

// Isi halaman ini adalah Syarat & Ketentuan resmi Pajangin.
const NAMA_PT = (
  <span className="font-semibold">
    PT Talenthra Karya Nusantara (NIB: 0909250086011)
  </span>
);

export default function SyaratPage() {
  return (
    <LegalLayout title="Syarat & Ketentuan" updatedAt="29 Juli 2026">
      <LegalSection title="1. Tentang Layanan">
        <p>
          Pajangin adalah layanan pembuatan halaman jualan digital sederhana
          (&quot;etalase digital&quot;) yang menghubungkan penjual dengan
          calon pembeli lewat WhatsApp. Layanan ini disediakan oleh{" "}
          {NAMA_PT} di bawah sub-brand Pajangin.
        </p>
      </LegalSection>

      <LegalSection title="2. Sifat Layanan: Etalase, Bukan Pihak Transaksi">
        <p>
          <strong className="text-ink">Ini poin penting:</strong> Pajangin
          hanya menyediakan sarana tampilan/etalase digital. Kami:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-ink">Tidak menjadi pihak</strong> dalam
            transaksi jual-beli antara pemilik halaman (penjual) dan
            pembeli yang menghubungi lewat WhatsApp.
          </li>
          <li>
            <strong className="text-ink">Tidak bertanggung jawab</strong>{" "}
            atas kebenaran informasi produk, kualitas barang, pengiriman,
            atau sengketa apa pun yang timbul dari transaksi tersebut.
          </li>
          <li>
            <strong className="text-ink">Tidak memproses pembayaran</strong>{" "}
            transaksi jual-beli antara penjual dan pembeli (pembayaran itu
            terjadi langsung antara kedua pihak, di luar sistem kami).
          </li>
        </ul>
        <p>
          Pembayaran yang kami proses lewat Xendit hanya untuk biaya
          langganan Pro, bukan untuk transaksi jual-beli produk yang dijual
          pengguna kami.
        </p>
      </LegalSection>

      <LegalSection title="3. Akun Pengguna">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Anda wajib memberikan informasi yang akurat saat mendaftar.</li>
          <li>Akun dengan pendaftaran email+password wajib melalui verifikasi email sebelum dapat mempublikasikan halaman.</li>
          <li>Anda bertanggung jawab menjaga kerahasiaan kata sandi akun Anda.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Tier Layanan dan Pembayaran">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-ink">Free:</strong> maksimal 2 halaman
            aktif per akun, dengan watermark &quot;Powered by
            Pajangin&quot;. Batas ini bersifat tetap (hard limit) - tidak
            dapat menghapus satu halaman untuk mengganti dengan halaman
            lain di luar batas 2 tersebut tanpa upgrade.
          </li>
          <li>
            <strong className="text-ink">{PRICING.planName}:</strong>{" "}
            {PRICING.prices
              .map((p) => `${formatRupiah(p.amount)}${periodSuffix(p.days)}`)
              .join(" atau ")}
            , halaman tidak terbatas, tanpa watermark, dan akses ke semua
            tools Founderku. Akun baru mendapat trial gratis{" "}
            {PRICING.trialDays} hari satu kali, tanpa pembayaran di awal.
            Pembayaran dilakukan per periode (tidak ada tagihan otomatis).
          </li>
          <li>
            Tidak ada kebijakan pengembalian dana (refund) dalam bentuk
            apa pun atas pembayaran langganan Pro, kecuali diwajibkan oleh
            hukum yang berlaku.
          </li>
          <li>
            Jika Anda membatalkan langganan Pro, akses Pro tetap berlaku
            sampai akhir periode yang sudah dibayar, setelah itu akun
            otomatis turun ke batas Free (halaman melebihi batas akan
            berstatus &quot;terkunci&quot;/locked, bukan dihapus).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Konten dan Moderasi">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Anda bertanggung jawab penuh atas konten yang Anda unggah (foto, deskripsi produk, dll).</li>
          <li>Konten yang melanggar hukum, hak pihak lain, atau kebijakan kami dapat diturunkan (takedown) oleh tim kami.</li>
          <li>Anda akan diberi notifikasi lewat WhatsApp/email jika halaman Anda diturunkan, beserta alasannya.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Larangan Penggunaan">
        <p>Anda dilarang menggunakan Layanan untuk:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Menjual barang/jasa ilegal.</li>
          <li>Konten yang menipu, memalsukan identitas, atau melanggar hukum yang berlaku.</li>
          <li>Menyalahgunakan sistem (misalnya membuat banyak akun untuk menghindari batas Free).</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Penghentian Layanan oleh Kami">
        <p>
          Kami berhak menangguhkan atau menghentikan akun yang melanggar
          Syarat Ketentuan ini, dengan atau tanpa pemberitahuan sebelumnya
          tergantung tingkat pelanggaran.
        </p>
      </LegalSection>

      <LegalSection title="8. Batasan Tanggung Jawab">
        <p>
          Sepanjang diizinkan hukum yang berlaku, Pajangin tidak
          bertanggung jawab atas kerugian tidak langsung, kehilangan
          pendapatan, atau kerugian lain yang timbul dari penggunaan
          Layanan, termasuk namun tidak terbatas pada gangguan teknis,
          downtime, atau kegagalan transaksi antara penjual dan pembeli.
        </p>
      </LegalSection>

      <LegalSection title="9. Perubahan Ketentuan">
        <p>
          Kami dapat mengubah Syarat Ketentuan ini sewaktu-waktu.
          Perubahan akan diinformasikan lewat email atau dashboard sebelum
          berlaku efektif.
        </p>
      </LegalSection>

      <LegalSection title="10. Hukum yang Berlaku">
        <p>Syarat Ketentuan ini tunduk pada hukum Republik Indonesia.</p>
      </LegalSection>

      <LegalSection title="11. Kontak">
        <p>
          Pertanyaan terkait Syarat Ketentuan dapat diajukan lewat email{" "}
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
