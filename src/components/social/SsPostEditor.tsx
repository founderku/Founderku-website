"use client";

// Pasang atau ubah tawaran tukar skill milik sendiri.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SS_LIMITS, fill, niceError, useT, type SsPost, type SsProfile } from "./ss";
import { SkillInput, SsTabs } from "./SsUi";

export function SsPostEditor({ userId, postId, isAdmin }: { userId: string; postId: string | null; isAdmin: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const [me, setMe] = useState<SsProfile | null | undefined>(undefined);
  const [missing, setMissing] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [offer, setOffer] = useState<string[]>([]);
  const [want, setWant] = useState<string[]>([]);
  const [format, setFormat] = useState<SsPost["format"]>("online");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<SsPost["status"]>("open");
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
        const p = (data as SsProfile) ?? null;
        setMe(p);
        // Tawaran baru: isi awal dari skill di profil
        if (p && !postId) {
          setOffer(p.skills_offer.slice(0, SS_LIMITS.postSkills));
          setWant(p.skills_want.slice(0, SS_LIMITS.postSkills));
        }
      });
    if (postId) {
      supabase
        .from("ss_posts")
        .select("*")
        .eq("id", postId)
        .eq("user_id", userId)
        .maybeSingle()
        .then(({ data }) => {
          const p = data as SsPost | null;
          if (!p) return setMissing(true);
          setOffer(p.offer);
          setWant(p.want);
          setFormat(p.format);
          setDuration(p.duration);
          setDescription(p.description);
          setStatus(p.status);
          setHidden(p.hidden);
        });
    }
  }, [userId, postId]);

  async function save() {
    setMsg(null);
    if (!offer.length || !want.length) return setMsg({ ok: false, text: t.errSkills });
    if (description.trim().length < 10) return setMsg({ ok: false, text: t.errDesc });
    setBusy(true);
    const supabase = createClient();
    const data = { offer, want, format, duration: duration.trim(), description: description.trim() };
    const { error } = postId
      ? await supabase.from("ss_posts").update({ ...data, status }).eq("id", postId)
      : await supabase.from("ss_posts").insert({ user_id: userId, ...data });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: niceError(error.message, t) });
    router.push(postId ? "/social-space/profil" : "/social-space");
  }

  async function remove() {
    if (!postId || !window.confirm(t.deletePostConfirm)) return;
    setBusy(true);
    const { error } = await createClient().from("ss_posts").delete().eq("id", postId);
    setBusy(false);
    if (error) return setMsg({ ok: false, text: niceError(error.message, t) });
    router.push("/social-space/profil");
  }

  return (
    <section className="band hero-band" style={{ borderTop: 0 }}>
      <div className="ss-wrap">
        <SsTabs active="profile" userId={userId} isAdmin={isAdmin} />
        <div className="ss-narrow ss-card">
          <h1 className="ss-h">{postId ? t.postEditH : t.postNewH}</h1>
          <p className="ss-sub" style={{ marginBottom: 20 }}>{t.postSub}</p>
          {me === undefined ? (
            <p className="ss-empty">{t.loading}</p>
          ) : me === null ? (
            <>
              <p className="ss-sub">{t.needProfile}</p>
              <div className="ss-actions">
                <Link className="btn btn-solid btn-sm" href="/social-space/profil">
                  {t.makeProfile}
                </Link>
              </div>
            </>
          ) : missing ? (
            <p className="ss-sub">{t.errDenied}</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              {hidden && <div className="notice bad">{t.hiddenByAdmin}</div>}
              <div className="ss-field">
                <span>{t.pOffer}</span>
                <SkillInput value={offer} onChange={setOffer} max={SS_LIMITS.postSkills} placeholder={t.fSkillPh} />
                <small>{fill(t.fSkillHint, { n: SS_LIMITS.postSkills })}</small>
              </div>
              <div className="ss-field">
                <span>{t.pWant}</span>
                <SkillInput value={want} onChange={setWant} max={SS_LIMITS.postSkills} placeholder={t.fSkillPh} />
              </div>
              <div className="ss-row2">
                <label className="ss-field">
                  <span>{t.pFormat}</span>
                  <select className="ss-input" value={format} onChange={(e) => setFormat(e.target.value as SsPost["format"])}>
                    <option value="online">{t.online}</option>
                    <option value="offline">{t.offline}</option>
                    <option value="hybrid">{t.hybrid}</option>
                  </select>
                </label>
                <label className="ss-field">
                  <span>{t.pDuration}</span>
                  <input className="ss-input" value={duration} maxLength={40} placeholder={t.pDurationPh} onChange={(e) => setDuration(e.target.value)} />
                </label>
              </div>
              <label className="ss-field">
                <span>{t.pDesc}</span>
                <textarea className="ss-input" value={description} maxLength={SS_LIMITS.desc} placeholder={t.pDescPh} onChange={(e) => setDescription(e.target.value)} />
              </label>
              {postId && (
                <label className="ss-field">
                  <span>{t.pStatus}</span>
                  <select className="ss-input" value={status} onChange={(e) => setStatus(e.target.value as SsPost["status"])}>
                    <option value="open">{t.pOpen}</option>
                    <option value="closed">{t.pClosed}</option>
                  </select>
                </label>
              )}
              <div className="ss-actions">
                <button type="submit" className="btn btn-solid" disabled={busy}>
                  {busy ? t.saving : postId ? t.save : t.publish}
                </button>
                <Link className="btn btn-line" href={postId ? "/social-space/profil" : "/social-space"}>
                  {t.cancel}
                </Link>
              </div>
              {msg && <p className={`ss-msg ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}
              {postId && (
                <p style={{ marginTop: 28 }}>
                  <button type="button" className="ss-link" onClick={remove} disabled={busy}>
                    {t.deletePost}
                  </button>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
