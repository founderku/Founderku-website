"use client";

// Isi halaman /harga dengan tampilan baru (sama dengan beranda).
// Bahasa ikut pilihan di navigasi: fk-site.js mengirim event "fk:lang".
// Nominal harga selalu dari data/pricing.json (lewat PRICING), dan server
// yang menentukan nominal tagihan, bukan browser.

import { useEffect, useState } from "react";
import { PRICING, formatRupiah, type Lang } from "@/lib/pricing";
import plans from "@public/data/plans.json";

// Daftar paket Gratis dari sumber yang sama dengan penjelasan di tiap tool
function gratisDariPlans(lang: Lang): string[] {
  const p = (x: Record<string, string>) => x[lang] || x.id;
  const b = plans.baris;
  return [
    p(b.inti.free),
    `${p(b.proyek.free)} · ${p(b.simpan.free)}`,
    p(b.pdf.free),
    `${p(plans.pajangin.free[0])} · ${p(plans.pajangin.free[3])}`,
    p(plans.asisten.free).replace("{n}", String(plans.aiLimit.free)),
  ];
}

type Props = {
  loggedIn: boolean;
  hasPro: boolean;
  onTrial: boolean;
  activeUntil: string | null;
  failed: boolean;
};

const T = {
  id: {
    eyebrow: "Harga",
    h1: "Mulai gratis. Upgrade kalau perlu.",
    sub: "Satu langganan membuka semua tools. Trial {days} hari otomatis saat daftar, tanpa kartu dan tanpa tagihan otomatis.",
    failed: "Pembayaran belum berhasil atau dibatalkan. Kamu bisa coba lagi di bawah.",
    freeName: "Free",
    freeDesc: "Buat coba-coba dan baru mulai.",
    free: ["Satu akun Founderku", "Tools dasar langsung bisa dipakai", "Pajangin: 2 halaman jualan (dengan watermark)"],
    freeCta: "Daftar gratis",
    freeCtaIn: "Buka akun kamu",
    period: "Pilih periode",
    month: "bulan",
    year: "tahun",
    days: "hari",
    trialCta: "Mulai trial {days} hari",
    haveAcc: "Sudah punya akun?",
    login: "Masuk",
    pay: "Bayar {price}",
    paying: "Menyiapkan pembayaran...",
    payNote: "Kamu akan diarahkan ke halaman pembayaran Xendit (transfer bank, e-wallet, dan lainnya).",
    trialUntil: "Trial kamu aktif sampai {date}. Bayar sekarang, masa aktif langsung jalan dan trial nggak hangus sia-sia.",
    proUntil: "{plan} kamu aktif sampai {date}. Kalau bayar lagi sekarang, masa aktifnya ditambahkan setelah tanggal itu (sisa hari nggak hangus).",
    errPay: "Gagal membuat pembayaran. Coba lagi.",
    errNet: "Gagal terhubung ke server. Coba lagi.",
    member: "Member",
    owner: "Pemilik",
    you: "Kamu",
    free7: "{days} hari gratis",
    faq: "Pertanyaan yang sering muncul",
    q: [
      ["Trial gratisnya gimana?", "Begitu daftar, kamu langsung dapat {days} hari Founderku Pro, tanpa kartu dan tanpa bayar di awal. Setelah itu akun otomatis balik ke versi gratis, kecuali kamu berlangganan."],
      ["Bayarnya gimana? Ada tagihan otomatis?", "Bayar per bulan atau per tahun lewat halaman pembayaran Xendit (transfer bank, e-wallet, dan lainnya). Nggak ada tagihan otomatis, jadi kamu sendiri yang putuskan kapan perpanjang."],
      ["Kalau langganan habis, dataku hilang?", "Nggak. Akun kamu otomatis balik ke versi gratis dan datamu tidak dihapus. Di Pajangin, versi gratis tetap bisa dipakai untuk 2 halaman jualan (dengan watermark)."],
    ],
  },
  en: {
    eyebrow: "Pricing",
    h1: "Start free. Upgrade when you need to.",
    sub: "One subscription unlocks every tool. A {days}-day trial starts automatically when you sign up, no card and no automatic billing.",
    failed: "The payment did not go through or was cancelled. You can try again below.",
    freeName: "Free",
    freeDesc: "For trying things out and just getting started.",
    free: ["One Founderku account", "Basic tools, ready to use", "Pajangin: 2 sales pages (with watermark)"],
    freeCta: "Sign up free",
    freeCtaIn: "Open your account",
    period: "Choose billing period",
    month: "month",
    year: "year",
    days: "days",
    trialCta: "Start {days}-day trial",
    haveAcc: "Already have an account?",
    login: "Log in",
    pay: "Pay {price}",
    paying: "Preparing payment...",
    payNote: "You will be taken to the Xendit payment page (bank transfer, e-wallets, and more).",
    trialUntil: "Your trial is active until {date}. Pay now and your paid period starts right away, so the trial does not go to waste.",
    proUntil: "Your {plan} is active until {date}. If you pay again now, the new period is added after that date (remaining days are kept).",
    errPay: "Could not create the payment. Please try again.",
    errNet: "Could not reach the server. Please try again.",
    member: "Member",
    owner: "Owner",
    you: "You",
    free7: "{days} days free",
    faq: "Frequently asked questions",
    q: [
      ["How does the free trial work?", "As soon as you sign up, you get {days} days of Founderku Pro, no card and no upfront payment. After that your account goes back to the free version unless you subscribe."],
      ["How do I pay? Is there automatic billing?", "Pay monthly or yearly through the Xendit payment page (bank transfer, e-wallets, and more). There is no automatic billing, so you decide when to renew."],
      ["If my subscription ends, is my data lost?", "No. Your account goes back to the free version and your data is not deleted. On Pajangin, the free version still covers 2 sales pages (with watermark)."],
    ],
  },
  tr: {
    eyebrow: "Fiyatlar",
    h1: "Ücretsiz başla. Gerekince yükselt.",
    sub: "Tek abonelik tüm araçları açar. Kaydolunca {days} günlük deneme otomatik başlar; kart yok, otomatik ödeme yok.",
    failed: "Ödeme tamamlanmadı ya da iptal edildi. Aşağıdan tekrar deneyebilirsin.",
    freeName: "Ücretsiz",
    freeDesc: "Denemek ve yeni başlamak için.",
    free: ["Tek bir Founderku hesabı", "Temel araçlar hemen kullanıma hazır", "Pajangin: 2 satış sayfası (filigranlı)"],
    freeCta: "Ücretsiz kaydol",
    freeCtaIn: "Hesabını aç",
    period: "Ödeme dönemi seç",
    month: "ay",
    year: "yıl",
    days: "gün",
    trialCta: "{days} günlük denemeyi başlat",
    haveAcc: "Hesabın var mı?",
    login: "Giriş",
    pay: "{price} öde",
    paying: "Ödeme hazırlanıyor...",
    payNote: "Xendit ödeme sayfasına yönlendirileceksin (banka havalesi, e-cüzdan ve diğerleri).",
    trialUntil: "Denemen {date} tarihine kadar aktif. Şimdi ödersen ücretli dönem hemen başlar, deneme boşa gitmez.",
    proUntil: "{plan} üyeliğin {date} tarihine kadar aktif. Şimdi tekrar ödersen yeni dönem bu tarihten sonra eklenir (kalan günler korunur).",
    errPay: "Ödeme oluşturulamadı. Tekrar dene.",
    errNet: "Sunucuya bağlanılamadı. Tekrar dene.",
    member: "Üye",
    owner: "Sahibi",
    you: "Sen",
    free7: "{days} gün ücretsiz",
    faq: "Sıkça sorulan sorular",
    q: [
      ["Ücretsiz deneme nasıl işliyor?", "Kaydolur olmaz {days} gün Founderku Pro alırsın, kart ve ön ödeme gerekmez. Sonrasında abone olmazsan hesabın ücretsiz sürüme döner."],
      ["Nasıl ödeme yaparım? Otomatik ödeme var mı?", "Xendit ödeme sayfası üzerinden aylık veya yıllık ödersin (banka havalesi, e-cüzdan ve diğerleri). Otomatik ödeme yok, ne zaman yenileyeceğine sen karar verirsin."],
      ["Abonelik bitince verilerim silinir mi?", "Hayır. Hesabın ücretsiz sürüme döner ve verilerin silinmez. Pajangin'de ücretsiz sürümle 2 satış sayfası kullanmaya devam edebilirsin (filigranlı)."],
    ],
  },
} as const;

const LOCALE: Record<Lang, string> = { id: "id-ID", en: "en-GB", tr: "tr-TR" };

function fill(s: string, vars: Record<string, string | number>) {
  return Object.keys(vars).reduce((acc, k) => acc.split(`{${k}}`).join(String(vars[k])), s);
}

function readLang(): Lang {
  // Pilihan bahasa tersimpan (sama dengan halaman lain), lalu atribut <html lang>
  let l: string | null = null;
  try {
    l = localStorage.getItem("fk-lang");
  } catch {}
  if (l !== "en" && l !== "tr" && l !== "id") l = document.documentElement.getAttribute("lang");
  return l === "en" || l === "tr" ? l : "id";
}

// Judul dengan titik oranye di akhir, sama seperti beranda
function Dotted({ text }: { text: string }) {
  if (!text.endsWith(".")) return <>{text}</>;
  return (
    <>
      {text.slice(0, -1)}
      <span className="o">.</span>
    </>
  );
}

export function HargaView({ loggedIn, hasPro, onTrial, activeUntil, failed }: Props) {
  const [lang, setLang] = useState<Lang>("id");
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Baca bahasa yang dipilih pengunjung setelah halaman tampil di browser
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(readLang());
    const onLang = () => setLang(readLang());
    window.addEventListener("fk:lang", onLang);
    return () => window.removeEventListener("fk:lang", onLang);
  }, []);

  const t = T[lang];
  const days = PRICING.trialDays;
  const prices = PRICING.prices;
  const price = prices[idx] ?? prices[0];
  const periodWord = (d: number) => (d === 30 || d === 31 ? t.month : d === 365 || d === 366 ? t.year : `${d} ${t.days}`);
  const until = activeUntil
    ? new Date(activeUntil).toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })
    : "";

  async function pay() {
    if (!price) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // Cuma kirim id pilihan. Nominalnya ditentukan server dari data/pricing.json.
      const res = await fetch("/api/xendit/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: price.id }),
      });
      const result = await res.json();
      if (!res.ok) {
        setLoading(false);
        setErrorMsg(result.error ?? t.errPay);
        return;
      }
      // Ke halaman pembayaran Xendit (di luar Founderku)
      window.location.assign(result.url);
    } catch {
      setLoading(false);
      setErrorMsg(t.errNet);
    }
  }

  return (
    <>
      <section className="band hero-band" style={{ borderTop: 0 }}>
        <div className="hero-top">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h1 className="h1">
              <Dotted text={t.h1} />
            </h1>
          </div>
          <p>{fill(t.sub, { days })}</p>
        </div>
      </section>

      <section className="band flush" id="plans">
        {failed && <div className="notice bad">{t.failed}</div>}
        {loggedIn && hasPro && until && (
          <div className="notice">
            {onTrial ? fill(t.trialUntil, { date: until }) : fill(t.proUntil, { date: until, plan: PRICING.planName })}
          </div>
        )}
        <div className="plans">
          <div className="plan">
            <h3>{t.freeName}</h3>
            <div className="price">Rp 0</div>
            <p className="d">{t.freeDesc}</p>
            <ul>
              {gratisDariPlans(lang).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a className="btn btn-line" href={loggedIn ? "/akun" : "/daftar"}>
              {loggedIn ? t.freeCtaIn : t.freeCta}
            </a>
          </div>

          <div className="plan pro">
            <div className="pro-body">
              <h3>{PRICING.planName}</h3>
              <div className="seg" role="group" aria-label={t.period}>
                {prices.map((p, i) => (
                  <button key={p.id} type="button" aria-pressed={i === idx} onClick={() => setIdx(i)}>
                    {p.label[lang] || p.label.id}
                  </button>
                ))}
              </div>
              {price && (
                <div className="price" id="priceVal">
                  {formatRupiah(price.amount)}{" "}
                  <small>
                    /{periodWord(price.days)}
                    {price.note?.[lang] ? ` · ${price.note[lang]}` : ""}
                  </small>
                </div>
              )}
              <ul>
                {PRICING.features.map((f) => (
                  <li key={f.id}>{f[lang] || f.id}</li>
                ))}
              </ul>
              {loggedIn ? (
                <div style={{ display: "grid", gap: 10, marginTop: "auto" }}>
                  <button type="button" className="btn btn-solid" style={{ justifySelf: "start" }} onClick={pay} disabled={loading || !price} id="payBtn">
                    {loading ? t.paying : fill(t.pay, { price: price ? formatRupiah(price.amount) : "" })}
                  </button>
                  {errorMsg && <p className="pay-err">{errorMsg}</p>}
                  <p style={{ fontSize: 13.5, color: "var(--faint)" }}>{t.payNote}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10, marginTop: "auto" }}>
                  <a className="btn btn-solid" style={{ justifySelf: "start" }} href="/daftar?next=/akun" id="trialBtn">
                    {fill(t.trialCta, { days })}
                  </a>
                  <p style={{ fontSize: 14, color: "var(--soft)" }}>
                    {t.haveAcc}{" "}
                    <a href="/masuk?next=/harga" style={{ color: "var(--text)", fontWeight: 500 }}>
                      {t.login}
                    </a>
                  </p>
                </div>
              )}
            </div>
            <div className="pro-card-zone" aria-hidden="true">
              <span className="orb o-brand spin">
                <i></i>
              </span>
              <span className="spark" style={{ left: 6, top: 24, color: "var(--orange)" }}></span>
              <span className="spark" style={{ right: 30, bottom: 14, color: "var(--faint)" }}></span>
              <div className="mcard">
                <div className="top">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/favicon.svg" alt="" />
                  <span className="tag">{t.member}</span>
                </div>
                <div>
                  <span className="chipc"></span>
                  <div className="nm">
                    Founderku
                    <br />
                    Pro<span className="o">.</span>
                  </div>
                </div>
                <div className="meta">
                  <div>
                    <span>{t.owner}</span>
                    <b>{t.you}</b>
                  </div>
                  <span className="live">{fill(t.free7, { days })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="sec-head" style={{ marginBottom: 18 }}>
          <div>
            <div className="eyebrow">FAQ</div>
            <h2 className="h2">{t.faq}</h2>
          </div>
        </div>
        <div className="faq">
          {t.q.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{fill(a, { days })}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
