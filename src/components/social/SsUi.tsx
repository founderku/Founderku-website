"use client";

// Komponen kecil yang dipakai berulang di halaman Social Space.

import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  SS_LIMITS,
  fill,
  initials,
  matchScore,
  niceError,
  sameSkill,
  useT,
  fmtDate,
  type SsLegacyPost,
  type SsPost,
  type SsProfile,
  type SsRequest,
  type SsText,
} from "./ss";

export type SsTab = "feed" | "etalase" | "info" | "inbox" | "profile" | "mod";

// Jumlah percakapan yang ada kabar baru (belum dibuka sejak terakhir berubah)
export function unreadCount(rows: SsRequest[], userId: string) {
  return rows.filter((r) => {
    const read = r.requester_id === userId ? r.requester_read_at : r.owner_read_at;
    return !read || new Date(r.updated_at) > new Date(read);
  }).length;
}

// Ikon kecil untuk bar navigasi bawah di HP
const NAV_ICON: Record<string, string> = {
  etalase: "M4 9.5 5.2 5h13.6L20 9.5M4 9.5V19h16V9.5M4 9.5c0 1.4 1.1 2.5 2.7 2.5s2.6-1.1 2.6-2.5c0 1.4 1.1 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1 2.5 2.6 2.5S20 10.9 20 9.5M10 19v-4h4v4",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v6m0-9.5v.5",
  feed: "M7 7h11l-3-3M17 17H6l3 3",
  inbox: "M4 5h16v11H9l-5 4V5Z",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5",
  mod: "M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6L12 3Z",
  login: "M10 5H5v14h5M14 8l4 4-4 4M18 12H9",
};

function NavIcon({ k }: { k: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={NAV_ICON[k]} />
    </svg>
  );
}

export function SsTabs({
  active,
  userId,
  isAdmin = false,
}: {
  active: SsTab;
  userId: string | null;
  isAdmin?: boolean;
}) {
  const { t } = useT();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    // Catat halaman Social Space terakhir: halaman Pajangin memakainya
    // untuk menampilkan tombol kembali ke Etalase
    try {
      const cur = location.pathname + location.search;
      const last = sessionStorage.getItem("ss-last");
      if (last !== cur) {
        sessionStorage.setItem("ss-prev", last ?? "");
        sessionStorage.setItem("ss-last", cur);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    supabase
      .from("ss_requests")
      .select("id, requester_id, owner_id, status, updated_at, requester_read_at, owner_read_at")
      .in("status", ["pending", "accepted"])
      .then(({ data }) => setUnread(unreadCount((data ?? []) as SsRequest[], userId)));
  }, [userId]);

  const items: [SsTab, string, string][] = [
    ["etalase", "/social-space", t.tabEtalase],
    ["info", "/social-space/info", t.tabInfo],
    ...(userId
      ? ([
          ["inbox", "/social-space/permintaan", t.tabInbox],
          ["profile", "/social-space/profil", t.tabProfile],
        ] as [SsTab, string, string][])
      : []),
    ...(isAdmin ? ([["mod", "/social-space/moderasi", t.tabMod]] as [SsTab, string, string][]) : []),
  ];
  // Bar bawah di HP: label lebih pendek, dan tombol Masuk untuk pengunjung
  const bottom: [string, string, string][] = [
    ["etalase", "/social-space", t.tabEtalase],
    ["info", "/social-space/info", t.tabInfo],
    ...(userId
      ? ([
          ["inbox", "/social-space/permintaan", t.bnInbox],
          ["profile", "/social-space/profil", t.bnProfile],
        ] as [string, string, string][])
      : ([["login", "/masuk?next=%2Fsocial-space", t.bnLogin]] as [string, string, string][])),
    ...(isAdmin ? ([["mod", "/social-space/moderasi", t.tabMod]] as [string, string, string][]) : []),
  ];
  return (
    <>
      <nav className="ss-tabs ss-top" aria-label={t.brand}>
        {items.map(([k, href, label]) => (
          <Link key={k} href={href} aria-current={k === active ? "page" : undefined}>
            {label}
            {k === "inbox" && unread > 0 && <span className="ss-dot">{unread}</span>}
          </Link>
        ))}
      </nav>
      <nav className="ss-bnav" aria-label={t.brand}>
        {bottom.map(([k, href, label]) => (
          <Link key={k} href={href} aria-current={k === active ? "page" : undefined}>
            <span className="ss-bnav-ic">
              <NavIcon k={k} />
              {k === "inbox" && unread > 0 && <span className="ss-dot">{unread}</span>}
            </span>
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

export function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  return (
    <span className={`ss-av${large ? " lg" : ""}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function SkillChips({ skills, hits = [] }: { skills: string[]; hits?: string[] }) {
  return (
    <div className="ss-chips">
      {skills.map((s) => (
        <span key={s} className={`ss-chip${hits.some((h) => sameSkill(h, s)) ? " hit" : ""}`}>
          {s}
        </span>
      ))}
    </div>
  );
}

// Isian skill: ketik lalu Enter (atau koma) untuk menambah
export function SkillInput({
  value,
  onChange,
  max,
  placeholder,
  id,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  max: number;
  placeholder: string;
  id?: string;
}) {
  const [draft, setDraft] = useState("");
  function add(raw: string) {
    const parts = raw
      .split(",")
      .map((x) => x.trim().replace(/\s+/g, " ").slice(0, 40))
      .filter((x) => x.length >= 2);
    const next = [...value];
    for (const p of parts) {
      if (next.length >= max) break;
      if (!next.some((n) => sameSkill(n, p))) next.push(p);
    }
    onChange(next);
    setDraft("");
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (draft.trim()) add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }
  return (
    <div>
      {value.length > 0 && (
        <div className="ss-chips" style={{ marginBottom: 8 }}>
          {value.map((s) => (
            <span key={s} className="ss-chip">
              {s}
              <button type="button" aria-label={`Hapus ${s}`} onClick={() => onChange(value.filter((x) => x !== s))}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        id={id}
        className="ss-input"
        value={draft}
        maxLength={80}
        disabled={value.length >= max}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          if (v.includes(",")) add(v);
          else setDraft(v);
        }}
        onKeyDown={onKey}
        onBlur={() => draft.trim() && add(draft)}
      />
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  const r = Math.round(value);
  return (
    <span className="ss-stars" aria-label={`${value.toFixed(1)} / 5`}>
      {"★".repeat(r)}
      <span style={{ opacity: 0.25 }}>{"★".repeat(5 - r)}</span>
    </span>
  );
}

// Tombol laporkan + dialog kecil
export function ReportButton({
  targetType,
  targetId,
  userId,
}: {
  targetType: "profile" | "post" | "message" | "legacy_post" | "page" | "info";
  targetId: string;
  userId: string | null;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!userId) return null;

  async function send() {
    setBusy(true);
    const { error } = await createClient()
      .from("ss_reports")
      .insert({ reporter_id: userId, target_type: targetType, target_id: targetId, reason, details: details.trim() });
    setBusy(false);
    if (error) setMsg({ ok: false, text: niceError(error.message, t) });
    else setMsg({ ok: true, text: t.reportSent });
  }

  return (
    <>
      <button type="button" className="ss-link" onClick={() => { setOpen(true); setMsg(null); }}>
        {t.report}
      </button>
      {open && (
        <div className="ss-dialog" role="dialog" aria-modal="true" aria-label={t.reportH} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div>
            <h3 style={{ fontSize: 22, marginBottom: 14 }}>{t.reportH}</h3>
            {msg?.ok ? (
              <>
                <p className="ss-msg ok">{msg.text}</p>
                <div className="ss-actions">
                  <button type="button" className="btn btn-solid btn-sm" onClick={() => setOpen(false)}>
                    OK
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="ss-field">
                  <span>{t.reportReason}</span>
                  <select className="ss-input" value={reason} onChange={(e) => setReason(e.target.value)}>
                    {Object.entries(t.reasons).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ss-field">
                  <span>{t.reportDetails}</span>
                  <textarea className="ss-input" maxLength={SS_LIMITS.report} value={details} onChange={(e) => setDetails(e.target.value)} />
                </label>
                {msg && <p className="ss-msg bad">{msg.text}</p>}
                <div className="ss-actions">
                  <button type="button" className="btn btn-solid btn-sm" disabled={busy} onClick={send}>
                    {t.send}
                  </button>
                  <button type="button" className="btn btn-line btn-sm" onClick={() => setOpen(false)}>
                    {t.cancel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function formatLabel(f: SsPost["format"], t: SsText) {
  return f === "offline" ? t.offline : f === "hybrid" ? t.hybrid : t.online;
}

// Kartu tawaran, dipakai di Jelajah dan halaman profil
export function PostCard({
  post,
  me,
  userId,
  showOwner = true,
}: {
  post: SsPost;
  me: SsProfile | null;
  userId: string | null;
  showOwner?: boolean;
}) {
  const { t } = useT();
  const [asking, setAsking] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const owner = post.ss_profiles;
  const mine = !!userId && post.user_id === userId;
  const { gives, takes } = matchScore(post, me);
  const isMatch = !mine && gives.length > 0;

  async function ask() {
    setBusy(true);
    const { error } = await createClient().rpc("ss_request_create", { p_post: post.id, p_message: text.trim() });
    setBusy(false);
    if (error) setMsg({ ok: false, text: niceError(error.message, t) });
    else {
      setMsg({ ok: true, text: t.sent });
      setAsking(false);
    }
  }

  function openAsk() {
    setMsg(null);
    setText(
      fill(t.askMsgPh, {
        give: (takes[0] ?? me?.skills_offer[0] ?? "...").toString(),
        want: (gives[0] ?? post.offer[0]).toString(),
      })
    );
    setAsking(true);
  }

  return (
    <article className="ss-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        {showOwner && owner ? (
          <Link className="ss-who" href={`/social-space/u/${owner.handle}`}>
            <Avatar name={owner.name} />
            <span style={{ minWidth: 0 }}>
              <b>{owner.name}</b>
              <small>{[owner.headline, owner.city].filter(Boolean).join(" · ") || "@" + owner.handle}</small>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {mine ? (
          <span className="ss-badge gray">{t.yours}</span>
        ) : isMatch ? (
          <span className="ss-badge">{t.forYou}</span>
        ) : null}
      </div>
      <div className="ss-lbl">{t.offers}</div>
      <SkillChips skills={post.offer} hits={gives} />
      <div className="ss-lbl">{t.wants}</div>
      <SkillChips skills={post.want} hits={takes} />
      <p className="ss-desc">{post.description}</p>
      <div className="ss-meta">
        <span>{formatLabel(post.format, t)}</span>
        {post.duration && <span>{post.duration}</span>}
        {post.status === "closed" && <span>{t.pClosed}</span>}
        {post.hidden && <span style={{ color: "var(--coral)" }}>{t.hiddenByAdmin}</span>}
      </div>

      {asking ? (
        <div style={{ marginTop: 14 }}>
          <label className="ss-field" style={{ marginBottom: 10 }}>
            <span>{t.askMsg}</span>
            <textarea className="ss-input" maxLength={SS_LIMITS.reqMsg} value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <div className="ss-actions" style={{ marginTop: 0 }}>
            <button type="button" className="btn btn-solid btn-sm" disabled={busy || !text.trim()} onClick={ask}>
              {t.send}
            </button>
            <button type="button" className="btn btn-line btn-sm" onClick={() => setAsking(false)}>
              {t.cancel}
            </button>
          </div>
        </div>
      ) : (
        <div className="ss-actions">
          {mine ? (
            <Link className="btn btn-line btn-sm" href={`/social-space/tawaran/${post.id}`}>
              {t.edit}
            </Link>
          ) : !userId ? (
            <Link className="btn btn-solid btn-sm" href={`/masuk?next=${encodeURIComponent("/social-space/tukar-skill")}`}>
              {t.askSwap}
            </Link>
          ) : !me ? (
            <Link className="btn btn-solid btn-sm" href="/social-space/profil">
              {t.askSwap}
            </Link>
          ) : (
            post.status === "open" && (
              <button type="button" className="btn btn-solid btn-sm" onClick={openAsk}>
                {t.askSwap}
              </button>
            )
          )}
          {msg?.ok && (
            <Link className="ss-link" href="/social-space/permintaan">
              {t.tabInbox}
            </Link>
          )}
          {!mine && <ReportButton targetType="post" targetId={post.id} userId={userId} />}
        </div>
      )}
      {msg && <p className={`ss-msg ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}
    </article>
  );
}

// Kartu tawaran TukarSkill lama yang pemiliknya belum pindah. Ajakan
// tukar disimpan dan diteruskan saat pemiliknya mengklaim profil.
export function LegacyPostCard({ post, me, userId }: { post: SsLegacyPost; me: SsProfile | null; userId: string | null }) {
  const { t, lang } = useT();
  const [asking, setAsking] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { gives, takes } = matchScore(post, me);

  async function ask() {
    setBusy(true);
    const { error } = await createClient().rpc("ss_legacy_interest_create", { p_post: post.id, p_message: text.trim() });
    setBusy(false);
    if (error) setMsg({ ok: false, text: niceError(error.message, t) });
    else {
      setMsg({ ok: true, text: t.legacySent });
      setAsking(false);
    }
  }

  return (
    <article className="ss-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <span className="ss-who">
          <Avatar name={post.owner_name} />
          <span style={{ minWidth: 0 }}>
            <b>{post.owner_name}</b>
            <small>{post.owner_city || t.fromTsWaiting}</small>
          </span>
        </span>
        {gives.length > 0 ? <span className="ss-badge">{t.forYou}</span> : <span className="ss-badge gray">{t.fromTsWaiting}</span>}
      </div>
      <div className="ss-lbl">{t.offers}</div>
      <SkillChips skills={post.offer} hits={gives} />
      <div className="ss-lbl">{t.wants}</div>
      <SkillChips skills={post.want} hits={takes} />
      <p className="ss-desc">{post.description}</p>
      <div className="ss-meta">
        <span>{formatLabel(post.format, t)}</span>
        {post.duration && <span>{post.duration}</span>}
        {post.posted_at && <span>{fill(t.legacyPosted, { date: fmtDate(post.posted_at, lang) })}</span>}
      </div>
      {asking ? (
        <div style={{ marginTop: 14 }}>
          <p className="ss-meta" style={{ marginTop: 0, marginBottom: 8 }}>{t.legacyNote}</p>
          <label className="ss-field" style={{ marginBottom: 10 }}>
            <span>{t.askMsg}</span>
            <textarea className="ss-input" maxLength={SS_LIMITS.reqMsg} value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <div className="ss-actions" style={{ marginTop: 0 }}>
            <button type="button" className="btn btn-solid btn-sm" disabled={busy || !text.trim()} onClick={ask}>
              {t.send}
            </button>
            <button type="button" className="btn btn-line btn-sm" onClick={() => setAsking(false)}>
              {t.cancel}
            </button>
          </div>
        </div>
      ) : (
        <div className="ss-actions">
          {!userId ? (
            <Link className="btn btn-solid btn-sm" href={`/masuk?next=${encodeURIComponent("/social-space/tukar-skill")}`}>
              {t.askSwap}
            </Link>
          ) : !me ? (
            <Link className="btn btn-solid btn-sm" href="/social-space/profil">
              {t.askSwap}
            </Link>
          ) : (
            !msg?.ok && (
              <button
                type="button"
                className="btn btn-solid btn-sm"
                onClick={() => {
                  setMsg(null);
                  setText(fill(t.askMsgPh, { give: takes[0] ?? me.skills_offer[0] ?? "...", want: gives[0] ?? post.offer[0] }));
                  setAsking(true);
                }}
              >
                {t.askSwap}
              </button>
            )
          )}
          <ReportButton targetType="legacy_post" targetId={post.id} userId={userId} />
        </div>
      )}
      {msg && <p className={`ss-msg ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}
    </article>
  );
}
