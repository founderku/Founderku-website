import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { PhotoMarquee } from "@/components/landing/PhotoMarquee";
import { PreviewModal } from "@/components/landing/PreviewModal";
import { StickyCta } from "@/components/landing/StickyCta";
import { Accordion } from "@/components/landing/Accordion";

function HeroCardMockup({
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
    <Link
      href="/pajangin/dashboard"
      className={`block w-[190px] sm:w-[230px] bg-white rounded-[24px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-transform duration-300 ${className}`}
      style={{ transform: `rotate(${rotate})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt={name}
        className="w-full aspect-[4/3] object-cover"
      />
      <div className="p-4">
        <div className="font-manrope font-extrabold text-sm mb-1">
          {name}
        </div>
        <div className="font-manrope font-extrabold text-coral text-base mb-3">
          {price}
        </div>
        <div className="glass-amber text-ink text-center font-manrope font-bold text-xs py-2.5 rounded-xl">
          💬 Chat via WhatsApp
        </div>
      </div>
    </Link>
  );
}

const steps = [
  {
    num: "01",
    title: "Isi form produkmu",
    body: "Nama, harga, 3 keunggulan, foto, sama nomor WhatsApp. Itu doang.",
  },
  {
    num: "02",
    title: "Lihat preview real-time",
    body: "Setiap kali ngetik, preview di sebelah langsung berubah - jadi tahu persis hasilnya sebelum publish.",
  },
  {
    num: "03",
    title: "Publish, dapet link",
    body: "Langsung dapet link halaman jualan, siap dishare ke story, chat, atau bio.",
  },
];

const features = [
  {
    title: "Langsung ke WhatsApp",
    body: "Tombol chat udah otomatis bawa pesan siap kirim - nama produk dan harganya udah keisi. Nggak perlu checkout, nggak perlu keranjang.",
  },
  {
    title: "Rapi dari awal",
    body: "Satu layout baku yang udah dirapiin matang. Kamu nggak perlu mikirin tata letak, tinggal isi kontennya.",
  },
  {
    title: "Gratis buat mulai",
    body: "2 halaman jualan pertama gratis selamanya. Upgrade kapan aja kalau butuh lebih banyak.",
  },
];

const faqs = [
  {
    q: "Pajangin itu apa sih?",
    a: "Alat bikin halaman jualan digital dalam hitungan menit, khusus buat pedagang yang transaksinya lewat WhatsApp. Bukan toko online lengkap dengan keranjang belanja, tapi etalase rapi yang langsung nyambung ke chat.",
  },
  {
    q: "Bedanya sama story Instagram apa?",
    a: "Story ilang dalam 24 jam. Halaman Pajangin nggak - sekali publish, linknya bisa dishare kapan aja dan tetap ada sampai kamu hapus sendiri.",
  },
  {
    q: "Harus bisa desain dulu nggak?",
    a: "Nggak sama sekali. Semua halaman otomatis pakai satu layout yang udah dirapiin (Golden Template) - kamu tinggal isi nama produk, harga, dan foto.",
  },
  {
    q: "Bisa pakai domain sendiri?",
    a: "Untuk sekarang halaman kamu ada di alamat founderku.com (misalnya founderku.com/l/nama-produk). Custom domain sendiri lagi direncanain buat ke depannya.",
  },
];

export function LandingPage({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <div className="min-h-screen bg-white">
      <StickyCta isLoggedIn={isLoggedIn} />

      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pajangin-assets/logo.jpeg" alt="Pajangin" className="w-9 h-9 rounded-xl" />
          <span className="font-manrope font-extrabold text-lg text-white">
            Pajangin
          </span>
        </div>
        <div className="flex items-center gap-5">
          {/* Login & harga dikelola terpusat di akun Founderku. Kalau
              belum login, /pajangin/dashboard otomatis ngarahin ke /masuk. */}
          <Link
            href="/pajangin/dashboard"
            className="font-manrope font-bold text-sm px-5 py-2.5 rounded-2xl glass-amber text-ink hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            {isLoggedIn ? "Lihat Toko" : "Mulai Pakai"}
          </Link>
        </div>
      </header>

      {/* Hero: collage foto bergerak + kartu headline mengambang */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <PhotoMarquee />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/80 to-ink" />
        </div>

        <div className="relative z-10 px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 font-manrope font-bold text-xs uppercase tracking-widest text-amber mb-6">
              Dari Founderku
            </span>
            <h1 className="font-manrope font-extrabold text-4xl sm:text-6xl tracking-tight text-white leading-[1.05] text-balance">
              Toko kamu, tapi versi digital.
              <br />
              Siap dalam hitungan menit.
            </h1>
            <p className="mt-6 text-lg text-ink-soft max-w-lg mx-auto">
              Pajang produkmu di satu halaman yang rapi, terhubung langsung ke
              WhatsApp. Nggak perlu ribet bikin toko online - cukup pajang,
              share, jualan.
            </p>
            <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/pajangin/dashboard"
                className="font-manrope font-extrabold text-base px-7 py-4 rounded-2xl glass-amber text-ink hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Mulai Pakai Pajangin
              </Link>
              <PreviewModal />
            </div>
          </Reveal>

          <Reveal
            delayMs={150}
            className="mt-16 sm:mt-20 flex items-start justify-center gap-4 sm:gap-7 px-4"
          >
            <HeroCardMockup
              name="Kopi Susu Gula Aren"
              price="Rp 8.000"
              photo="/pajangin-assets/photos/p11.jpg"
              rotate="-6deg"
              className="mt-8 hidden sm:block"
            />
            <HeroCardMockup
              name="Kaos Polos Combed 30s"
              price="Rp 15.000"
              photo="/pajangin-assets/photos/p14.jpg"
              rotate="3deg"
            />
            <HeroCardMockup
              name="Tas Rajut Handmade"
              price="Rp 18.000"
              photo="/pajangin-assets/photos/p02.jpg"
              rotate="-3deg"
              className="mt-10 hidden md:block"
            />
          </Reveal>
        </div>
      </section>

      {/* Cara kerja */}
      <section
        id="cara-kerja"
        className="relative z-10 -mt-10 sm:-mt-14 rounded-t-[40px] sm:rounded-t-[56px] bg-bg-soft px-6 pt-20 pb-20 sm:pt-28 sm:pb-28"
      >
        <Reveal className="max-w-xl mx-auto text-center mb-14">
          <span className="font-manrope font-bold text-xs uppercase tracking-widest text-coral">
            Cara kerja
          </span>
          <h2 className="mt-3 font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight text-balance">
            3 langkah, langsung jadi
          </h2>
        </Reveal>

        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <Reveal key={step.num} delayMs={i * 100}>
              <div className="group">
                <div className="font-manrope font-extrabold text-4xl text-indigo/40 mb-3 transition-colors group-hover:text-indigo/70">
                  {step.num}
                </div>
                <h3 className="font-manrope font-extrabold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-text-soft leading-relaxed">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Showcase 2 kolom - Golden Template & fleksibilitas upgrade */}
      <section className="bg-white px-6 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          <Reveal>
            <div className="bg-bg-soft rounded-[32px] p-8 sm:p-10 h-full flex flex-col">
              <span className="inline-block font-manrope font-bold text-[11px] uppercase tracking-wide bg-white px-3 py-1.5 rounded-lg mb-8 self-start">
                Golden Template
              </span>
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="relative w-full max-w-[220px]">
                  <div
                    className="absolute -rotate-12 -translate-x-8 -translate-y-2 w-[85%] bg-white rounded-2xl overflow-hidden shadow-lg opacity-60 animate-float"
                    style={{
                      "--float-base": "rotate(-12deg) translateX(-2rem) translateY(-0.5rem)",
                      "--float-delay": "0.4s",
                    } as React.CSSProperties}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/pajangin-assets/photos/p13.jpg"
                      alt=""
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </div>
                  <div
                    className="absolute rotate-8 translate-x-8 -translate-y-1 w-[85%] bg-white rounded-2xl overflow-hidden shadow-lg opacity-75 animate-float"
                    style={{
                      "--float-base": "rotate(8deg) translateX(2rem) translateY(-0.25rem)",
                      "--float-delay": "0.8s",
                    } as React.CSSProperties}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/pajangin-assets/photos/p15.jpg"
                      alt=""
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </div>
                  <div
                    className="relative w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-float"
                    style={{ "--float-delay": "0s" } as React.CSSProperties}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/pajangin-assets/photos/p11.jpg"
                      alt="Contoh halaman produk"
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="p-4">
                      <p className="font-manrope font-extrabold text-sm mb-0.5">
                        Kudapan Tradisional
                      </p>
                      <p className="text-[11px] text-text-faint mb-2">
                        Renyah, gurih, langsung digoreng
                      </p>
                      <div className="glass-amber h-7 w-full rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="font-manrope font-extrabold text-xl mb-2">
                Satu layout, langsung rapi
              </h3>
              <p className="text-sm text-text-soft leading-relaxed">
                Nggak perlu mikirin tata letak dari nol. Semua halaman ngikut
                satu template yang udah dirapiin, tinggal isi kontennya.
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="bg-ink text-white rounded-[32px] p-8 sm:p-10 h-full flex flex-col relative overflow-hidden">
              <span className="inline-block font-manrope font-bold text-[11px] uppercase tracking-wide bg-white/10 px-3 py-1.5 rounded-lg mb-8 self-start">
                Fleksibel
              </span>
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="relative w-full max-w-[220px] h-28">
                  <svg
                    viewBox="0 0 220 112"
                    className="w-full h-full"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 92 C 50 90, 70 70, 100 55 S 160 15, 216 8"
                      fill="none"
                      stroke="#F2A623"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="animate-draw-line"
                    />
                    <path
                      d="M4 92 C 50 90, 70 70, 100 55 S 160 15, 216 8 L 216 112 L 4 112 Z"
                      fill="url(#growthFade)"
                      opacity="0.25"
                    />
                    <defs>
                      <linearGradient id="growthFade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F2A623" />
                        <stop offset="100%" stopColor="#F2A623" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div
                    className="absolute -top-1 left-1 bg-white text-ink rounded-xl px-3 py-1.5 shadow-lg animate-float"
                    style={{ "--float-delay": "0.5s" } as React.CSSProperties}
                  >
                    <p className="text-[10px] text-text-faint leading-none mb-0.5">
                      Halaman aktif
                    </p>
                    <p className="font-manrope font-extrabold text-sm leading-none">
                      Tanpa batas
                    </p>
                  </div>
                  <div
                    className="absolute bottom-0 right-2 w-9 h-9 rounded-full glass-amber flex items-center justify-center font-manrope font-extrabold text-xs text-ink shadow-lg animate-float"
                    style={{ "--float-delay": "1s" } as React.CSSProperties}
                  >
                    Pro
                  </div>
                </div>
              </div>
              <h3 className="font-manrope font-extrabold text-xl mb-2">
                Upgrade kapan aja
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                Mulai dari 2 halaman gratis. Begitu butuh lebih, tinggal
                upgrade - nggak perlu pindah platform atau bikin ulang dari
                nol.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Kenapa Pajangin */}
      <section className="relative z-10 -mt-10 sm:-mt-14 rounded-t-[40px] sm:rounded-t-[56px] bg-ink px-6 pt-20 pb-20 sm:pt-28 sm:pb-28">
        <Reveal className="max-w-xl mx-auto text-center mb-14">
          <span className="font-manrope font-bold text-xs uppercase tracking-widest text-amber">
            Kenapa Pajangin
          </span>
          <h2 className="mt-3 font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight text-white text-balance">
            Fokus jualan, bukan ngoprek website
          </h2>
        </Reveal>

        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delayMs={i * 100}>
              <div className="bg-white/[0.06] rounded-[24px] p-7 h-full hover:bg-white/[0.1] hover:-translate-y-1 transition-all duration-300">
                <h3 className="font-manrope font-extrabold text-lg text-white mb-2.5">
                  {f.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Refleksi (bukan kutipan atas nama orang tertentu) */}
      <section className="relative z-10 -mt-10 sm:-mt-14 rounded-t-[40px] sm:rounded-t-[56px] bg-bg-soft px-6 pt-20 pb-20 sm:pt-28 sm:pb-28">
        <Reveal className="max-w-2xl mx-auto text-center">
          <span className="font-manrope font-bold text-xs uppercase tracking-widest text-coral">
            Kenapa ini penting
          </span>
          <p className="mt-5 font-manrope font-extrabold text-2xl sm:text-3xl leading-snug tracking-tight text-balance">
            &ldquo;Buat banyak pedagang, momen paling melegakan itu bukan pas
            closing pertama - tapi pas pertama kali punya link sendiri buat
            dishare, bukan cuma story yang ilang dalam 24 jam.&rdquo;
          </p>
        </Reveal>
      </section>

      {/* Logo wall / trust - Founderku */}
      <section className="bg-white px-6 py-16 border-y border-border">
        <Reveal className="max-w-lg mx-auto text-center">
          <span className="font-manrope font-bold text-xs uppercase tracking-widest text-text-faint">
            Bagian dari
          </span>
          <div className="mt-4 flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pajangin-assets/logo.jpeg"
              alt="Founderku"
              className="w-10 h-10 rounded-xl"
            />
            <span className="font-manrope font-extrabold text-2xl">
              Founderku
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs font-manrope font-bold bg-bg-soft px-4 py-2 rounded-full text-text-soft">
              9.660+ pengikut Instagram
            </span>
            <span className="text-xs font-manrope font-bold bg-bg-soft px-4 py-2 rounded-full text-text-soft">
              Sub-brand Founderku
            </span>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="bg-white px-6 py-20 sm:py-28">
        <Reveal className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="font-manrope font-bold text-xs uppercase tracking-widest text-coral">
              FAQ
            </span>
            <h2 className="mt-3 font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight text-balance">
              Sering ditanyain
            </h2>
          </div>
          <Accordion items={faqs} />
        </Reveal>
      </section>

      {/* Final CTA - kartu ngambang, bukan strip gelap full lebar */}
      <section className="bg-white px-6 py-16 sm:py-24">
        <Reveal className="max-w-4xl mx-auto relative overflow-hidden rounded-[40px] sm:rounded-[48px] bg-ink px-8 py-16 sm:py-20 text-center">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-coral/30 blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo/30 blur-[100px]" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber/20 blur-[90px]" />

          <div className="relative z-10 max-w-xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pajangin-assets/logo.jpeg"
              alt="Pajangin"
              className="w-12 h-12 rounded-2xl mx-auto mb-6"
            />
            <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight text-white text-balance mb-4">
              Mulai pajang produkmu hari ini
            </h2>
            <p className="text-ink-soft mb-8">
              Pakai akun Founderku kamu, langsung jadi dalam hitungan menit.
            </p>
            <Link
              href="/pajangin/dashboard"
              className="inline-block font-manrope font-extrabold text-base px-8 py-4 rounded-2xl glass-amber text-ink hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Mulai Pakai Pajangin
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 -mt-10 sm:-mt-14 rounded-t-[40px] sm:rounded-t-[56px] bg-ink px-6 pt-14 pb-10">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-10 sm:gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pajangin-assets/logo.jpeg" alt="Pajangin" className="w-8 h-8 rounded-xl" />
              <span className="font-manrope font-extrabold text-white">
                Pajangin
              </span>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed">
              Pajangin adalah produk dari{" "}
              <span className="font-manrope font-bold text-white">
                Founderku
              </span>
              , bikin halaman jualan digital buat pedagang UMKM yang
              transaksinya lewat WhatsApp - tanpa perlu ngoprek website.
            </p>
          </div>

          <div>
            <p className="font-manrope font-bold text-xs uppercase tracking-wide text-white mb-4">
              Dukungan
            </p>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <li>
                <Link href="/syarat" className="hover:text-white transition-colors">
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/privasi" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-manrope font-bold text-xs uppercase tracking-wide text-white mb-4">
              Hubungi Kami
            </p>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <li>
                <a
                  href="mailto:founderku@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  founderku@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/6285710477257"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  +62 857-1047-7257
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/founderku?igsh=MW11ZW00dXI4YXltZQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @founderku
                </a>
              </li>
              <li className="text-ink-faint">Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto pt-6 border-t border-ink-border text-center">
          <p className="text-xs text-ink-faint">
            &copy; {new Date().getFullYear()} PT Talenthra Karya Nusantara.
            Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </div>
  );
}
