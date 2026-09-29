"use client";

// Tab Info: beasiswa, magang, dan lowongan. Siapa saja bisa membaca.
// Hanya admin dan akun yang diberi izin admin yang bisa memasang info
// (dicek juga di database). Info yang lewat tenggat otomatis tersembunyi.

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LINK_RE, fill, fmtDate, niceError, normalizeLink, todayJakarta, useT, type SsInfo as Info } from "./ss";
import { ReportButton, SsTabs } from "./SsUi";

const CATS = ["beasiswa", "magang", "lowongan"] as const;

function daysLeft(deadline: string) {
  const a = new Date(todayJakarta() + "T00:00:00Z").getTime();
  const b = new Date(deadline + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000);
}

export function SsInfo({ userId, isAdmin }: { userId: string | null; isAdmin: boolean }) {
  const { t, lang } = useT();
  const [rows, setRows] = useState<Info[] | null>(null);
  const [cat, setCat] = useState<string>("");
  const [canPost, setCanPost] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("ss_info")
      .select("*")
      .order("deadline", { ascending: true })
      .limit(300)
      .then(({ data }) => setRows((data ?? []) as Info[]));
    if (userId) supabase.rpc("ss_can_post_info").then(({ data }) => setCanPost(!!data));
  }, [userId, reload]);

  const today = todayJakarta();
  const active = useMemo(
    () => (rows ?? []).filter((r) => !r.hidden && r.deadline >= today && (!cat || r.category === cat)),
    [rows, cat, today]
  );
  const mine = (rows ?? []).filter((r) => r.author_id === userId);

  async function remove(id: string) {
    if (!window.confirm(t.iDeleteConfirm)) return;
    await createClient().from("ss_info").delete().eq("id", id);
    setReload((n) => n + 1);
  }

  return (
    <section className="band hero-band" style={{ borderTop: 0 }}>
      <div className="ss-wrap">
        <SsTabs active="info" userId={userId} isAdmin={isAdmin} />
        <div className="ss-head">
          <div>
            <h1 className="ss-h">{t.infoH}</h1>
            <p className="ss-sub">{t.infoSub}</p>
          </div>
          {canPost && (
            <button type="button" className="btn btn-solid btn-sm" onClick={() => setShowForm((v) => !v)}>
              {t.infoNew}
            </button>
          )}
        </div>

        {canPost && showForm && userId && <InfoForm userId={userId} onDone={() => { setShowForm(false); setReload((n) => n + 1); }} />}

        <div className="ss-tabs" role="group">
          {["", ...CATS].map((k) => (
            <a
              key={k || "all"}
              href="#"
              aria-current={cat === k ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                setCat(k);
              }}
            >
              {k ? t.infoCat[k] : t.etAll}
            </a>
          ))}
        </div>

        {rows === null ? (
          <p className="ss-empty">{t.loading}</p>
        ) : active.length === 0 ? (
          <p className="ss-empty">{t.infoEmpty}</p>
        ) : (
          <div className="ss-grid">
            {active.map((r) => {
              const left = daysLeft(r.deadline);
              return (
                <article key={r.id} className="ss-card">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "space-between" }}>
                    <span className="ss-badge gray">{t.infoCat[r.category]}</span>
                    <span className={`ss-badge ${left <= 3 ? "red" : ""}`}>{left === 0 ? t.infoToday : fill(t.infoDaysLeft, { n: left })}</span>
                  </div>
                  <h2 className="ss-et-name">{r.title}</h2>
                  <div className="ss-meta" style={{ marginTop: 4 }}>
                    {r.organizer && <span>{r.organizer}</span>}
                    {r.location && <span>{r.location}</span>}
                    <span>{fill(t.infoDeadline, { date: fmtDate(r.deadline + "T12:00:00Z", lang) })}</span>
                  </div>
                  <p className="ss-desc">{r.description}</p>
                  <div className="ss-actions">
                    {/^https:\/\//.test(r.link) && (
                      <a className="btn btn-solid btn-sm" href={r.link} target="_blank" rel="noopener noreferrer nofollow">
                        {t.infoOpen} ↗
                      </a>
                    )}
                    <ReportButton targetType="info" targetId={r.id} userId={userId} />
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {mine.length > 0 && (
          <>
            <h2 style={{ fontSize: 20, margin: "32px 0 12px" }}>{t.iMine}</h2>
            {mine.map((r) => (
              <div key={r.id} className="ss-card" style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span>
                  <b style={{ fontWeight: 500 }}>{r.title}</b>
                  <span className="ss-meta" style={{ marginTop: 2 }}>
                    <span>{t.infoCat[r.category]}</span>
                    <span>{fill(t.infoDeadline, { date: fmtDate(r.deadline + "T12:00:00Z", lang) })}</span>
                    {(r.deadline < today || r.hidden) && <span style={{ color: "var(--coral)" }}>{r.hidden ? t.hiddenByAdmin : t.iExpired}</span>}
                  </span>
                </span>
                <button type="button" className="ss-link" onClick={() => remove(r.id)}>
                  {t.iDelete}
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

function InfoForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const { t } = useT();
  const [f, setF] = useState({ category: "beasiswa", title: "", organizer: "", location: "", link: "", deadline: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  async function save() {
    setErr("");
    const link = normalizeLink(f.link);
    if (f.title.trim().length < 5) return setErr(t.errTitle);
    if (!f.deadline) return setErr(t.errDeadline);
    if (f.description.trim().length < 10) return setErr(t.errDesc);
    if (link && !LINK_RE.test(link)) return setErr(t.errLink);
    setBusy(true);
    const { error } = await createClient()
      .from("ss_info")
      .insert({
        author_id: userId,
        category: f.category,
        title: f.title.trim(),
        organizer: f.organizer.trim(),
        location: f.location.trim(),
        link,
        deadline: f.deadline,
        description: f.description.trim(),
      });
    setBusy(false);
    if (error) return setErr(niceError(error.message, t));
    onDone();
  }

  return (
    <form
      className="ss-card"
      style={{ marginBottom: 20 }}
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <b style={{ fontWeight: 500, fontSize: 18, display: "block", marginBottom: 14 }}>{t.infoFormH}</b>
      <div className="ss-row2">
        <label className="ss-field">
          <span>{t.iCategory}</span>
          <select className="ss-input" value={f.category} onChange={(e) => set("category", e.target.value)}>
            {CATS.map((c) => (
              <option key={c} value={c}>
                {t.infoCat[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="ss-field">
          <span>{t.iDeadline}</span>
          <input className="ss-input" type="date" min={todayJakarta()} value={f.deadline} onChange={(e) => set("deadline", e.target.value)} required />
        </label>
      </div>
      <label className="ss-field">
        <span>{t.iTitle}</span>
        <input className="ss-input" maxLength={140} value={f.title} onChange={(e) => set("title", e.target.value)} required />
      </label>
      <div className="ss-row2">
        <label className="ss-field">
          <span>{t.iOrganizer}</span>
          <input className="ss-input" maxLength={100} value={f.organizer} onChange={(e) => set("organizer", e.target.value)} />
        </label>
        <label className="ss-field">
          <span>{t.iLocation}</span>
          <input className="ss-input" maxLength={80} value={f.location} onChange={(e) => set("location", e.target.value)} />
        </label>
      </div>
      <label className="ss-field">
        <span>{t.iLink}</span>
        <input className="ss-input" maxLength={200} value={f.link} placeholder="https://" onChange={(e) => set("link", e.target.value)} />
      </label>
      <label className="ss-field">
        <span>{t.iDesc}</span>
        <textarea className="ss-input" maxLength={3000} value={f.description} onChange={(e) => set("description", e.target.value)} required />
      </label>
      <div className="ss-actions">
        <button type="submit" className="btn btn-solid btn-sm" disabled={busy}>
          {busy ? t.saving : t.infoNew}
        </button>
      </div>
      {err && <p className="ss-msg bad">{err}</p>}
    </form>
  );
}
