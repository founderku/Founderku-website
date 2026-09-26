import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TokoPage } from "@/components/etalase/TokoPage";
import type { PageRow, StoreProfile } from "@/lib/types";
import { lockedPageIds } from "@/lib/access";
import { TIER_LIMITS } from "@/lib/constants";

export default async function StorePage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const supabase = await createClient();

  // Cari pemilik toko lewat fungsi get_store_profile_by_slug (bisa diakses publik,
  // beda dari tabel profiles yang cuma bisa dibaca pemiliknya sendiri).
  // Sekalian cek siapa yang lagi buka halaman - ini independen, gak
  // perlu nunggu bergantian.
  const [{ data: ownerRows }, { data: { user: viewer } }] = await Promise.all([
    supabase.rpc("get_store_profile_by_slug", {
      lookup_store_slug: storeSlug,
    }),
    supabase.auth.getUser(),
  ]);
  const owner = ownerRows?.[0] as StoreProfile | undefined;

  if (!owner) notFound();

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", owner.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .returns<PageRow[]>();

  const isOwner = viewer?.id === owner.id;

  // Pemilik tanpa trial/Pro aktif: cuma 2 halaman terlama yang tayang.
  const locked = lockedPageIds(pages ?? [], owner.has_pro, TIER_LIMITS.free.maxPages);
  const visiblePages = (pages ?? []).filter((p) => !locked.has(p.id));

  return (
    <TokoPage
      style={owner.store_style}
      isOwner={isOwner}
      data={{
        storeSlug,
        isPro: owner.has_pro,
        products: visiblePages,
      }}
    />
  );
}
