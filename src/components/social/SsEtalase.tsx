"use client";

// Tab Etalase Social Space: halaman Pajangin (produk, jasa, lainnya) yang
// pemiliknya aktifkan untuk tampil di Social Space. Transaksi terjadi
// langsung dengan penjual lewat halaman Pajangin-nya.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { niceError, priceLabel, useT, type SsEtalaseItem, type SsProfile } from "./ss";
import { LegacyCard } from "./SsFeed";
import { ETALASE_SAMPLES } from "./etalaseSamples";
import { Avatar, ReportButton, SsTabs, Stars } from "./SsUi";

type Legacy = { full_name: string; headline: string; city: string; skills_offer: string[]; skills_want: string[] };

function Dotted({ text }: { text: string }) {
  if (!text.endsWith(".")) return <>{text}</>;
  return (
    <>
      {text.slice(0, -1)}
      <span className="o">.</span>
    </>
  );
}

// Kartu pindah profil TukarSkill lama, muncul di halaman utama Social Space
function ClaimBanner({ userId }: { userId: string }) {
  const [state, setState] = useState<{ legacy: Legacy | null; me: SsProfile | null } | null>(null);
  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.rpc("ss_legacy_preview"),
      supabase.from("ss_profiles").select("*").eq("user_id", userId).maybeSingle(),
    ]).then(([lg, me]) => setState({ legacy: ((lg.data as Legacy[]) ?? [])[0] ?? null, me: (me.data as SsProfile) ?? null }));
  }, [userId]);
  if (!state?.legacy || state.me?.from_tukarskill) return null;
  return <LegacyCard legacy={state.legacy} hasProfile={!!state.me} onDone={() => setState(null)} />;
}

export function SsEtalase({ userId, isAdmin, landing = false }: { userId: string | null; isAdmin: boolean; landing?: boolean }) {
  const { t, lang } = useT();
  const [items, setItems] = useState<SsEtalaseItem[] | null>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    createClient()
      .rpc("ss_etalase")
      .then(({ data, error }) => {
        if (error) setErr(niceError(error.message, t));
        setItems((data ?? []) as SsEtalaseItem[]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return (items ?? [])
      .filter((it) => !kind || it.kind === kind)
      .filter((it) => {
        if (!words.length) return true;
        const hay = [it.product_name, it.tagline, it.seller_name ?? "", it.seller_city ?? ""].join(" ").toLowerCase();
        return words.every((w) => hay.includes(w));
      });
  }, [items, q, kind]);

  // Contoh berlabel hanya muncul saat penjual sungguhan masih sedikit dan
  // tidak sedang mencari, lalu otomatis hilang begitu Etalase ramai.
  const SAMPLE_UNTIL = 6;
  const samples =
    items !== null && !q.trim() && items.length < SAMPLE_UNTIL
      ? ETALASE_SAMPLES.filter((s) => !kind || s.kind === kind)
      : [];

  const body = (
      <div className="ss-wrap">
        <SsTabs active="etalase" userId={userId} isAdmin={isAdmin} />
        {userId && <ClaimBanner userId={userId} />}
        <div className="ss-head">
          <div>
            {landing ? <h2 className="ss-h">{t.etH}</h2> : <h1 className="ss-h">{t.etH}</h1>}
            <p className="ss-sub">{t.etSub}</p>
          </div>
        </div>

        {/* Cara jual: Etalase diisi dari halaman Pajangin */}
        <div className="ss-sell">
          <div className="ss-sell-txt">
            <b>{t.sellH}</b>
            <ol>
              <li>{t.sell1}</li>
              <li>{t.sell2}</li>
              <li>{t.sell3}</li>
            </ol>
          </div>
          <div className="ss-sell-cta">
            <Link className="btn btn-solid btn-sm" href={userId ? "/pajangin/dashboard/new" : "/pajangin"}>
              {t.sellCta}
            </Link>
            {userId && (
              <Link className="btn btn-line btn-sm" href="/social-space/profil">
                {t.sellProfile}
              </Link>
            )}
          </div>
        </div>
        <div className="notice">{t.etDisclaimer}</div>

        <div className="ss-tools">
          <input className="ss-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.etSearch} aria-label={t.etSearch} />
          <div className="ss-tabs" style={{ margin: 0 }} role="group">
            {["", "produk", "jasa", "lainnya"].map((k) => (
              <a
                key={k || "all"}
                href="#"
                aria-current={kind === k ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setKind(k);
                }}
              >
                {k ? t.kind[k] : t.etAll}
              </a>
            ))}
          </div>
        </div>

        {err && <p className="ss-msg bad">{err}</p>}
        {items === null ? (
          <p className="ss-empty">{t.loading}</p>
        ) : shown.length === 0 && items.length === 0 && !q.trim() ? null : shown.length === 0 ? (
          <div className="ss-empty">
            <p>{items.length ? t.etNone : t.etEmpty}</p>
            <p className="ss-sub" style={{ margin: "8px auto 0" }}>{t.etJoin}</p>
          </div>
        ) : (
          <div className="ss-grid">
            {shown.map((it) => (
              <article key={it.id} className="ss-card ss-et">
                <a href={`/l/${it.slug}`} className="ss-et-img" aria-label={it.product_name}>
                  {it.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image_url} alt="" loading="lazy" />
                  ) : (
                    <span>{it.product_name.slice(0, 1).toUpperCase()}</span>
                  )}
                </a>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  <span className="ss-badge gray">{t.kind[it.kind] ?? it.kind}</span>
                  {it.has_pro && <span className="ss-badge">{t.proBadge}</span>}
                </div>
                <h2 className="ss-et-name">{it.product_name}</h2>
                {it.tagline && <p className="ss-desc" style={{ marginTop: 4 }}>{it.tagline}</p>}
                <p className="ss-et-price">
                  {it.original_price && it.promo_price !== null ? (
                    <s>{priceLabel(it.original_price, "", "")}</s>
                  ) : null}{" "}
                  {priceLabel(it.promo_price, it.price_unit, t.askPrice)}
                </p>
                {it.seller_handle && it.seller_name ? (
                  <Link className="ss-who ss-et-seller" href={`/social-space/u/${it.seller_handle}`}>
                    <Avatar name={it.seller_name} />
                    <span style={{ minWidth: 0 }}>
                      <small>{t.soldBy}</small>
                      <b>{it.seller_name}</b>
                    </span>
                  </Link>
                ) : null}
                <div className="ss-meta">
                  {!it.seller_handle && <span>{t.sellerPajangin}</span>}
                  {it.seller_city && <span>{it.seller_city}</span>}
                  {it.reviews > 0 && it.rating !== null && (
                    <span>
                      <Stars value={Number(it.rating)} /> {Number(it.rating).toFixed(1)} ({it.reviews})
                    </span>
                  )}
                </div>
                <div className="ss-actions">
                  <a className="btn btn-solid btn-sm" href={`/l/${it.slug}`}>
                    {t.view}
                  </a>
                  <ReportButton targetType="page" targetId={it.id} userId={userId} />
                </div>
              </article>
            ))}
          </div>
        )}

        {samples.length > 0 && (
          <section className="ss-samples" aria-labelledby="ss-samples-h">
            <h3 id="ss-samples-h" className="ss-samples-h">{t.etSampleH}</h3>
            <p className="ss-sub" style={{ marginTop: 4 }}>{t.etSampleNote}</p>
            <div className="ss-grid" style={{ marginTop: 14 }}>
              {samples.map((s) => (
                <article key={s.key} className="ss-card ss-et ss-sample">
                  <span className="ss-et-img" style={{ background: `linear-gradient(135deg, ${s.hue[0]}, ${s.hue[1]})` }} aria-hidden="true">
                    <span>{s.name[lang].slice(0, 1).toUpperCase()}</span>
                  </span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    <span className="ss-badge gray">{t.kind[s.kind] ?? s.kind}</span>
                    <span className="ss-badge ss-badge-sample">{t.sampleBadge}</span>
                  </div>
                  <h2 className="ss-et-name">{s.name[lang]}</h2>
                  <p className="ss-desc" style={{ marginTop: 4 }}>{s.tagline[lang]}</p>
                  <p className="ss-et-price">{priceLabel(s.price, s.unit[lang], t.askPrice)}</p>
                  <div className="ss-meta">
                    <span>{s.seller}</span>
                    <span>{s.city}</span>
                  </div>
                  <div className="ss-actions">
                    <Link className="btn btn-line btn-sm" href={userId ? "/pajangin/dashboard/new" : "/pajangin"}>
                      {t.sampleCta}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
  );

  if (!landing) {
    return (
      <section className="band hero-band" style={{ borderTop: 0 }}>
        {body}
      </section>
    );
  }
  return (
    <>
      <section className="band hero-band" style={{ borderTop: 0 }}>
        <div className="hero-top">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h1 className="h1">
              <Dotted text={t.landingH} />
            </h1>
          </div>
          <p>{t.landingSub}</p>
        </div>
      </section>
      <section className="band flush">{body}</section>
    </>
  );
}
