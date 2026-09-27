import type { MetadataRoute } from "next";
import toolsData from "@public/data/tools.json";
import { allPosts, SITE } from "@/lib/blog";

// Sitemap untuk Google, dibuat otomatis dari data situs: halaman utama,
// semua tools yang tayang (tools.json), dan semua artikel blog (blog.json).
// Tool atau artikel baru dari admin panel otomatis ikut masuk.
export default function sitemap(): MetadataRoute.Sitemap {
  const halaman: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/tools.html`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/store.html`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/blog.html`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/katalog.html`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/case-studies.html`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/harga`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/pajangin`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/privasi`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/syarat`, changeFrequency: "yearly", priority: 0.3 },
  ];

  type ToolJson = { id: string; linkUrl?: string; external?: boolean; status?: string };
  const tools: MetadataRoute.Sitemap = ((toolsData as { tools?: ToolJson[] }).tools ?? [])
    .filter((t) => t.status !== "hidden" && t.status !== "soon" && !t.external && (t.linkUrl ?? "").startsWith("/tools/"))
    .map((t) => ({ url: `${SITE}${t.linkUrl}`, changeFrequency: "monthly", priority: 0.7 }));

  const blog: MetadataRoute.Sitemap = allPosts().map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    ...(p.published ? { lastModified: p.published } : {}),
    changeFrequency: "monthly",
    priority: p.category === "panduan" ? 0.7 : 0.5,
  }));

  return [...halaman, ...tools, ...blog];
}
