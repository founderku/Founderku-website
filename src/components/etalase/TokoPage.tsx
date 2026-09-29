import Link from "next/link";
import { OwnerPreviewBanner } from "@/components/OwnerPreviewBanner";
import { toWhatsAppLink } from "@/lib/validators";
import { pagePriceText, pageWaMessage } from "@/lib/pagePrice";
import { storeTitle, styleOf } from "@/lib/storeStyles";
import type { PageRow, StoreStyleId } from "@/lib/types";
import { ETALASE_FONTS } from "./fonts";
import s from "./etalase.module.css";
import { KIND_TEXT, Photo, WaIcon, discountOf, kindOf, rupiah, type PageKind } from "./parts";
import { ShareButton } from "./ShareButton";

export interface TokoData {
  storeSlug: string;
  isPro: boolean;
  products: PageRow[];
}

function Tile({ p }: { p: PageRow }) {
  const hasPrice = p.promo_price !== null && p.promo_price !== undefined;
  const disc = hasPrice ? discountOf(p.original_price, p.promo_price) : null;
  const wa = p.whatsapp_number
    ? toWhatsAppLink(p.whatsapp_number, pageWaMessage(p.product_name, p.promo_price, p.price_unit))
    : "#";
  return (
    <article className={s.tile}>
      <Link href={`/l/${p.slug}`} aria-label={p.product_name}>
        <Photo src={p.image_url} alt={p.product_name} discountPct={disc?.pct} />
      </Link>
      <div className={s.tileBody}>
        <Link href={`/l/${p.slug}`} className={s.tileName}>
          {p.product_name}
        </Link>
        {p.tagline && <p className={s.tileTag}>{p.tagline}</p>}
        <div className={s.tilePrice}>
          <b>{pagePriceText(p.promo_price, p.price_unit)}</b>
          {disc && p.original_price ? <s>{rupiah(p.original_price)}</s> : null}
        </div>
        <div className={s.tileActions}>
          <Link href={`/l/${p.slug}`} className={s.tileBtn}>
            Lihat
          </Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" className={s.tileWa} aria-label={`Chat penjual soal ${p.product_name}`}>
            <WaIcon />
          </a>
        </div>
      </div>
    </article>
  );
}

// Halaman toko Pajangin (/toko/[storeSlug]). Memakai tema yang sama
// persis dengan halaman produk, jadi satu toko terasa satu merek.
export function TokoPage({
  data,
  style,
  isOwner = false,
  preview = false,
}: {
  data: TokoData;
  style: StoreStyleId;
  isOwner?: boolean;
  preview?: boolean;
}) {
  const theme = styleOf(style);
  const title = storeTitle(data.storeSlug);
  const groups = (["produk", "jasa", "lainnya"] as PageKind[])
    .map((k) => ({ kind: k, items: data.products.filter((p) => kindOf(p.kind) === k) }))
    .filter((g) => g.items.length > 0);
  const heroPhoto = theme.hero === "cover" ? data.products.find((p) => p.image_url)?.image_url ?? null : null;
  const contact = data.products.find((p) => p.whatsapp_number)?.whatsapp_number;
  const promoCount = data.products.filter((p) => discountOf(p.original_price, p.promo_price)).length;
  const contactLink = contact
    ? toWhatsAppLink(contact, `Halo! Saya lihat toko ${title} dari web. Boleh tanya-tanya?`)
    : null;

  const page = (
    <div className={`${s.root} ${preview ? s.preview : ""} ${ETALASE_FONTS}`} data-pj={theme.id} data-hero={theme.hero}>
      <section className={s.shopHero} data-photo={heroPhoto ? "1" : undefined}>
        <header className={s.top} style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
          <Link href="/pajangin" className={s.logo} aria-label="Pajangin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pajangin-assets/logo.jpeg" alt="" />
          </Link>
          <span className={s.spacer} />
          <ShareButton title={title} />
        </header>
        {heroPhoto && <Photo src={heroPhoto} alt="" eager />}
        <div className={s.shopHeroInner}>
          <span className={s.eyebrow}>Toko di Pajangin</span>
          <h1 className={s.title}>{title}</h1>
          <div className={s.shopStats}>
            {groups.length === 0 && <span>Belum ada yang dipajang</span>}
            {groups.map((g) => (
              <span key={g.kind}>
                {g.items.length} {KIND_TEXT[g.kind].items.toLowerCase()}
              </span>
            ))}
            {promoCount > 0 && <span>{promoCount} lagi promo</span>}
          </div>
          {contactLink && (
            <a href={contactLink} target="_blank" rel="noopener noreferrer" className={s.cta}>
              <WaIcon />
              Chat penjual
            </a>
          )}
        </div>
      </section>

      <div className={s.wrap}>
        {groups.length === 0 ? (
          <p className={s.empty}>Toko ini belum punya produk aktif saat ini. Coba lagi lain waktu.</p>
        ) : (
          groups.map((g) => (
            <section key={g.kind} className={s.shopSection}>
              {groups.length > 1 && (
                <h2 className={s.shopSectionTitle}>
                  {KIND_TEXT[g.kind].items} <small>{g.items.length}</small>
                </h2>
              )}
              <div className={s.grid}>
                {g.items.map((p) => (
                  <Tile key={p.id} p={p} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <footer className={s.foot}>
        {!data.isPro ? (
          <>
            Toko ini dibuat gratis dengan <Link href="/pajangin">Pajangin</Link>
          </>
        ) : (
          title
        )}
      </footer>
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
