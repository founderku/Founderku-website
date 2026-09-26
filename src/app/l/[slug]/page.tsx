import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EtalasePage } from "@/components/etalase/EtalasePage";
import type { PageRow, StoreProfile } from "@/lib/types";
import { lockedPageIds } from "@/lib/access";
import { TIER_LIMITS } from "@/lib/constants";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: page }, { data: { user: viewer } }] = await Promise.all([
    supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single<PageRow>(),
    supabase.auth.getUser(),
  ]);

  if (!page) notFound();

  // Cek siapa yang lagi buka halaman ini - kalau pemiliknya sendiri
  // (lagi login), tampilin banner kecil "kembali ke dashboard" di atas.
  // Pembeli biasa (belum tentu login, atau login tapi bukan pemilik)
  // tidak akan pernah lihat banner ini.
  const isOwner = viewer?.id === page.user_id;

  // Cek status Pro & store_slug pemilik halaman lewat fungsi get_store_profile_by_id
  // (bukan tabel profiles langsung) - soalnya pengunjung di sini belum
  // tentu login, dan tabel profiles cuma bisa dibaca sama pemiliknya
  // sendiri. Fungsi ini sengaja dibuat buat diakses publik, cuma
  // nampilin kolom aman (bukan email).
  const { data: ownerRows } = await supabase.rpc("get_store_profile_by_id", {
    lookup_id: page.user_id,
  });
  const owner = ownerRows?.[0] as StoreProfile | undefined;

  // Pemilik tanpa trial/Pro aktif: cuma 2 halaman terlama yang tayang,
  // sisanya terkunci (dianggap gak ada) sampai pemiliknya upgrade.
  if (!owner?.has_pro) {
    const { data: ownerPages } = await supabase
      .from("pages")
      .select("id, status, created_at")
      .eq("user_id", page.user_id)
      .eq("status", "active");
    const locked = lockedPageIds(ownerPages ?? [], false, TIER_LIMITS.free.maxPages);
    if (locked.has(page.id)) notFound();
  }

  // Tambah counter klik (fire-and-forget, tidak perlu ditunggu user).
  // visitor_hash dipakai server-side buat nyegah 1 pengunjung nge-spam
  // klik ke halaman yang sama berkali-kali - IP asli tidak pernah
  // disimpan, cuma hash-nya (satu arah, gak bisa dibalikin ke IP asli).
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headerList.get("x-real-ip") ??
    "unknown";
  const visitorHash = createHash("sha256").update(ip).digest("hex");
  // Dipanggil pakai kunci server (service_role): fungsi ini sengaja gak
  // bisa dipanggil langsung dari browser, biar jumlah klik gak bisa
  // dipalsukan.
  createAdminClient()
    .rpc("increment_page_click", { page_slug: slug, visitor_hash: visitorHash })
    .then();

  return (
    <EtalasePage
      style={owner?.store_style ?? "klasik"}
      isOwner={isOwner}
      data={{
        productName: page.product_name,
        tagline: page.tagline ?? "",
        originalPrice: page.original_price,
        promoPrice: page.promo_price,
        highlights: page.highlights ?? [],
        imageUrl: page.image_url,
        whatsappNumber: page.whatsapp_number,
        showWatermark: !owner?.has_pro,
        storeSlug: owner?.store_slug ?? null,
      }}
    />
  );
}
