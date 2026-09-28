import { PANDUAN } from "@/lib/tools/panduan";
import { allPosts, pick } from "@/lib/blog";
import s from "./ToolGuide.module.css";

// Panduan di bawah tool (apa ini, cara pakai, rumus, FAQ, artikel terkait).
// Komponen server: teksnya ada di HTML awal sehingga terbaca mesin
// pencari, tidak menunggu tool selesai dimuat. Tidak ikut tercetak.
export function ToolGuide({ toolId, toolName }: { toolId: string; toolName: string }) {
  const p = PANDUAN[toolId];
  if (!p) return null;
  const artikel = allPosts().filter((x) => x.tool === toolId && x.category === "panduan");

  // Data terstruktur FAQ untuk mesin pencari (tidak terlihat pengunjung)
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section className={`${s.guide} no-print`} aria-labelledby={`panduan-${toolId}`}>
      <div className={s.wrap}>
        <div className={s.eyebrow}>Panduan {toolName}</div>
        <h2 id={`panduan-${toolId}`} className={s.h2}>
          {p.judul}
          <span className={s.dot}>.</span>
        </h2>
        <div className={s.intro}>
          {p.intro.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>

        <div className={s.grid}>
          <div className={s.box}>
            <h3 className={s.h3}>Cara pakai</h3>
            <ol className={s.steps}>
              {p.langkah.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          </div>
          {p.rumus && (
            <div className={s.box}>
              <h3 className={s.h3}>{p.rumus.judul}</h3>
              <div className={s.rumus}>
                {p.rumus.baris.map((t, i) => (
                  <code key={i}>{t}</code>
                ))}
              </div>
              {p.rumus.catatan && <p className={s.note}>{p.rumus.catatan}</p>}
            </div>
          )}
        </div>

        <h3 className={s.h3}>Pertanyaan yang sering muncul</h3>
        <div className={s.faq}>
          {p.faq.map((f, i) => (
            <details key={i} className={s.item}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        {artikel.length > 0 && (
          <div className={s.read}>
            <h3 className={s.h3}>Baca juga</h3>
            {artikel.map((a) => (
              <a key={a.slug} href={`/blog/${a.slug}`}>
                <span>{pick(a.title, "id")}</span>
              </a>
            ))}
          </div>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </section>
  );
}
