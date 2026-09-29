"use client";

// Halaman Jelajah Social Space: daftar tawaran tukar skill terbuka,
// pencarian skill, dan kartu ajakan (masuk, buat profil, atau pindahkan
// profil TukarSkill lama).

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HANDLE_RE, fill, matchScore, niceError, suggestHandle, useT, type SsLegacyPost, type SsPost, type SsProfile } from "./ss";
import { LegacyPostCard, PostCard, SsTabs } from "./SsUi";

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

export function SsFeed({ userId, isAdmin, initialQuery }: { userId: string | null; isAdmin: boolean; initialQuery: string }) {
  const { t } = useT();
  const [posts, setPosts] = useState<SsPost[] | null>(null);
  const [oldPosts, setOldPosts] = useState<SsLegacyPost[]>([]);
  const [me, setMe] = useState<SsProfile | null>(null);
  const [meLoaded, setMeLoaded] = useState(!userId);
  const [legacy, setLegacy] = useState<Legacy | null>(null);
  const [q, setQ] = useState(initialQuery);
  const [format, setFormat] = useState("");
  const [onlyMatch, setOnlyMatch] = useState(false);
  const [err, setErr] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("ss_posts")
      .select("*, ss_profiles(user_id, handle, name, headline, city)")
      .eq("status", "open")
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(300)
      .then(({ data, error }) => {
        if (error) setErr(niceError(error.message, t));
        setPosts(((data ?? []) as SsPost[]).filter((p) => p.ss_profiles));
      });
    // Tawaran TukarSkill lama yang pemiliknya belum pindah (tanpa email)
    supabase
      .from("ss_legacy_posts")
      .select("id, owner_name, owner_city, offer, want, format, duration, description, posted_at")
      .order("posted_at", { ascending: false })
      .limit(300)
      .then(({ data }) => setOldPosts((data ?? []) as SsLegacyPost[]));
    if (userId) {
      supabase
        .from("ss_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()
        .then(({ data }) => {
          setMe((data as SsProfile) ?? null);
          setMeLoaded(true);
        });
      supabase.rpc("ss_legacy_preview").then(({ data }) => setLegacy(((data as Legacy[]) ?? [])[0] ?? null));
    }
    // t hanya untuk teks error; tidak perlu memuat ulang saat bahasa berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, reload]);

  const shown = useMemo(() => {
    if (!posts) return [];
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return posts
      .filter((p) => !format || p.format === format)
      .filter((p) => {
        if (!words.length) return true;
        const hay = [...p.offer, ...p.want, p.description, p.ss_profiles?.name ?? "", p.ss_profiles?.city ?? ""].join(" ").toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .map((p) => {
        const m = matchScore(p, me);
        return { p, score: p.user_id === userId ? -1 : m.gives.length * 2 + m.takes.length };
      })
      .filter((x) => !onlyMatch || x.score > 0)
      .sort((a, b) => b.score - a.score || +new Date(b.p.created_at) - +new Date(a.p.created_at))
      .map((x) => x.p);
  }, [posts, q, format, onlyMatch, me, userId]);

  const shownOld = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return oldPosts
      .filter((p) => !format || p.format === format)
      .filter((p) => {
        if (!words.length) return true;
        const hay = [...p.offer, ...p.want, p.description, p.owner_name, p.owner_city].join(" ").toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .map((p) => {
        const m = matchScore(p, me);
        return { p, score: m.gives.length * 2 + m.takes.length };
      })
      .filter((x) => !onlyMatch || x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);
  }, [oldPosts, q, format, onlyMatch, me]);

  return (
    <>
      <section className="band hero-band" style={{ borderTop: 0 }}>
        <div className="hero-top">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h1 className="h1">
              <Dotted text={t.heroH} />
            </h1>
          </div>
          <p>{t.heroSub}</p>
        </div>
      </section>

      <section className="band flush">
        <div className="ss-wrap">
          <SsTabs active="feed" userId={userId} isAdmin={isAdmin} />

          {!userId ? (
            <div className="ss-card" style={{ marginBottom: 20 }}>
              <b style={{ fontWeight: 500, fontSize: 18 }}>{t.loginCta}</b>
              <p className="ss-sub">{t.loginSub}</p>
              <div className="ss-actions">
                <Link className="btn btn-solid btn-sm" href={`/masuk?next=${encodeURIComponent("/social-space/tukar-skill")}`}>
                  {t.login}
                </Link>
                <Link className="btn btn-line btn-sm" href={`/daftar?next=${encodeURIComponent("/social-space/tukar-skill")}`}>
                  {t.signup}
                </Link>
              </div>
            </div>
          ) : !meLoaded ? null : legacy && !me?.from_tukarskill ? (
            <LegacyCard legacy={legacy} hasProfile={!!me} onDone={() => { setLegacy(null); setReload((n) => n + 1); }} />
          ) : !me ? (
            <div className="ss-card" style={{ marginBottom: 20 }}>
              <b style={{ fontWeight: 500, fontSize: 18 }}>{t.makeProfile}</b>
              <p className="ss-sub">{t.makeProfileSub}</p>
              <div className="ss-actions">
                <Link className="btn btn-solid btn-sm" href="/social-space/profil">
                  {t.makeProfile}
                </Link>
              </div>
            </div>
          ) : null}

          <div className="ss-tools">
            <input className="ss-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} />
            <select className="ss-input" value={format} onChange={(e) => setFormat(e.target.value)} aria-label={t.pFormat}>
              <option value="">{t.allFormats}</option>
              <option value="online">{t.online}</option>
              <option value="offline">{t.offline}</option>
              <option value="hybrid">{t.hybrid}</option>
            </select>
            {me && (
              <label className="ss-check">
                <input type="checkbox" checked={onlyMatch} onChange={(e) => setOnlyMatch(e.target.checked)} />
                {t.onlyMatch}
              </label>
            )}
            {me && (
              <Link className="btn btn-solid btn-sm" href="/social-space/tawaran/baru" style={{ marginLeft: "auto" }}>
                {t.newPost}
              </Link>
            )}
          </div>

          {err && <p className="ss-msg bad">{err}</p>}
          {posts === null ? (
            <p className="ss-empty">{t.loading}</p>
          ) : shown.length + shownOld.length === 0 ? (
            <p className="ss-empty">{posts.length + oldPosts.length ? t.noPosts : t.noPostsAll}</p>
          ) : (
            <div className="ss-grid">
              {shown.map((p) => (
                <PostCard key={p.id} post={p} me={me} userId={userId} />
              ))}
              {shownOld.map((p) => (
                <LegacyPostCard key={p.id} post={p} me={me} userId={userId} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function LegacyCard({ legacy, hasProfile, onDone }: { legacy: Legacy; hasProfile: boolean; onDone: () => void }) {
  const { t } = useT();
  const [handle, setHandle] = useState(() => suggestHandle(legacy.full_name || "founder"));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function claim() {
    if (!hasProfile && !HANDLE_RE.test(handle)) {
      setMsg({ ok: false, text: t.errHandle });
      return;
    }
    setBusy(true);
    const { error } = await createClient().rpc("ss_claim_legacy", { p_handle: handle });
    setBusy(false);
    if (error) setMsg({ ok: false, text: niceError(error.message, t) });
    else {
      setMsg({ ok: true, text: t.legacyDone });
      setTimeout(onDone, 1200);
    }
  }

  return (
    <div className="ss-card" style={{ marginBottom: 20 }}>
      <span className="ss-badge">{t.fromTs}</span>
      <b style={{ display: "block", fontWeight: 500, fontSize: 18, marginTop: 10 }}>{t.legacyH}</b>
      <p className="ss-sub">{fill(t.legacySub, { name: legacy.full_name || t.someone })}</p>
      {!hasProfile && (
        <label className="ss-field" style={{ marginTop: 14, maxWidth: 420 }}>
          <span>{t.legacyHandle}</span>
          <input className="ss-input" value={handle} maxLength={30} onChange={(e) => setHandle(e.target.value.toLowerCase())} />
          <small>{fill(t.fHandleHint, { handle: handle || "..." })}</small>
        </label>
      )}
      <div className="ss-actions">
        <button type="button" className="btn btn-solid btn-sm" disabled={busy} onClick={claim}>
          {t.legacyGo}
        </button>
      </div>
      {msg && <p className={`ss-msg ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}
    </div>
  );
}
