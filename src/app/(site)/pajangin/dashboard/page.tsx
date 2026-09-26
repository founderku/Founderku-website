import Link from "next/link";
import { requireAccount } from "@/lib/account";
import { lockedPageIds } from "@/lib/access";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StoreSlugEditor } from "@/components/StoreSlugEditor";
import { PlanBadge } from "@/components/PlanBadge";
import { PageBackdrop } from "@/components/PageBackdrop";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProductCard } from "@/components/ProductCard";
import { WelcomeModal } from "@/components/WelcomeModal";
import { PublishToast } from "@/components/PublishToast";
import { UpgradeToast } from "@/components/UpgradeToast";
import { ShareLinkButtons } from "@/components/ShareLinkButtons";
import { TIER_LIMITS } from "@/lib/constants";
import type { PageRow } from "@/lib/types";

interface PageRowWithTakedown extends PageRow {
  takedowns: { reason: string; created_at: string }[] | null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    firstPublish?: string;
    slug?: string;
    upgraded?: string;
  }>;
}) {
  const { firstPublish, slug: publishedSlug, upgraded } = await searchParams;
  const { supabase, user, profile, access } = await requireAccount(
    "/pajangin/dashboard"
  );

  const [{ data: pages }] = await Promise.all([
    supabase
      .from("pages")
      .select("*, takedowns(reason, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<PageRowWithTakedown[]>(),
  ]);

  // Pro = trial ATAU langganan Founderku Pro masih aktif
  const isPro = access.hasPro;
  const maxPages = isPro ? TIER_LIMITS.pro.maxPages : TIER_LIMITS.free.maxPages;
  const activePages = (pages ?? []).filter((p) => p.status !== "taken_down");
  const atLimit = !isPro && activePages.length >= maxPages;
  // Kalau Pro/trial habis, halaman di atas batas Free jadi "terkunci"
  // (gak tayang ke publik) sampai upgrade lagi. Gak dihapus.
  const locked = lockedPageIds(pages ?? [], isPro, TIER_LIMITS.free.maxPages);
  const totalClicks = (pages ?? []).reduce((sum, p) => sum + p.click_count, 0);

  return (
    <div className="fk-app">
      <PageBackdrop variant="dashboard" />
      <WelcomeModal hasPages={(pages?.length ?? 0) > 0} />
      {firstPublish === "1" && publishedSlug && (
        <PublishToast slug={publishedSlug} />
      )}
      {upgraded === "1" && <UpgradeToast />}
      <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/pajangin" className="inline-flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pajangin-assets/logo.jpeg"
            alt="Pajangin"
            className="w-8 h-8 rounded-xl transition-transform group-hover:-translate-y-0.5"
          />
          <span className="font-manrope font-extrabold text-sm">Pajangin</span>
        </Link>
        <div className="flex items-center gap-4">
          {profile?.is_admin && (
            <Link
              href="/pajangin/moderasi"
              className="text-xs font-manrope font-bold text-indigo hover:text-ink transition-colors"
            >
              Moderasi
            </Link>
          )}
          <Link
            href="/akun"
            className="text-xs font-manrope font-bold text-text-soft hover:text-ink transition-colors"
          >
            Akun
          </Link>
          <LogoutButton />
          <ThemeToggle />
        </div>
      </div>

      <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-1">
        Dashboard
      </p>
      <h1 className="font-manrope font-extrabold text-3xl tracking-tight mb-1">
        Halaman Saya
      </h1>
      <p className="text-sm text-text-soft mb-8">
        Ringkasan semua halaman jualan yang sudah kamu buat.
      </p>

      <div className="flex flex-col sm:flex-row gap-3.5 mb-8">
        <Card className="flex-1">
          <div className="font-manrope font-extrabold text-2xl">
            {activePages.length}
            {isPro ? "" : ` / ${maxPages}`}
          </div>
          <div className="text-xs text-text-soft mt-1">
            Halaman terpakai{isPro ? "" : " (batas Free)"}
          </div>
        </Card>
        <Card className="flex-1">
          <div className="font-manrope font-extrabold text-2xl">
            {totalClicks}
          </div>
          <div className="text-xs text-text-soft mt-1">
            Total klik semua halaman
          </div>
        </Card>
        <Card className="flex items-center">
          <PlanBadge isPro={isPro} onTrial={access.onTrial} daysLeft={access.daysLeft} />
        </Card>
      </div>

      <Card className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-manrope font-extrabold text-base mb-1">
            Edit Style Tokomu
          </h2>
          <p className="text-xs text-text-soft">
            Ganti gaya visual halaman produk kamu - 5 pilihan tersedia.
          </p>
        </div>
        <Link href="/pajangin/dashboard/style">
          <Pill variant="outline" className="whitespace-nowrap">
            Ganti Style →
          </Pill>
        </Link>
      </Card>

      <Card className="mb-8">
        <h2 className="font-manrope font-extrabold text-base mb-1">
          Halaman Toko
        </h2>
        <p className="text-xs text-text-soft mb-4">
          1 link yang gabungin semua produk aktif kamu, buat dishare kalau
          calon pembeli mau lihat-lihat semuanya sekaligus.
        </p>
        <StoreSlugEditor
          userId={user.id}
          currentStoreSlug={profile?.store_slug ?? null}
        />
        {profile?.store_slug && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={`/toko/${profile.store_slug}`}
              target="_blank"
              className="text-sm font-bold text-ink border-b-2 border-indigo"
            >
              Lihat halaman toko saya →
            </Link>
            <ShareLinkButtons
              url={`https://founderku.com/toko/${profile.store_slug}`}
              title={`Toko ${profile.store_slug} di Pajangin`}
            />
          </div>
        )}
      </Card>

      <div className="flex justify-end mb-2">
        {atLimit ? (
          <Pill variant="outline" disabled>
            + Buat Halaman Baru
          </Pill>
        ) : (
          <Link href="/pajangin/dashboard/new">
            <Pill variant="solid-dark">+ Buat Halaman Baru</Pill>
          </Link>
        )}
      </div>
      {atLimit && (
        <p className="text-xs text-coral text-right mb-6">
          Batas Free tercapai ({activePages.length}/{maxPages}).{" "}
          <Link href="/harga" className="underline font-bold">
            Upgrade ke Founderku Pro
          </Link>{" "}
          untuk halaman tanpa batas.
        </p>
      )}

      {!pages || pages.length === 0 ? (
        <div>
          <p className="text-center text-xs font-manrope font-bold uppercase tracking-wide text-text-faint mb-3">
            Contoh halaman jadi (bukan halaman kamu)
          </p>
          <div className="max-w-sm mx-auto mb-3 pointer-events-none select-none">
            <ProductCard
              style="klasik"
              data={{
                productName: "Kopi Susu Gula Aren 250ml",
                tagline: "Manis pas, tanpa pakai pemanis buatan",
                originalPrice: 18000,
                promoPrice: 15000,
                highlights: [
                  "Gula aren asli, bukan sirup",
                  "Kopi diseduh fresh tiap pesanan",
                  "Bisa request less sweet",
                ],
                imageUrl: "/pajangin-assets/photos/p11.jpg",
                whatsappNumber: "081200000000",
                showWatermark: true,
              }}
            />
          </div>
          <p className="text-center text-xs text-text-faint mb-6">
            Ini cuma contoh. Klik &quot;Buat Halaman Pertama&quot; di bawah
            buat bikin punya kamu sendiri.
          </p>
          <Card className="text-center py-8">
            <h2 className="font-manrope font-extrabold text-lg mb-1.5">
              Belum ada halaman yang kamu buat
            </h2>
            <p className="text-sm text-text-soft mb-5">
              Halaman jualan pertamamu cuma butuh beberapa menit. Foto
              produk, harga, dan nomor WhatsApp aja sudah cukup buat mulai.
            </p>
            <Link href="/pajangin/dashboard/new">
              <Pill variant="solid-amber">Buat Halaman Pertama</Pill>
            </Link>
          </Card>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pages.map((page) => (
            <Card key={page.id} className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-amber to-coral flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-manrope font-bold text-sm truncate">
                      {page.product_name}
                    </div>
                    <div className="text-xs text-text-soft truncate">
                      founderku.com/l/{page.slug}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 pl-[64px] sm:pl-0">
                  <StatusBadge status={locked.has(page.id) ? "locked" : page.status} />
                  <div className="text-sm text-text-soft w-16 text-right">
                    {locked.has(page.id) ? "-" : `${page.click_count} klik`}
                  </div>
                  <Link
                    href={`/pajangin/dashboard/edit/${page.id}`}
                    className="text-sm font-bold text-ink border-b-2 border-amber whitespace-nowrap"
                  >
                    Edit
                  </Link>
                </div>
              </div>
              {page.status === "taken_down" && page.takedowns && page.takedowns.length > 0 && (
                <div className="mt-3 pl-0 sm:pl-[64px] text-xs text-coral bg-coral/10 rounded-xl px-3 py-2">
                  <span className="font-manrope font-bold">
                    Halaman ini diturunkan:
                  </span>{" "}
                  {
                    [...page.takedowns].sort((a, b) =>
                      b.created_at.localeCompare(a.created_at)
                    )[0].reason
                  }
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
