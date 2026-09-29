"use client";

// Tab Etalase Social Space: halaman Pajangin (produk, jasa, lainnya) yang
// pemiliknya aktifkan untuk tampil di Social Space. Transaksi terjadi
// langsung dengan penjual lewat halaman Pajangin-nya.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { niceError, priceLabel, useT, type SsEtalaseItem } from "./ss";
import { ReportButton, SsTabs, Stars } from "./SsUi";

export function SsEtalase({ userId, isAdmin }: { userId: string | null; isAdmin: boolean }) {
  const { t } = useT();
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

  return (
    <section className="band hero-band" style={{ borderTop: 0 }}>
      <div className="ss-wrap">
        <SsTabs active="etalase" userId={userId} isAdmin={isAdmin} />
        <div className="ss-head">
          <div>
            <h1 className="ss-h">{t.etH}</h1>
            <p className="ss-sub">{t.etSub}</p>
          </div>
          <Link className="btn btn-line btn-sm" href={userId ? "/pajangin/dashboard" : "/pajangin"}>
            {t.etJoinCta}
          </Link>
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
        ) : shown.length === 0 ? (
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
                <div className="ss-meta">
                  {it.seller_handle ? (
                    <Link href={`/social-space/u/${it.seller_handle}`}>{it.seller_name}</Link>
                  ) : (
                    <span>{t.sellerPajangin}</span>
                  )}
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
      </div>
    </section>
  );
}
