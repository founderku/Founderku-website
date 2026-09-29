"use client";

// Daftar permintaan tukar: yang masuk ke tawaranku dan yang aku kirim.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fill, fmtDate, niceError, useT, type SsProfileLite, type SsRequest } from "./ss";
import { Avatar, SsTabs, unreadCount } from "./SsUi";

export type RequestRow = SsRequest & {
  requester: SsProfileLite | null;
  owner: SsProfileLite | null;
  post: { offer: string[]; want: string[] } | null;
};

export const REQUEST_SELECT =
  "*, requester:ss_profiles!ss_requests_requester_id_fkey(user_id, handle, name, headline, city), owner:ss_profiles!ss_requests_owner_id_fkey(user_id, handle, name, headline, city), post:ss_posts(offer, want)";

export function statusClass(s: SsRequest["status"]) {
  return s === "accepted" ? "green" : s === "completed" ? "gray" : s === "pending" ? "" : "red";
}

export function SsInbox({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const { t, lang } = useT();
  const router = useRouter();
  const [rows, setRows] = useState<RequestRow[] | null>(null);
  const [tab, setTab] = useState<"in" | "out">("in");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    createClient()
      .from("ss_requests")
      .select(REQUEST_SELECT)
      .order("updated_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        const list = (data ?? []) as RequestRow[];
        setRows(list);
        // Pertama kali buka: pilih tab yang ada kabar barunya
        if (reload === 0 && !list.some((r) => r.owner_id === userId) && list.some((r) => r.requester_id === userId)) setTab("out");
      });
  }, [userId, reload]);

  async function act(id: string, action: string) {
    setBusy(id);
    setErr("");
    const { error } = await createClient().rpc("ss_request_act", { p_request: id, p_action: action });
    setBusy("");
    if (error) setErr(niceError(error.message, t));
    else if (action === "accept") router.push(`/social-space/chat/${id}`);
    else setReload((n) => n + 1);
  }

  const list = (rows ?? []).filter((r) => (tab === "in" ? r.owner_id === userId : r.requester_id === userId));
  const count = (k: "in" | "out") => unreadCount((rows ?? []).filter((r) => (k === "in" ? r.owner_id === userId : r.requester_id === userId)), userId);

  return (
    <section className="band hero-band" style={{ borderTop: 0 }}>
      <div className="ss-wrap">
        <SsTabs active="inbox" userId={userId} isAdmin={isAdmin} />
        <div className="ss-head">
          <div>
            <h1 className="ss-h">{t.inboxH}</h1>
            <p className="ss-sub">{t.inboxSub}</p>
          </div>
        </div>
        <div className="ss-tabs" role="tablist">
          {(["in", "out"] as const).map((k) => (
            <a
              key={k}
              href="#"
              role="tab"
              aria-selected={tab === k}
              aria-current={tab === k ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                setTab(k);
              }}
            >
              {k === "in" ? t.incoming : t.outgoing}
              {count(k) > 0 && <span className="ss-dot">{count(k)}</span>}
            </a>
          ))}
        </div>
        {err && <p className="ss-msg bad">{err}</p>}
        {rows === null ? (
          <p className="ss-empty">{t.loading}</p>
        ) : list.length === 0 ? (
          <p className="ss-empty">{t.noRequests}</p>
        ) : (
          list.map((r) => {
            const other = r.requester_id === userId ? r.owner : r.requester;
            const name = other?.name ?? t.someone;
            const read = r.requester_id === userId ? r.requester_read_at : r.owner_read_at;
            const isNew = !read || new Date(r.updated_at) > new Date(read);
            return (
              <div key={r.id} className="ss-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                  {other ? (
                    <Link className="ss-who" href={`/social-space/u/${other.handle}`}>
                      <Avatar name={name} />
                      <span style={{ minWidth: 0 }}>
                        <b>{name}</b>
                        <small>{fmtDate(r.updated_at, lang, true)}</small>
                      </span>
                    </Link>
                  ) : (
                    <span className="ss-who">
                      <Avatar name={name} />
                      <b>{name}</b>
                    </span>
                  )}
                  <span style={{ display: "flex", gap: 6 }}>
                    {isNew && <span className="ss-badge">{t.newBadge}</span>}
                    <span className={`ss-badge ${statusClass(r.status)}`}>{t.st[r.status]}</span>
                  </span>
                </div>
                {r.post && (
                  <p className="ss-meta">{fill(t.forPost, { offer: r.post.offer.join(", "), want: r.post.want.join(", ") })}</p>
                )}
                <p className="ss-desc">{r.message}</p>
                <div className="ss-actions">
                  {r.status === "pending" && r.owner_id === userId && (
                    <>
                      <button type="button" className="btn btn-solid btn-sm" disabled={busy === r.id} onClick={() => act(r.id, "accept")}>
                        {t.accept}
                      </button>
                      <button type="button" className="btn btn-line btn-sm" disabled={busy === r.id} onClick={() => act(r.id, "decline")}>
                        {t.decline}
                      </button>
                    </>
                  )}
                  {r.status === "pending" && r.requester_id === userId && (
                    <button type="button" className="btn btn-line btn-sm" disabled={busy === r.id} onClick={() => act(r.id, "cancel")}>
                      {t.cancelReq}
                    </button>
                  )}
                  {(r.status === "accepted" || r.status === "completed") && (
                    <Link className="btn btn-solid btn-sm" href={`/social-space/chat/${r.id}`}>
                      {t.openChat}
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
