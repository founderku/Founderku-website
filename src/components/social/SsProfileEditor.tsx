"use client";

// Buat atau ubah profil Social Space milik sendiri, plus daftar tawaran
// milik sendiri.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  HANDLE_RE,
  LINK_RE,
  SS_LIMITS,
  fill,
  niceError,
  normalizeLink,
  suggestHandle,
  useT,
  type SsPost,
  type SsProfile,
} from "./ss";
import { PostCard, SkillInput, SsTabs } from "./SsUi";

type Form = Pick<
  SsProfile,
  "handle" | "name" | "headline" | "bio" | "city" | "skills_offer" | "skills_want" | "website" | "instagram" | "linkedin" | "is_public"
>;

export function SsProfileEditor({ userId, defaultName, isAdmin }: { userId: string; defaultName: string; isAdmin: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const [exists, setExists] = useState<boolean | null>(null);
  const [me, setMe] = useState<SsProfile | null>(null);
  const [posts, setPosts] = useState<SsPost[]>([]);
  const [f, setF] = useState<Form>({
    handle: suggestHandle(defaultName),
    name: defaultName,
    headline: "",
    bio: "",
    city: "",
    skills_offer: [],
    skills_want: [],
    website: "",
    instagram: "",
    linkedin: "",
    is_public: true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("ss_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const p = data as SsProfile | null;
        setExists(!!p);
        setMe(p);
        if (p) {
          setF({
            handle: p.handle,
            name: p.name,
            headline: p.headline,
            bio: p.bio,
            city: p.city,
            skills_offer: p.skills_offer,
            skills_want: p.skills_want,
            website: p.website,
            instagram: p.instagram,
            linkedin: p.linkedin,
            is_public: p.is_public,
          });
        }
      });
    supabase
      .from("ss_posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts((data ?? []) as SsPost[]));
  }, [userId]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  async function save() {
    setMsg(null);
    const data = {
      ...f,
      handle: f.handle.trim().toLowerCase(),
      name: f.name.trim(),
      headline: f.headline.trim(),
      city: f.city.trim(),
      bio: f.bio.trim(),
      website: normalizeLink(f.website),
      instagram: normalizeLink(f.instagram),
      linkedin: normalizeLink(f.linkedin),
    };
    if (!HANDLE_RE.test(data.handle)) return setMsg({ ok: false, text: t.errHandle });
    if (data.name.length < 2) return setMsg({ ok: false, text: t.errName });
    if ([data.website, data.instagram, data.linkedin].some((l) => l && !LINK_RE.test(l))) return setMsg({ ok: false, text: t.errLink });
    setBusy(true);
    const supabase = createClient();
    const { error } = exists
      ? await supabase.from("ss_profiles").update(data).eq("user_id", userId)
      : await supabase.from("ss_profiles").insert({ user_id: userId, ...data });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: niceError(error.message, t) });
    setF(data);
    setExists(true);
    setMsg({ ok: true, text: t.saved });
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(t.deleteConfirm)) return;
    setBusy(true);
    const { error } = await createClient().from("ss_profiles").delete().eq("user_id", userId);
    setBusy(false);
    if (error) return setMsg({ ok: false, text: niceError(error.message, t) });
    router.push("/social-space");
    router.refresh();
  }

  return (
    <section className="band hero-band" style={{ borderTop: 0 }}>
      <div className="ss-wrap">
        <SsTabs active="profile" userId={userId} isAdmin={isAdmin} />
        <div className="ss-side">
          <div className="ss-card">
            <h1 className="ss-h">{exists === false ? t.makeProfile : t.profileH}</h1>
            <p className="ss-sub" style={{ marginBottom: 20 }}>{t.profileSub}</p>
            {exists === null ? (
              <p className="ss-empty">{t.loading}</p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <div className="ss-row2">
                  <label className="ss-field">
                    <span>{t.fName}</span>
                    <input className="ss-input" value={f.name} maxLength={60} onChange={(e) => set("name", e.target.value)} required />
                  </label>
                  <label className="ss-field">
                    <span>{t.fHandle}</span>
                    <input
                      className="ss-input"
                      value={f.handle}
                      maxLength={30}
                      onChange={(e) => set("handle", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      required
                    />
                  </label>
                </div>
                <p className="ss-field" style={{ marginTop: -8 }}>
                  <small>{fill(t.fHandleHint, { handle: f.handle || "..." })}</small>
                </p>
                <div className="ss-row2">
                  <label className="ss-field">
                    <span>{t.fHeadline}</span>
                    <input className="ss-input" value={f.headline} maxLength={SS_LIMITS.headline} placeholder={t.fHeadlinePh} onChange={(e) => set("headline", e.target.value)} />
                  </label>
                  <label className="ss-field">
                    <span>{t.fCity}</span>
                    <input className="ss-input" value={f.city} maxLength={60} onChange={(e) => set("city", e.target.value)} />
                  </label>
                </div>
                <label className="ss-field">
                  <span>{t.fBio}</span>
                  <textarea className="ss-input" value={f.bio} maxLength={SS_LIMITS.bio} onChange={(e) => set("bio", e.target.value)} />
                </label>
                <div className="ss-field">
                  <span>{t.fOffer}</span>
                  <SkillInput value={f.skills_offer} onChange={(v) => set("skills_offer", v)} max={SS_LIMITS.skills} placeholder={t.fSkillPh} />
                  <small>{fill(t.fSkillHint, { n: SS_LIMITS.skills })}</small>
                </div>
                <div className="ss-field">
                  <span>{t.fWant}</span>
                  <SkillInput value={f.skills_want} onChange={(v) => set("skills_want", v)} max={SS_LIMITS.skills} placeholder={t.fSkillPh} />
                </div>
                <div className="ss-field">
                  <span>{t.fLinks}</span>
                  <input className="ss-input" value={f.website} maxLength={200} placeholder="Website: https://..." onChange={(e) => set("website", e.target.value)} />
                  <input className="ss-input" value={f.instagram} maxLength={200} placeholder="Instagram: https://instagram.com/..." onChange={(e) => set("instagram", e.target.value)} />
                  <input className="ss-input" value={f.linkedin} maxLength={200} placeholder="LinkedIn: https://linkedin.com/in/..." onChange={(e) => set("linkedin", e.target.value)} />
                </div>
                <label className="ss-check" style={{ marginBottom: 6 }}>
                  <input type="checkbox" checked={f.is_public} onChange={(e) => set("is_public", e.target.checked)} />
                  <span>
                    {t.fPublic}
                    <small style={{ display: "block", color: "var(--faint)", fontSize: 12.5 }}>{t.fPublicHint}</small>
                  </span>
                </label>
                <div className="ss-actions">
                  <button type="submit" className="btn btn-solid" disabled={busy}>
                    {busy ? t.saving : t.save}
                  </button>
                  {exists && (
                    <Link className="btn btn-line" href={`/social-space/u/${f.handle}`}>
                      {t.viewProfile}
                    </Link>
                  )}
                </div>
                {msg && <p className={`ss-msg ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}
                {exists && (
                  <p style={{ marginTop: 28 }}>
                    <button type="button" className="ss-link" onClick={remove} disabled={busy}>
                      {t.deleteProfile}
                    </button>
                  </p>
                )}
              </form>
            )}
          </div>

          <div>
            <div className="ss-head" style={{ marginBottom: 12 }}>
              <b style={{ fontWeight: 500, fontSize: 18 }}>{t.yours}</b>
              {exists && (
                <Link className="btn btn-solid btn-sm" href="/social-space/tawaran/baru">
                  {t.newPost}
                </Link>
              )}
            </div>
            {!exists ? (
              <p className="ss-sub">{t.needProfile}</p>
            ) : posts.length === 0 ? (
              <p className="ss-sub">{t.noOpenPosts}</p>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} me={me} userId={userId} showOwner={false} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
