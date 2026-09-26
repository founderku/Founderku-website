import Link from "next/link";
import type { Metadata } from "next";
import { requireAccount } from "@/lib/account";
import { formatTanggal } from "@/lib/access";
import { displayName } from "@/lib/names";
import { PRICING, formatRupiah } from "@/lib/pricing";
import { AnimatedBackdrop } from "@/components/AnimatedBackdrop";
import { SiteHeader } from "@/components/SiteHeader";
import { Pill } from "@/components/ui/Pill";
import { LogoutButton } from "@/components/LogoutButton";
import { DeleteAccountSection } from "@/components/DeleteAccountSection";
import { ToolIcon, TOOL_SHORT } from "@/components/ToolIcon";
import { NameEditor } from "@/components/NameEditor";
import toolsData from "@public/data/tools.json";

export const metadata: Metadata = {
  title: "Akun · Founderku",
};

interface ToolItem {
  id: string;
  name: string;
  description: { id: string } | string;
  linkUrl: string;
  order?: number;
}

// Tools yang sudah pindah ke dalam aplikasi founderku.com. Tools lain
// masih dibuka lewat alamat lamanya (linkUrl di data/tools.json)
// sampai dipindahkan juga.
const INTERNAL_TOOL_URLS: Record<string, string> = {
  pajangin: "/pajangin/dashboard",
  notain: "/tools/notain",
  pajakin: "/tools/pajakin",
  kontrakin: "/tools/kontrakin",
  jalanin: "/tools/jalanin",
  sehatin: "/tools/sehatin",
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

// Jeda animasi masuk tiap kartu (biar muncul bergantian)
const rise = (i: number) => ({ animationDelay: `${80 + i * 90}ms` });

function toolDesc(tool: ToolItem): string {
  if (TOOL_SHORT[tool.id]) return TOOL_SHORT[tool.id];
  const d = typeof tool.description === "string" ? tool.description : tool.description.id;
  return d.length > 70 ? d.slice(0, 68).trimEnd() + "..." : d;
}

export default async function AkunPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { upgraded } = await searchParams;
  const { supabase, user, profile, access } = await requireAccount("/akun");
  const name = displayName(user);

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

  const trialPct =
    access.onTrial && PRICING.trialDays > 0
      ? Math.max(4, Math.min(100, Math.round((access.daysLeft / PRICING.trialDays) * 100)))
      : 0;

  return (
    <div className="fk-app">
      <AnimatedBackdrop />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <SiteHeader isLoggedIn />

        <div className="fk-rise flex items-start justify-between gap-4 mb-8" style={rise(0)}>
          <div className="min-w-0">
            <p className="font-manrope text-xs font-bold uppercase tracking-widest text-text-faint mb-2">
              Akun Saya
            </p>
            <h1 className="font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">
              Hai{name ? `, ${name}` : ""}! <span className="fk-wave">👋</span>
            </h1>
            <p className="text-sm text-text-soft mt-1 truncate">{user.email}</p>
            <NameEditor currentName={name} />
          </div>
          <div className="pt-1 flex-shrink-0">
            <LogoutButton />
          </div>
        </div>

        {upgraded === "1" && (
          <p className="fk-rise text-sm bg-amber/15 border border-amber/30 rounded-2xl px-4 py-3 mb-6" style={rise(1)}>
            Makasih! Pembayaran kamu sedang dikonfirmasi. Biasanya cuma
            beberapa detik. Kalau status di bawah belum berubah, muat ulang
            halaman ini sebentar lagi.
          </p>
        )}

        {/* ---------- Paket ---------- */}
        <section
          className={`fk-rise fk-app-card p-6 sm:p-7 mb-6 ${access.hasPro ? "ring-2 ring-amber/60" : ""}`}
          style={rise(1)}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="font-manrope text-xs font-bold uppercase tracking-widest text-text-faint">
              Paket
            </p>
            <span
              className={`font-manrope font-extrabold text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${
                access.isPaid
                  ? "glass-amber text-ink"
                  : access.onTrial
                  ? "bg-amber/20 text-[#c47a06]"
                  : "bg-indigo/15 text-indigo"
              }`}
            >
              {access.isPaid ? "Pro" : access.onTrial ? "Trial" : "Free"}
            </span>
          </div>

          {access.isPaid && access.activeUntil ? (
            <>
              <h2 className="font-manrope font-extrabold text-xl sm:text-2xl mb-1">
                {PRICING.planName} aktif
              </h2>
              <p className="text-sm text-text-soft mb-5">
                Berlaku sampai {formatTanggal(access.activeUntil)} ({access.daysLeft} hari lagi).
              </p>
              <Link href="/harga">
                <Pill variant="outline">Perpanjang</Pill>
              </Link>
            </>
          ) : access.onTrial && access.activeUntil ? (
            <>
              <h2 className="font-manrope font-extrabold text-xl sm:text-2xl mb-1">
                Trial {PRICING.planName}
              </h2>
              <p className="text-sm text-text-soft mb-4">
                Semua fitur Pro terbuka sampai {formatTanggal(access.activeUntil)}. Setelah itu
                akun balik ke versi gratis, kecuali kamu berlangganan.
              </p>
              <div className="mb-5">
                <div className="flex justify-between text-xs font-manrope font-bold text-text-soft mb-1.5">
                  <span>Sisa trial</span>
                  <span>{access.daysLeft} hari</span>
                </div>
                <div className="h-2.5 rounded-full bg-amber/15 overflow-hidden">
                  <div
                    className="fk-bar-fill h-full rounded-full"
                    style={{ width: `${trialPct}%`, background: "linear-gradient(90deg,#f2a623,#e15c3e)" }}
                  />
                </div>
              </div>
              <Link href="/harga">
                <Pill variant="solid-amber">Berlangganan Sekarang</Pill>
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-manrope font-extrabold text-xl sm:text-2xl mb-1">Free</h2>
              <p className="text-sm text-text-soft mb-5">
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
        </section>

        {/* ---------- Tools ---------- */}
        <section className="fk-rise fk-app-card p-6 sm:p-7 mb-6" style={rise(2)}>
          <p className="font-manrope text-xs font-bold uppercase tracking-widest text-text-faint mb-4">
            Tools Kamu
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {tools.map((tool, i) => {
              const internal = INTERNAL_TOOL_URLS[tool.id];
              const className =
                "fk-rise group flex items-center gap-3.5 rounded-2xl border border-border bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-amber/60 hover:shadow-[0_14px_30px_-18px_rgba(225,92,62,0.55)]";
              const inner = (
                <>
                  <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <ToolIcon id={tool.id} name={tool.name} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-manrope font-extrabold text-sm">{tool.name}</div>
                    <div className="text-xs text-text-soft leading-snug mt-0.5">{toolDesc(tool)}</div>
                  </div>
                  <span
                    className="text-text-faint transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    {internal ? "→" : "↗"}
                  </span>
                </>
              );
              const style = { animationDelay: `${260 + i * 60}ms` };
              // /tools/... punya layout sendiri (bukan layout situs), jadi
              // dibuka pakai <a> biasa (muat ulang penuh), bukan <Link>.
              if (internal?.startsWith("/tools/")) {
                return (
                  <a key={tool.id} href={internal} className={className} style={style}>
                    {inner}
                  </a>
                );
              }
              return internal ? (
                <Link key={tool.id} href={internal} className={className} style={style}>
                  {inner}
                </Link>
              ) : (
                <a
                  key={tool.id}
                  href={tool.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  style={style}
                >
                  {inner}
                </a>
              );
            })}
          </div>
        </section>

        {subscriptions && subscriptions.length > 0 && (
          <section className="fk-rise fk-app-card p-6 sm:p-7 mb-6" style={rise(3)}>
            <p className="font-manrope text-xs font-bold uppercase tracking-widest text-text-faint mb-3">
              Riwayat Pembayaran
            </p>
            <ul className="divide-y divide-border">
              {subscriptions.map((s) => {
                const label =
                  PRICING.prices.find((p) => p.id === s.price_id)?.label.id ?? s.price_id;
                return (
                  <li key={s.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
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
                    <span
                      className={`text-[11px] font-manrope font-bold whitespace-nowrap px-2.5 py-1 rounded-full ${
                        s.status === "paid"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : s.status === "pending"
                          ? "bg-amber/15 text-[#c47a06]"
                          : "text-text-soft"
                      }`}
                      style={
                        s.status === "paid" || s.status === "pending"
                          ? undefined
                          : { background: "var(--app-border)" }
                      }
                    >
                      {STATUS_LABEL[s.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {profile?.is_admin && (
          <section className="fk-rise fk-app-card p-6 sm:p-7 mb-6" style={rise(4)}>
            <p className="font-manrope text-xs font-bold uppercase tracking-widest text-text-faint mb-3">
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
          </section>
        )}

        <div className="fk-rise" style={rise(5)}>
          <DeleteAccountSection />
        </div>
      </div>
    </div>
  );
}
