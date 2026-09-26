import Link from "next/link";
import type { Metadata } from "next";
import { requireAccount } from "@/lib/account";
import { formatTanggal } from "@/lib/access";
import { PRICING, formatRupiah } from "@/lib/pricing";
import { PageBackdrop } from "@/components/PageBackdrop";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { LogoutButton } from "@/components/LogoutButton";
import { DeleteAccountSection } from "@/components/DeleteAccountSection";
import toolsData from "../../../public/data/tools.json";

export const metadata: Metadata = {
  title: "Akun · Founderku",
};

interface ToolItem {
  id: string;
  name: string;
  logo: string;
  description: { id: string };
  linkUrl: string;
  order?: number;
}

// Tools yang sudah pindah ke dalam aplikasi founderku.com. Tools lain
// masih dibuka lewat alamat lamanya (linkUrl di data/tools.json)
// sampai dipindahkan juga.
const INTERNAL_TOOL_URLS: Record<string, string> = {
  pajangin: "/pajangin/dashboard",
};

interface SubscriptionRow {
  id: string;
  price_id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "expired";
  period_end: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<SubscriptionRow["status"], string> = {
  pending: "Menunggu pembayaran",
  paid: "Lunas",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

export default async function AkunPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { upgraded } = await searchParams;
  const { supabase, user, profile, access } = await requireAccount("/akun");

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id, price_id, amount, status, period_end, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<SubscriptionRow[]>();

  const tools = [...(toolsData.tools as ToolItem[])].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );

  return (
    <div className="relative min-h-screen">
      <PageBackdrop variant="dashboard" />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <SiteHeader isLoggedIn />

        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="min-w-0">
            <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-1">
              Akun
            </p>
            <h1 className="font-manrope font-extrabold text-3xl tracking-tight mb-1">
              Akun Saya
            </h1>
            <p className="text-sm text-text-soft truncate">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {upgraded === "1" && (
          <p className="text-sm bg-amber/15 rounded-2xl px-4 py-3 mb-6">
            Makasih! Pembayaran kamu sedang dikonfirmasi. Biasanya cuma
            beberapa detik. Kalau status di bawah belum berubah, muat ulang
            halaman ini sebentar lagi.
          </p>
        )}

        <Card className="mb-6 bg-white">
          <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-2">
            Paket
          </p>
          {access.isPaid && access.activeUntil ? (
            <>
              <h2 className="font-manrope font-extrabold text-xl mb-1">
                {PRICING.planName} aktif
              </h2>
              <p className="text-sm text-text-soft mb-4">
                Berlaku sampai {formatTanggal(access.activeUntil)} ({access.daysLeft} hari lagi).
              </p>
              <Link href="/harga">
                <Pill variant="outline">Perpanjang</Pill>
              </Link>
            </>
          ) : access.onTrial && access.activeUntil ? (
            <>
              <h2 className="font-manrope font-extrabold text-xl mb-1">
                Trial {PRICING.planName}
              </h2>
              <p className="text-sm text-text-soft mb-4">
                Semua fitur Pro terbuka sampai {formatTanggal(access.activeUntil)} (
                {access.daysLeft} hari lagi). Setelah itu akun balik ke versi
                gratis, kecuali kamu berlangganan.
              </p>
              <Link href="/harga">
                <Pill variant="solid-amber">Berlangganan Sekarang</Pill>
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-manrope font-extrabold text-xl mb-1">Free</h2>
              <p className="text-sm text-text-soft mb-4">
                {access.trialEndsAt
                  ? `Trial kamu sudah berakhir pada ${formatTanggal(access.trialEndsAt)}. `
                  : ""}
                Upgrade ke {PRICING.planName} buat buka semua fitur lagi.
              </p>
              <Link href="/harga">
                <Pill variant="solid-amber">Lihat Harga</Pill>
              </Link>
            </>
          )}
        </Card>

        <Card className="mb-6 bg-white">
          <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-4">
            Tools Kamu
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {tools.map((tool) => {
              const internal = INTERNAL_TOOL_URLS[tool.id];
              const className =
                "flex items-center gap-3 rounded-2xl border border-border p-3 hover:border-ink/30 hover:-translate-y-0.5 transition-all";
              const inner = (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={"/" + tool.logo}
                    alt=""
                    className="w-10 h-10 rounded-xl object-contain bg-bg-soft flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-manrope font-bold text-sm">{tool.name}</div>
                    <div className="text-xs text-text-soft truncate">
                      {tool.description.id}
                    </div>
                  </div>
                </>
              );
              return internal ? (
                <Link key={tool.id} href={internal} className={className}>
                  {inner}
                </Link>
              ) : (
                <a
                  key={tool.id}
                  href={tool.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {inner}
                </a>
              );
            })}
          </div>
        </Card>

        {subscriptions && subscriptions.length > 0 && (
          <Card className="mb-6 bg-white">
            <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-3">
              Riwayat Pembayaran
            </p>
            <ul className="divide-y divide-border">
              {subscriptions.map((s) => {
                const label =
                  PRICING.prices.find((p) => p.id === s.price_id)?.label.id ?? s.price_id;
                return (
                  <li key={s.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <div>
                      <div className="font-manrope font-bold">
                        {label} · {formatRupiah(Number(s.amount))}
                      </div>
                      <div className="text-xs text-text-faint">
                        {formatTanggal(new Date(s.created_at))}
                        {s.status === "paid" && s.period_end
                          ? ` · aktif sampai ${formatTanggal(new Date(s.period_end))}`
                          : ""}
                      </div>
                    </div>
                    <span className="text-xs font-manrope font-bold text-text-soft whitespace-nowrap">
                      {STATUS_LABEL[s.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        {profile?.is_admin && (
          <Card className="mb-6 bg-white">
            <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-2">
              Admin
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-bold">
              <Link href="/pajangin/moderasi" className="border-b-2 border-indigo">
                Moderasi Pajangin
              </Link>
              <a href="/admin.html" className="border-b-2 border-indigo">
                Admin konten situs
              </a>
            </div>
          </Card>
        )}

        <DeleteAccountSection />
      </div>
    </div>
  );
}
