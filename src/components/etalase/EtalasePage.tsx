import Link from "next/link";
import { OwnerPreviewBanner } from "@/components/OwnerPreviewBanner";
import { toWhatsAppLink } from "@/lib/validators";
import { pageWaMessage } from "@/lib/pagePrice";
import { storeTitle, styleOf } from "@/lib/storeStyles";
import type { StoreStyleId } from "@/lib/types";
import { ETALASE_FONTS } from "./fonts";
import s from "./etalase.module.css";
import { KIND_TEXT, Photo, STEPS, WaIcon, discountOf, kindOf, rupiah } from "./parts";
import { ShareButton } from "./ShareButton";

export interface EtalaseData {
  productName: string;
  tagline: string;
  originalPrice: number | null;
  promoPrice: number | null;
  highlights: string[];
  imageUrl: string | null;
  whatsappNumber: string;
  showWatermark: boolean;
  storeSlug: string | null;
  priceUnit?: string | null;
  kind?: string | null;
}

const MARKS = {
  check: () => "✓",
  number: (i: number) => String(i + 1).padStart(2, "0"),
  spark: () => "✦",
  arrow: () => "→",
  leaf: () => "❀",
};

// Halaman produk Pajangin (/l/[slug]). Dipakai juga oleh preview di
// editor dan halaman pilih style, jadi tampilannya selalu sama persis.
export function EtalasePage({
  data,
  style,
  isOwner = false,
  preview = false,
}: {
  data: EtalaseData;
  style: StoreStyleId;
  isOwner?: boolean;
  // preview = ditampilkan di dalam bingkai HP (editor), bukan halaman penuh
  preview?: boolean;
}) {
  const theme = styleOf(style);
  const kind = kindOf(data.kind);
  const kt = KIND_TEXT[kind];
  const name = data.productName.trim() || "Nama produk";
  const tagline = data.tagline.trim();
  const highlights = data.highlights.map((h) => h.trim()).filter(Boolean);
  const hasPrice = data.promoPrice !== null && data.promoPrice !== undefined && !Number.isNaN(Number(data.promoPrice));
  const disc = hasPrice ? discountOf(data.originalPrice, data.promoPrice) : null;
  const unit = hasPrice ? (data.priceUnit ?? "").trim() : "";
  const priceText = hasPrice ? rupiah(Number(data.promoPrice)) : "Tanya harga";
  const waLink = data.whatsappNumber
    ? toWhatsAppLink(data.whatsappNumber, pageWaMessage(name, data.promoPrice, data.priceUnit))
    : "#";
  const ctaText = hasPrice ? kt.cta : "Tanya harga via WhatsApp";
  const store = storeTitle(data.storeSlug);
  const eyebrow = store ? `${kt.label} · ${store}` : kt.label;

  const top = (
    <header className={s.top}>
      <Link href="/pajangin" className={s.logo} aria-label="Pajangin">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pajangin-assets/logo.jpeg" alt="" />
      </Link>
      {data.storeSlug && (
        <Link href={`/toko/${data.storeSlug}`} className={s.storeChip}>
          {store}
        </Link>
      )}
      <span className={s.spacer} />
      <ShareButton title={name} />
    </header>
  );

  const titleBlock = (withTagline: boolean) => (
    <>
      <span className={s.eyebrow}>{eyebrow}</span>
      <h1 className={s.title}>{name}</h1>
      {withTagline && tagline && <p className={s.tagline}>{tagline}</p>}
    </>
  );

  const price = (
    <div className={s.priceRow}>
      <span className={s.priceNew}>
        {priceText}
        {unit && <span className={s.priceUnit}> {unit}</span>}
      </span>
      {disc && data.originalPrice ? <span className={s.priceOld}>{rupiah(data.originalPrice)}</span> : null}
      {disc && <span className={s.save}>Hemat {rupiah(disc.amount)}</span>}
    </div>
  );

  const details = (withPrice: boolean) => (
    <>
      {withPrice && price}
      {highlights.length > 0 && (
        <ul className={s.hl}>
          {highlights.map((h, i) => (
            <li key={i}>
              <span className={s.hlMark} aria-hidden="true">
                {MARKS[theme.mark](i)}
              </span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
      <a href={waLink} target="_blank" rel="noopener noreferrer" className={s.cta}>
        <WaIcon />
        {ctaText}
      </a>
      <p className={s.note}>Transaksi langsung dengan penjual lewat WhatsApp.</p>
      {data.storeSlug && (
        <Link href={`/toko/${data.storeSlug}`} className={s.storeLink}>
          Lihat semua dari {store}
        </Link>
      )}
    </>
  );

  let hero: React.ReactNode;
  if (theme.hero === "card") {
    hero = (
      <>
        {top}
        <section className={s.band}>
          <div className={s.bandInner}>{titleBlock(true)}</div>
        </section>
        <div className={s.cardWrap}>
          <article className={s.card}>
            <Photo src={data.imageUrl} alt={name} discountPct={disc?.pct} watermark={data.showWatermark} eager />
            <div className={s.cardBody}>{details(true)}</div>
          </article>
        </div>
      </>
    );
  } else if (theme.hero === "cover") {
    hero = (
      <>
        <section className={s.cover}>
          {top}
          <Photo src={data.imageUrl} alt={name} discountPct={disc?.pct} eager />
          <div className={s.coverText}>{titleBlock(true)}</div>
        </section>
        {highlights.length > 0 && (
          <div className={s.marquee} aria-hidden="true">
            <div className={s.marqueeTrack}>
              {[...highlights, ...highlights, ...highlights, ...highlights].map((h, i) => (
                <span key={i}>{h}</span>
              ))}
            </div>
          </div>
        )}
        <div className={`${s.column} ${s.coverBody}`}>{details(true)}</div>
      </>
    );
  } else if (theme.hero === "split") {
    hero = (
      <>
        {top}
        <section className={s.split}>
          <Photo src={data.imageUrl} alt={name} discountPct={disc?.pct} watermark={data.showWatermark} eager />
          <div className={s.splitInfo}>
            {titleBlock(true)}
            <div style={{ marginTop: 20 }}>{details(true)}</div>
          </div>
        </section>
      </>
    );
  } else if (theme.hero === "arch") {
    hero = (
      <>
        {top}
        <section className={s.archHead}>{titleBlock(false)}</section>
        <div className={s.arch}>
          <Photo src={data.imageUrl} alt={name} discountPct={disc?.pct} eager />
        </div>
        <div className={`${s.column} ${s.archBody}`}>
          {tagline && <p className={s.tagline} style={{ marginTop: 0, marginBottom: 18 }}>{tagline}</p>}
          {details(true)}
        </div>
      </>
    );
  } else {
    hero = (
      <>
        {top}
        <section className={s.stickerHead}>{titleBlock(true)}</section>
        <div className={s.stickerWrap}>
          <Photo src={data.imageUrl} alt={name} discountPct={disc?.pct} eager />
          <div className={s.stickerPrice}>
            {disc && data.originalPrice ? <small>{rupiah(data.originalPrice)}</small> : null}
            {priceText}
            {unit && <span className={s.priceUnit}> {unit}</span>}
          </div>
        </div>
        <div className={`${s.column} ${s.stickerBody}`}>{details(false)}</div>
      </>
    );
  }

  const page = (
    <div className={`${s.root} ${preview ? s.preview : ""} ${ETALASE_FONTS}`} data-pj={theme.id} data-hero={theme.hero}>
      {hero}

      <section className={s.steps}>
        <div className={s.column}>
          <h2 className={s.stepsTitle}>{kt.steps}</h2>
          <ol className={s.stepList}>
            {STEPS[kind].map(([t, d], i) => (
              <li key={i}>
                <span className={s.stepNum}>{i + 1}</span>
                <span className={s.stepText}>
                  <strong>{t}</strong>
                  <span>{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className={s.foot}>
        {data.showWatermark ? (
          <>
            Halaman ini dibuat gratis dengan <Link href="/pajangin">Pajangin</Link>
          </>
        ) : (
          store || name
        )}
      </footer>

      <div className={s.sticky}>
        <div className={s.stickyInner}>
          <span className={s.stickyText}>
            <span className={s.stickyName}>{name}</span>
            <span className={s.stickyPrice}>
              {priceText}
              {unit ? ` ${unit}` : ""}
            </span>
          </span>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={s.stickyCta}>
            <WaIcon />
            {hasPrice ? kt.short : "Tanya"}
          </a>
        </div>
      </div>
    </div>
  );

  if (preview) return page;
  return (
    <>
      {isOwner && <OwnerPreviewBanner />}
      <div className={isOwner ? "pt-9" : undefined}>{page}</div>
    </>
  );
}
