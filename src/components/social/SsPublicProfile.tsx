"use client";

// Profil publik seorang founder: skill, tautan, tawaran terbuka, ulasan.

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fill, fmtDate, priceLabel, useT, type SsEtalaseItem, type SsPost, type SsProfile, type SsReview } from "./ss";
import { Avatar, PostCard, ReportButton, SkillChips, SsTabs, Stars } from "./SsUi";

type ReviewRow = SsReview & { reviewer: { handle: string; name: string } | null };

export function SsPublicProfile({ handle, userId, isAdmin }: { handle: string; userId: string | null; isAdmin: boolean }) {
  const { t, lang } = useT();
  const [p, setP] = useState<SsProfile | null | undefined>(undefined);
  const [me, setMe] = useState<SsProfile | null>(null);
  const [posts, setPosts] = useState<SsPost[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [shop, setShop] = useState<SsEtalaseItem[]>([]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.from("ss_profiles").select("*").eq("handle", handle).maybeSingle();
      const prof = (data as SsProfile) ?? null;
      setP(prof);
      if (!prof) return;
      const [po, rv] = await Promise.all([
        supabase
          .from("ss_posts")
          .select("*, ss_profiles(user_id, handle, name, headline, city)")
          .eq("user_id", prof.user_id)
          .eq("status", "open")
          .eq("hidden", false)
          .order("created_at", { ascending: false }),
        supabase
          .from("ss_reviews")
          .select("*, reviewer:ss_profiles!ss_reviews_reviewer_id_fkey(handle, name)")
          .eq("reviewee_id", prof.user_id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      setPosts((po.data ?? []) as SsPost[]);
      setReviews((rv.data ?? []) as ReviewRow[]);
      const { data: et } = await supabase.rpc("ss_etalase");
      setShop(((et ?? []) as SsEtalaseItem[]).filter((it) => it.seller_handle === prof.handle));
    })();
    if (userId) {
      supabase
        .from("ss_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()
        .then(({ data }) => setMe((data as SsProfile) ?? null));
    }
  }, [handle, userId]);

  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const links = p
    ? ([
        ["Website", p.website],
        ["Instagram", p.instagram],
        ["LinkedIn", p.linkedin],
      ] as [string, string][]).filter(([, u]) => /^https:\/\//.test(u))
    : [];

  return (
    <section className="band hero-band" style={{ borderTop: 0 }}>
      <div className="ss-wrap">
        <SsTabs active={userId && me?.handle === handle ? "profile" : "etalase"} userId={userId} isAdmin={isAdmin} back="/social-space" />
        {p === undefined ? (
          <p className="ss-empty">{t.loading}</p>
        ) : p === null ? (
          <div className="ss-card ss-empty">
            <p>{t.notFound}</p>
            <div className="ss-actions" style={{ justifyContent: "center" }}>
              <Link className="btn btn-line btn-sm" href="/social-space">
                {t.back}
              </Link>
            </div>
          </div>
        ) : (
          <div className="ss-side">
            <div>
              <div className="ss-card">
                <div className="ss-profile-top">
                  <Avatar name={p.name} large />
                  <div style={{ minWidth: 0 }}>
                    <h1 className="ss-h">{p.name}</h1>
                    <p style={{ color: "var(--soft)" }}>{[p.headline, p.city].filter(Boolean).join(" · ")}</p>
                    <div className="ss-meta" style={{ marginTop: 6 }}>
                      <span>@{p.handle}</span>
                      <span>{fill(t.memberSince, { date: fmtDate(p.created_at, lang) })}</span>
                      {p.from_tukarskill && <span className="ss-badge">{t.fromTs}</span>}
                    </div>
                  </div>
                </div>
                {p.bio && (
                  <>
                    <div className="ss-lbl" style={{ marginTop: 18 }}>{t.about}</div>
                    <p className="ss-desc" style={{ marginTop: 0 }}>{p.bio}</p>
                  </>
                )}
                {p.experience && (
                  <>
                    <div className="ss-lbl">{t.expH}</div>
                    <p className="ss-desc" style={{ marginTop: 0 }}>{p.experience}</p>
                  </>
                )}
                {p.skills_offer.length > 0 && (
                  <>
                    <div className="ss-lbl">{t.offers}</div>
                    <SkillChips skills={p.skills_offer} hits={me?.skills_want} />
                  </>
                )}
                {p.skills_want.length > 0 && (
                  <>
                    <div className="ss-lbl">{t.wants}</div>
                    <SkillChips skills={p.skills_want} hits={me?.skills_offer} />
                  </>
                )}
                {links.length > 0 && (
                  <>
                    <div className="ss-lbl">{t.links}</div>
                    <div className="ss-chips">
                      {links.map(([label, url]) => (
                        <a key={label} className="ss-chip" href={url} target="_blank" rel="noopener noreferrer nofollow ugc">
                          {label} ↗
                        </a>
                      ))}
                    </div>
                  </>
                )}
                <div className="ss-actions">
                  {userId === p.user_id ? (
                    <Link className="btn btn-line btn-sm" href="/social-space/profil">
                      {t.edit}
                    </Link>
                  ) : (
                    <ReportButton targetType="profile" targetId={p.user_id} userId={userId} />
                  )}
                </div>
              </div>

              {shop.length > 0 && (
                <>
                  <h2 style={{ fontSize: 22, margin: "28px 0 12px" }}>{t.shopH}</h2>
                  <div className="ss-grid">
                    {shop.map((it) => (
                      <a key={it.id} className="ss-card ss-et" href={`/l/${it.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <span className="ss-et-img">
                          {it.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.image_url} alt="" loading="lazy" />
                          ) : (
                            <span>{it.product_name.slice(0, 1).toUpperCase()}</span>
                          )}
                        </span>
                        <span className="ss-et-name">{it.product_name}</span>
                        <span className="ss-et-price">{priceLabel(it.promo_price, it.price_unit, t.askPrice)}</span>
                      </a>
                    ))}
                  </div>
                </>
              )}
              {(p.portfolio ?? []).length > 0 && (
                <>
                  <h2 style={{ fontSize: 22, margin: "28px 0 12px" }}>{t.pfH}</h2>
                  <ul className="ss-pf">
                    {p.portfolio.map((w, i) => (
                      <li key={i}>
                        {w.url && /^https:\/\//.test(w.url) ? (
                          <a href={w.url} target="_blank" rel="noopener noreferrer nofollow ugc">
                            <b>{w.title}</b> ↗
                          </a>
                        ) : (
                          <b>{w.title}</b>
                        )}
                        {w.note && <small>{w.note}</small>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <h2 style={{ fontSize: 22, margin: "28px 0 12px" }}>{t.openPosts}</h2>
              {posts.length === 0 ? (
                <p className="ss-sub">{t.noOpenPosts}</p>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} me={me} userId={userId} showOwner={false} />)
              )}
            </div>

            <div className="ss-card">
              <b style={{ fontWeight: 500, fontSize: 18 }}>{t.reviews}</b>
              {reviews.length > 0 && (
                <p style={{ marginTop: 6 }}>
                  <Stars value={avg} /> <span style={{ color: "var(--soft)" }}>{avg.toFixed(1)} · {fill(t.swaps, { n: reviews.length })}</span>
                </p>
              )}
              {reviews.length === 0 ? (
                <p className="ss-sub">{t.noReviews}</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} style={{ borderTop: "1px solid var(--line)", marginTop: 14, paddingTop: 14 }}>
                    <Stars value={r.rating} />
                    {r.comment && <p className="ss-desc" style={{ marginTop: 6 }}>{r.comment}</p>}
                    <div className="ss-meta" style={{ marginTop: 6 }}>
                      {r.reviewer ? <Link href={`/social-space/u/${r.reviewer.handle}`}>{r.reviewer.name}</Link> : <span>{t.someone}</span>}
                      <span>{fmtDate(r.created_at, lang)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
