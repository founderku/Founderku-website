"use client";

// Halaman moderasi Social Space (admin saja): ringkasan angka dan laporan
// terbuka. Aksesnya tetap dicek di database (ss_admin_overview dan
// ss_admin_moderate menolak selain admin).

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fill, fmtDate, niceError, useT } from "./ss";
import { SsTabs } from "./SsUi";

type Overview = Record<
  "profiles" | "posts_open" | "requests" | "completed" | "legacy_total" | "legacy_claimed" | "reports_open" | "etalase" | "info_active" | "legacy_posts_waiting",
  number
> & { info_authors: string[] };
type Report = { id: string; target_type: string; target_id: string; reason: string; details: string; created_at: string };

export function SsModeration({ userId }: { userId: string }) {
  const { t, lang } = useT();
  const [ov, setOv] = useState<Overview | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("ss_admin_overview").then(({ data, error }) => {
      if (error) setErr(niceError(error.message, t));
      else setOv(data as Overview);
    });
    (async () => {
      const { data } = await supabase
        .from("ss_reports")
        .select("id, target_type, target_id, reason, details, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(200);
      const list = (data ?? []) as Report[];
      setReports(list);
      // Tautan ke yang dilaporkan: profil lewat handle, tawaran lewat pemiliknya
      const profIds = list.filter((r) => r.target_type === "profile").map((r) => r.target_id);
      const postIds = list.filter((r) => r.target_type === "post").map((r) => r.target_id);
      const postOwner: Record<string, string> = {};
      if (postIds.length) {
        const { data: posts } = await supabase.from("ss_posts").select("id, user_id").in("id", postIds);
        for (const p of posts ?? []) {
          postOwner[p.id] = p.user_id;
          profIds.push(p.user_id);
        }
      }
      const handles: Record<string, string> = {};
      if (profIds.length) {
        const { data: profs } = await supabase.from("ss_profiles").select("user_id, handle").in("user_id", profIds);
        for (const p of profs ?? []) handles[p.user_id] = p.handle;
      }
      const map: Record<string, string> = {};
      const pageIds = list.filter((r) => r.target_type === "page").map((r) => r.target_id);
      if (pageIds.length) {
        const { data: pages } = await supabase.from("pages").select("id, slug").in("id", pageIds);
        for (const p of pages ?? []) map[p.id] = `/l/${p.slug}`;
      }
      for (const r of list) {
        const owner = r.target_type === "post" ? postOwner[r.target_id] : r.target_type === "profile" ? r.target_id : "";
        if (owner && handles[owner]) map[r.target_id] = `/social-space/u/${handles[owner]}`;
      }
      setLinks(map);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  async function moderate(id: string, action: "hide" | "dismiss") {
    const { error } = await createClient().rpc("ss_admin_moderate", { p_report: id, p_action: action });
    if (error) setErr(niceError(error.message, t));
    else setReload((n) => n + 1);
  }

  const stats: [string, number | undefined][] = [
    [t.mProfiles, ov?.profiles],
    [t.mPosts, ov?.posts_open],
    [t.mRequests, ov?.requests],
    [t.mCompleted, ov?.completed],
    [t.mLegacy, ov ? ov.legacy_claimed : undefined],
    [t.mLegacyPosts, ov?.legacy_posts_waiting],
    [t.mEtalase, ov?.etalase],
    [t.mInfo, ov?.info_active],
    [t.mReports, ov?.reports_open],
  ];

  return (
    <section className="band hero-band" style={{ borderTop: 0 }}>
      <div className="ss-wrap">
        <SsTabs active="mod" userId={userId} isAdmin />
        <h1 className="ss-h">{t.modH}</h1>
        <p className="ss-sub" style={{ marginBottom: 20 }}>{t.modSub}</p>
        {err && <p className="ss-msg bad">{err}</p>}
        <div className="ss-stats">
          {stats.map(([label, n]) => (
            <div key={label}>
              <b>
                {n ?? "-"}
                {label === t.mLegacy && ov ? <small> / {ov.legacy_total}</small> : null}
              </b>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <InfoAccess authors={ov?.info_authors ?? []} onChange={() => setReload((n) => n + 1)} />
        {reports === null ? (
          <p className="ss-empty">{t.loading}</p>
        ) : reports.length === 0 ? (
          <p className="ss-empty">{t.noReports}</p>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="ss-card">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span className="ss-badge">{t.target[r.target_type]}</span>
                <span className="ss-badge red">{t.reasons[r.reason] ?? r.reason}</span>
                <span className="ss-meta" style={{ marginTop: 0 }}>{fmtDate(r.created_at, lang, true)}</span>
              </div>
              {r.details && <p className="ss-desc">{r.details}</p>}
              <div className="ss-actions">
                {links[r.target_id] && (
                  <Link className="btn btn-line btn-sm" href={links[r.target_id]} target="_blank">
                    {t.view}
                  </Link>
                )}
                {r.target_type !== "message" && (
                  <button type="button" className="btn btn-solid btn-sm" onClick={() => moderate(r.id, "hide")}>
                    {t.hide}
                  </button>
                )}
                <button type="button" className="btn btn-line btn-sm" onClick={() => moderate(r.id, "dismiss")}>
                  {t.dismiss}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// Beri atau cabut izin pasang info beasiswa, magang, dan lowongan
function InfoAccess({ authors, onChange }: { authors: string[]; onChange: () => void }) {
  const { t } = useT();
  const [handle, setHandle] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function run(allow: boolean) {
    setMsg(null);
    const { error } = await createClient().rpc("ss_admin_set_info_access", { p_handle: handle.trim().replace(/^@/, ""), p_allow: allow });
    if (error) setMsg({ ok: false, text: niceError(error.message, t) });
    else {
      setMsg({ ok: true, text: t.saved });
      setHandle("");
      onChange();
    }
  }

  return (
    <div className="ss-card" style={{ marginBottom: 20 }}>
      <b style={{ fontWeight: 500 }}>{t.mInfoAccess}</b>
      <p className="ss-sub" style={{ marginTop: 4 }}>{t.mInfoAccessSub}</p>
      <div className="ss-tools" style={{ marginTop: 10, marginBottom: 0 }}>
        <input className="ss-input" value={handle} placeholder="nama-profil" onChange={(e) => setHandle(e.target.value.toLowerCase())} />
        <button type="button" className="btn btn-solid btn-sm" disabled={!handle.trim()} onClick={() => run(true)}>
          {t.mGrant}
        </button>
        <button type="button" className="btn btn-line btn-sm" disabled={!handle.trim()} onClick={() => run(false)}>
          {t.mRevoke}
        </button>
      </div>
      {authors.length > 0 && <p className="ss-meta">{fill(t.mAuthors, { list: authors.map((a) => "@" + a).join(", ") })}</p>}
      {msg && <p className={`ss-msg ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}
    </div>
  );
}
