import Link from "next/link";
import { PreviewModal } from "@/components/landing/PreviewModal";
import { StickyCta } from "@/components/landing/StickyCta";
import { FkShell } from "@/components/shell/FkShell";

// Landing Pajangin dengan tampilan yang sama dengan beranda Founderku:
// navigasi & footer bersama (FkShell), bagian bergaris, tombol pil navy.

function Mock({
  name,
  price,
  photo,
  rotate,
  className = "",
}: {
  name: string;
  price: string;
  photo: string;
  rotate: string;
  className?: string;
}) {
  return (
    <Link href="/pajangin/dashboard" className={`pj-mock ${className}`} style={{ transform: `rotate(${rotate})` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt={name} />
      <span className="pj-mock-body">
        <b>{name}</b>
        <span className="pj-price">{price}</span>
        <span className="pj-wa">Chat via WhatsApp</span>
      </span>
    </Link>
  );
}

const steps = [
  { title: "Isi form produkmu", body: "Nama, harga, 3 keunggulan, foto, sama nomor WhatsApp. Itu doang." },
  { title: "Lihat preview real-time", body: "Setiap kali ngetik, preview di sebelah langsung berubah, jadi tahu persis hasilnya sebelum publish." },
  { title: "Publish, dapat link", body: "Langsung dapat link halaman jualan, siap dishare ke story, chat, atau bio." },
];

const features = [
  { orb: "o-pajangin", title: "Langsung ke WhatsApp", body: "Tombol chat otomatis bawa pesan siap kirim, nama produk dan harganya sudah terisi. Nggak perlu checkout atau keranjang." },
  { orb: "o-brand", title: "Rapi dari awal", body: "Satu layout baku yang sudah dirapikan matang. Kamu nggak perlu mikirin tata letak, tinggal isi kontennya." },
  { orb: "o-jalanin", title: "Gratis buat mulai", body: "2 halaman jualan pertama gratis selamanya. Upgrade kapan aja kalau butuh lebih banyak." },
];

const faqs = [
  {
    q: "Pajangin itu apa sih?",
    a: "Alat bikin halaman jualan digital dalam hitungan menit, khusus buat pedagang yang transaksinya lewat WhatsApp. Bukan toko online lengkap dengan keranjang belanja, tapi etalase rapi yang langsung nyambung ke chat.",
  },
  {
    q: "Bedanya sama story Instagram apa?",
    a: "Story hilang dalam 24 jam. Halaman Pajangin nggak: sekali publish, linknya bisa dishare kapan aja dan tetap ada sampai kamu hapus sendiri.",
  },
  {
    q: "Harus bisa desain dulu nggak?",
    a: "Nggak sama sekali. Semua halaman otomatis pakai satu layout yang sudah dirapikan (Golden Template), kamu tinggal isi nama produk, harga, dan foto.",
  },
  {
    q: "Bisa pakai domain sendiri?",
    a: "Untuk sekarang halaman kamu ada di alamat founderku.com (misalnya founderku.com/l/nama-produk). Custom domain sendiri lagi direncanakan buat ke depannya.",
  },
];

export function LandingPage({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const cta = isLoggedIn ? "Buka dashboard" : "Mulai pakai Pajangin";
  return (
    <FkShell bare>
      <StickyCta isLoggedIn={isLoggedIn} />

      <section className="band hero-band" style={{ borderTop: 0 }}>
        <div className="hero-top">
          <div>
            <div className="eyebrow pj-eyebrow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pajangin-assets/logo.jpeg" alt="" width={22} height={22} />
              Pajangin, dari Founderku
            </div>
            <h1 className="h1">
              Toko kamu, versi digital<span className="o">.</span>
            </h1>
            <div className="hero-btns">
              <Link className="btn btn-solid" href="/pajangin/dashboard" id="pjCta">
                {cta}
              </Link>
              <PreviewModal />
            </div>
          </div>
          <p>
            Pajang produkmu di satu halaman yang rapi, terhubung langsung ke WhatsApp. Nggak perlu ribet bikin toko online:
            cukup pajang, share, jualan. Jadi dalam hitungan menit.
          </p>
        </div>
        <div className="pj-stage" aria-label="Contoh halaman jualan">
          <span className="orb o-pajangin spin pj-orb" aria-hidden="true">
            <i></i>
          </span>
          <Mock name="Kopi Susu Gula Aren" price="Rp 8.000" photo="/pajangin-assets/photos/p11.jpg" rotate="-6deg" className="pj-side" />
          <Mock name="Kaos Polos Combed 30s" price="Rp 15.000" photo="/pajangin-assets/photos/p14.jpg" rotate="2deg" />
          <Mock name="Tas Rajut Handmade" price="Rp 18.000" photo="/pajangin-assets/photos/p02.jpg" rotate="-3deg" className="pj-side" />
        </div>
      </section>

      <section className="band" id="cara-kerja">
        <div className="sec-head">
          <div>
            <div className="eyebrow">Cara kerja</div>
            <h2 className="h2">
              3 langkah, langsung jadi<span className="o">.</span>
            </h2>
          </div>
          <p>Nggak perlu ngerti desain atau coding. Semuanya diisi dari HP, hasilnya langsung kelihatan.</p>
        </div>
        <div className="steps three">
          {steps.map((s, i) => (
            <div className="st" key={s.title}>
              <i>{i + 1}</i>
              <div>
                <span>{s.title}</span>
                <small>{s.body}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="bento">
          <div className="bx">
            <div className="pj-stack" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pj-s1" src="/pajangin-assets/photos/p13.jpg" alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pj-s2" src="/pajangin-assets/photos/p15.jpg" alt="" />
              <div className="pj-s3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/pajangin-assets/photos/p11.jpg" alt="" />
                <span>
                  <b>Kudapan Tradisional</b>
                  <small>Renyah, gurih, langsung digoreng</small>
                  <i></i>
                </span>
              </div>
            </div>
            <div className="cap">
              <small>Golden Template</small>
              <span>Satu layout, langsung rapi. Semua halaman ikut satu template yang sudah dirapikan, tinggal isi kontennya.</span>
            </div>
          </div>
          <div className="bx art art-b">
            <span className="grain"></span>
            <div className="float-ui" style={{ maxWidth: 280 }}>
              <small style={{ color: "rgba(26,23,48,.55)", fontSize: 12 }}>Halaman aktif</small>
              <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.03em" }}>Tanpa batas</div>
              <div style={{ fontSize: 13, color: "rgba(26,23,48,.6)", marginTop: 4 }}>dengan Founderku Pro</div>
            </div>
            <div className="cap">
              <small>Fleksibel</small>
              <span>Mulai dari 2 halaman gratis. Begitu butuh lebih, tinggal upgrade tanpa pindah platform atau bikin ulang.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="sec-head">
          <div>
            <div className="eyebrow">Kenapa Pajangin</div>
            <h2 className="h2">
              Fokus jualan, bukan ngoprek website<span className="o">.</span>
            </h2>
          </div>
          <p>Dibuat buat pedagang yang transaksinya lewat WhatsApp: kue rumahan, kopi, fashion, kerajinan, dan banyak lagi.</p>
        </div>
        <div className="grid-auto">
          {features.map((f) => (
            <div className="sm" key={f.title}>
              <span className={`orb ${f.orb}`}>
                <i></i>
              </span>
              <div>
                <small>{f.title}</small>
                <span>{f.body}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="pj-quote">
          <div className="eyebrow">Kenapa ini penting</div>
          <p>
            Buat banyak pedagang, momen paling melegakan itu bukan pas closing pertama, tapi pas pertama kali punya link sendiri
            buat dishare<span className="o">.</span>
          </p>
        </div>
      </section>

      <section className="band">
        <div className="sec-head" style={{ marginBottom: 18 }}>
          <div>
            <div className="eyebrow">FAQ</div>
            <h2 className="h2">Sering ditanyain</h2>
          </div>
        </div>
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="cta-row">
          <div>
            <h2 className="h2">
              Mulai pajang produkmu hari ini<span className="o">.</span>
            </h2>
            <p>Pakai akun Founderku kamu, langsung jadi dalam hitungan menit.</p>
          </div>
          <Link className="btn btn-solid" href="/pajangin/dashboard">
            {cta}
          </Link>
        </div>
      </section>
    </FkShell>
  );
}
