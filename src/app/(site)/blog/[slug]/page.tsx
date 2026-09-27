import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FkShell } from "@/components/shell/FkShell";
import { ArticleView } from "@/components/blog/ArticleView";
import { allPosts, getPost, getTool, parseContent, pick, SITE, type ToolRingkas } from "@/lib/blog";

// Semua artikel dibuat jadi halaman jadi saat build (cepat dan terbaca
// Google). Alamat yang tidak ada di blog.json langsung 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const title = pick(post.title);
  const description = pick(post.excerpt) || title;
  const url = `${SITE}/blog/${post.slug}`;
  return {
    title: `${title} · Founderku`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Founderku",
      locale: "id_ID",
      ...(post.published ? { publishedTime: post.published } : {}),
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Tool yang disebut di artikel (kartu ajakan) plus tool utama artikel
  const ids = new Set<string>();
  if (post.tool) ids.add(post.tool);
  for (const l of ["id", "en", "tr"] as const) {
    for (const b of parseContent(pick(post.content, l))) if (b.t === "tool") ids.add(b.id);
  }
  const tools: Record<string, ToolRingkas> = {};
  for (const id of ids) {
    const t = getTool(id);
    if (t) tools[id] = t;
  }

  // Artikel lain: kategori sama dulu, lalu sisanya
  const rest = allPosts().filter((p) => p.slug !== post.slug);
  const others = [...rest.filter((p) => p.category === post.category), ...rest.filter((p) => p.category !== post.category)].slice(0, 3);

  const url = `${SITE}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pick(post.title),
    description: pick(post.excerpt),
    inLanguage: "id-ID",
    mainEntityOfPage: url,
    url,
    ...(post.published ? { datePublished: post.published, dateModified: post.published } : {}),
    author: { "@type": "Organization", name: "Founderku", url: SITE },
    publisher: { "@type": "Organization", name: "Founderku", url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/images/favicon.svg` } },
  };

  return (
    <FkShell bare>
      <script
        type="application/ld+json"
        // Karakter "<" di-escape supaya teks artikel tidak bisa menutup tag script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ArticleView post={post} others={others} tools={tools} />
    </FkShell>
  );
}
