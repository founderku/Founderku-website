"use client";

import { Fragment, useEffect, useState } from "react";
import { ToolIcon } from "@/components/ToolIcon";
import {
  categoryLabel,
  COVER,
  parseContent,
  pick,
  readingMinutes,
  type Inline,
  type Lang,
  type Post,
  type ToolRingkas,
} from "@/lib/blog";

// Bahasa ikut pilihan di navigasi (fk-site.js mengirim event "fk:lang").
// Halaman dibuat di server dalam bahasa Indonesia (versi yang dibaca Google).
function readLang(): Lang {
  let l: string | null = null;
  try {
    l = localStorage.getItem("fk-lang");
  } catch {}
  if (l !== "en" && l !== "tr" && l !== "id") l = document.documentElement.getAttribute("lang");
  return l === "en" || l === "tr" ? l : "id";
}

const T: Record<Lang, Record<string, string>> = {
  id: { blog: "Blog", back: "Semua artikel", talk: "Ngobrol dengan kami", more: "Artikel lain", all: "Semua artikel", min: "menit baca", try: "Coba gratis", tool: "Tool Founderku" },
  en: { blog: "Blog", back: "All articles", talk: "Talk to us", more: "More articles", all: "All articles", min: "min read", try: "Try it free", tool: "Founderku tool" },
  tr: { blog: "Blog", back: "Tüm yazılar", talk: "Bizimle konuş", more: "Diğer yazılar", all: "Tüm yazılar", min: "dk okuma", try: "Ücretsiz dene", tool: "Founderku aracı" },
};

function Txt({ inl }: { inl: Inline }) {
  return (
    <>
      {inl.map((x, i) => (x.b ? <b key={i}>{x.s}</b> : <Fragment key={i}>{x.s}</Fragment>))}
    </>
  );
}

function ToolCta({ tool, lang }: { tool: ToolRingkas; lang: Lang }) {
  const t = T[lang];
  return (
    <a className="tool-cta" href={tool.href}>
      <ToolIcon id={tool.id} name={tool.name} size={48} />
      <span className="tc-body">
        <small>{t.tool}</small>
        <b>{tool.name}</b>
        <span>{pick(tool.short, lang)}</span>
      </span>
      <span className="btn btn-solid btn-sm">{t.try}</span>
    </a>
  );
}

export function ArticleView({ post, others, tools }: { post: Post; others: Post[]; tools: Record<string, ToolRingkas> }) {
  const [lang, setLang] = useState<Lang>("id");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(readLang());
    const onLang = () => setLang(readLang());
    window.addEventListener("fk:lang", onLang);
    return () => window.removeEventListener("fk:lang", onLang);
  }, []);

  const t = T[lang];
  // Kalau isi artikel belum diterjemahkan, seluruh artikel tampil dalam
  // bahasa Indonesia (judul dan isi tidak campur bahasa).
  const c = post.content;
  const aLang: Lang = typeof c === "object" && c?.[lang] ? lang : "id";
  const title = pick(post.title, aLang);
  const body = pick(post.content, aLang) || pick(post.excerpt, aLang);
  const blocks = parseContent(body);
  const cat = categoryLabel(post.category, lang);
  const mainTool = post.tool ? tools[post.tool] : undefined;
  const adaCta = blocks.some((b) => b.t === "tool");

  useEffect(() => {
    document.title = `${title} · Founderku`;
  }, [title]);

  return (
    <>
      <section className="band hero-band" style={{ borderTop: 0, paddingTop: "clamp(28px,4vw,56px)" }}>
        <article className="article" lang={aLang}>
          <nav className="crumb" aria-label="Breadcrumb">
            <a href="/blog.html">{t.blog}</a>
            <span aria-hidden="true">/</span>
            <span>{cat}</span>
          </nav>
          <div className="meta">
            {[cat, post.date, `${readingMinutes(body)} ${t.min}`].filter(Boolean).join(" · ")}
          </div>
          <h1>{title}</h1>
          <div className={`cover ${COVER[post.coverGradient ?? ""] ?? "art-a"}`} aria-hidden="true">
            <span className="grain" />
            <span style={{ position: "relative" }}>{title}</span>
          </div>
          <div className="content">
            {blocks.map((b, i) => {
              switch (b.t) {
                case "h2":
                  return (
                    <h2 key={i} id={b.id}>
                      {b.text}
                    </h2>
                  );
                case "h3":
                  return <h3 key={i}>{b.text}</h3>;
                case "ul":
                  return (
                    <ul key={i}>
                      {b.items.map((x, j) => (
                        <li key={j}>
                          <Txt inl={x} />
                        </li>
                      ))}
                    </ul>
                  );
                case "ol":
                  return (
                    <ol key={i}>
                      {b.items.map((x, j) => (
                        <li key={j}>
                          <Txt inl={x} />
                        </li>
                      ))}
                    </ol>
                  );
                case "note":
                  return (
                    <div key={i} className="note">
                      {b.lines.map((x, j) => (
                        <p key={j}>
                          <Txt inl={x} />
                        </p>
                      ))}
                    </div>
                  );
                case "tool": {
                  const tool = tools[b.id];
                  return tool ? <ToolCta key={i} tool={tool} lang={lang} /> : null;
                }
                default:
                  return (
                    <p key={i}>
                      <Txt inl={b.inl} />
                    </p>
                  );
              }
            })}
            {mainTool && !adaCta && <ToolCta tool={mainTool} lang={lang} />}
          </div>
          <div className="back">
            <a className="btn btn-line" href="/blog.html">
              {t.back}
            </a>
            <a className="btn btn-solid wa-link" href="#">
              {t.talk}
            </a>
          </div>
        </article>
      </section>

      {others.length > 0 && (
        <section className="band">
          <div className="row-head">
            <span>{t.more}</span>
            <a className="btn btn-line btn-sm" href="/blog.html">
              {t.all}
            </a>
          </div>
          <div className="news">
            {others.map((p) => {
              const pl: Lang = typeof p.content === "object" && p.content?.[lang] ? lang : "id";
              const pt = pick(p.title, pl);
              return (
                <a key={p.slug} className="post" href={`/blog/${p.slug}`}>
                  <div className={`cover ${COVER[p.coverGradient ?? ""] ?? "art-a"}`}>
                    <span className="grain" />
                    <span style={{ position: "relative" }}>{pt.length > 40 ? `${pt.slice(0, 38)}...` : pt}</span>
                  </div>
                  <b>{pt}</b>
                  <small>{[categoryLabel(p.category, lang), p.date].filter(Boolean).join(" · ")}</small>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
