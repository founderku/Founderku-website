"use client";

// Chat antara dua pasangan tukar skill. Pesan baru dicek tiap beberapa
// detik (tanpa server realtime, cukup untuk skala sekarang).

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SS_LIMITS, fill, fmtDate, niceError, useT, type SsMessage } from "./ss";
import { REQUEST_SELECT, statusClass, type RequestRow } from "./SsInbox";
import { Avatar, ReportButton, SsTabs } from "./SsUi";

const POLL_MS = 5000;

export function SsChat({ userId, requestId, isAdmin }: { userId: string; requestId: string; isAdmin: boolean }) {
  const { t, lang } = useT();
  const [req, setReq] = useState<RequestRow | null | undefined>(undefined);
  const [msgs, setMsgs] = useState<SsMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [reviewed, setReviewed] = useState<boolean | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const lastId = useRef(0);

  const loadReq = useCallback(async () => {
    const { data } = await createClient().from("ss_requests").select(REQUEST_SELECT).eq("id", requestId).maybeSingle();
    const r = (data as RequestRow) ?? null;
    // Admin bisa membaca permintaan (untuk moderasi), tapi chat hanya untuk dua pihak
    setReq(r && (r.requester_id === userId || r.owner_id === userId) ? r : null);
  }, [requestId, userId]);

  const loadMsgs = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("ss_messages")
      .select("*")
      .eq("request_id", requestId)
      .gt("id", lastId.current)
      .order("id", { ascending: true })
      .limit(500);
    const fresh = (data ?? []) as SsMessage[];
    if (fresh.length) {
      lastId.current = fresh[fresh.length - 1].id;
      setMsgs((m) => [...m, ...fresh.filter((x) => !m.some((y) => y.id === x.id))]);
      supabase.rpc("ss_mark_read", { p_request: requestId });
    }
  }, [requestId]);

  useEffect(() => {
    // Muat data awal lalu cek pesan baru berkala
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReq();
    loadMsgs();
    createClient().rpc("ss_mark_read", { p_request: requestId });
    const iv = setInterval(() => {
      if (document.visibilityState === "visible") loadMsgs();
    }, POLL_MS);
    return () => clearInterval(iv);
  }, [loadReq, loadMsgs, requestId]);

  useEffect(() => {
    if (req?.status !== "completed") return;
    createClient()
      .from("ss_reviews")
      .select("id")
      .eq("request_id", requestId)
      .eq("reviewer_id", userId)
      .then(({ data }) => setReviewed((data ?? []).length > 0));
  }, [req?.status, requestId, userId]);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    setErr("");
    const { data, error } = await createClient()
      .from("ss_messages")
      .insert({ request_id: requestId, sender_id: userId, body })
      .select()
      .single();
    setBusy(false);
    if (error) return setErr(niceError(error.message, t));
    const m = data as SsMessage;
    lastId.current = Math.max(lastId.current, m.id);
    setMsgs((x) => [...x, m]);
    setText("");
  }

  async function complete() {
    if (!window.confirm(t.markDoneConfirm)) return;
    const { error } = await createClient().rpc("ss_request_act", { p_request: requestId, p_action: "complete" });
    if (error) setErr(niceError(error.message, t));
    else loadReq();
  }

  const other = req ? (req.requester_id === userId ? req.owner : req.requester) : null;
  const otherId = req ? (req.requester_id === userId ? req.owner_id : req.requester_id) : "";
  const name = other?.name ?? t.someone;
  const canChat = req?.status === "accepted" || req?.status === "completed";

  return (
    <section className="band hero-band" style={{ borderTop: 0 }}>
      <div className="ss-wrap">
        <SsTabs active="inbox" userId={userId} isAdmin={isAdmin} />
        {req === undefined ? (
          <p className="ss-empty">{t.loading}</p>
        ) : req === null ? (
          <div className="ss-card ss-empty">
            <p>{t.errDenied}</p>
          </div>
        ) : (
          <div className="ss-side">
            <div className="ss-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
                {other ? (
                  <Link className="ss-who" href={`/social-space/u/${other.handle}`}>
                    <Avatar name={name} />
                    <span>
                      <b>{fill(t.chatWith, { name })}</b>
                      <small>@{other.handle}</small>
                    </span>
                  </Link>
                ) : (
                  <b>{fill(t.chatWith, { name })}</b>
                )}
                <span className={`ss-badge ${statusClass(req.status)}`}>{t.st[req.status]}</span>
              </div>
              <div className="ss-chat" ref={boxRef} aria-live="polite">
                <div className={`ss-bub${req.requester_id === userId ? " me" : ""}`}>
                  {req.message}
                  <time>{fmtDate(req.created_at, lang, true)}</time>
                </div>
                {msgs.length === 0 && canChat && <p className="ss-meta" style={{ alignSelf: "center" }}>{t.chatEmpty}</p>}
                {msgs.map((m) => (
                  <div key={m.id} className={`ss-bub${m.sender_id === userId ? " me" : ""}`}>
                    {m.body}
                    <time>{fmtDate(m.created_at, lang, true)}</time>
                  </div>
                ))}
              </div>
              {canChat ? (
                <form
                  className="ss-send"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <textarea
                    className="ss-input"
                    value={text}
                    maxLength={SS_LIMITS.msg}
                    placeholder={t.chatPh}
                    aria-label={t.chatPh}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        send();
                      }
                    }}
                  />
                  <button type="submit" className="btn btn-solid" disabled={busy || !text.trim()}>
                    {t.send}
                  </button>
                </form>
              ) : (
                <p className="ss-meta">{req.status === "pending" ? t.chatLocked : fill(t.chatClosed, { status: t.st[req.status].toLowerCase() })}</p>
              )}
              {err && <p className="ss-msg bad">{err}</p>}
              <p className="ss-meta" style={{ marginTop: 14 }}>{t.safety}</p>
            </div>

            <div>
              {req.post && (
                <div className="ss-card">
                  <div className="ss-lbl" style={{ marginTop: 0 }}>{fill(t.forPost, { offer: req.post.offer.join(", "), want: req.post.want.join(", ") })}</div>
                </div>
              )}
              {req.status === "accepted" && (
                <div className="ss-card">
                  <button type="button" className="btn btn-solid btn-sm" onClick={complete}>
                    {t.markDone}
                  </button>
                </div>
              )}
              {req.status === "completed" && reviewed === false && (
                <ReviewForm requestId={requestId} userId={userId} revieweeId={otherId} name={name} onDone={() => setReviewed(true)} />
              )}
              {req.status === "completed" && reviewed === true && (
                <div className="ss-card">
                  <p className="ss-msg ok" style={{ marginTop: 0 }}>{t.reviewDone}</p>
                </div>
              )}
              <div className="ss-card">
                <ReportButton targetType="profile" targetId={otherId} userId={userId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewForm({
  requestId,
  userId,
  revieweeId,
  name,
  onDone,
}: {
  requestId: string;
  userId: string;
  revieweeId: string;
  name: string;
  onDone: () => void;
}) {
  const { t } = useT();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send() {
    setBusy(true);
    const { error } = await createClient()
      .from("ss_reviews")
      .insert({ request_id: requestId, reviewer_id: userId, reviewee_id: revieweeId, rating, comment: comment.trim() });
    setBusy(false);
    if (error) setErr(niceError(error.message, t));
    else onDone();
  }

  return (
    <div className="ss-card">
      <b style={{ fontWeight: 500 }}>{fill(t.reviewH, { name })}</b>
      <div className="ss-stars-in" role="group" aria-label="Rating" style={{ margin: "10px 0" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n}/5`} aria-pressed={n <= rating} onClick={() => setRating(n)}>
            ★
          </button>
        ))}
      </div>
      <textarea className="ss-input" value={comment} maxLength={SS_LIMITS.review} placeholder={t.reviewPh} onChange={(e) => setComment(e.target.value)} />
      <div className="ss-actions">
        <button type="button" className="btn btn-solid btn-sm" disabled={busy} onClick={send}>
          {t.reviewSend}
        </button>
      </div>
      {err && <p className="ss-msg bad">{err}</p>}
    </div>
  );
}
