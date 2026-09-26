import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAccessStatus, formatTanggal } from "@/lib/access";
import { PRICING, formatRupiah, periodSuffix } from "@/lib/pricing";
import { PageBackdrop } from "@/components/PageBackdrop";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { UpgradePlanPicker } from "@/components/UpgradePlanPicker";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = {
  title: `Harga · ${PRICING.planName}`,
  description: PRICING.description.id,
};

export default async function HargaPage({
  searchParams,
}: {
  searchParams: Promise<{ failed?: string }>;
}) {
  const { failed } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    ({ data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single<Profile>());
  }
  const access = getAccessStatus(profile);

  return (
    <div className="relative min-h-screen">
      <PageBackdrop variant="form" />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <SiteHeader isLoggedIn={!!user} />

        <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-1">
          Harga
        </p>
        <h1 className="font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight mb-2">
          {PRICING.planName}
        </h1>
        <p className="text-text-soft mb-8">{PRICING.description.id}</p>

        {failed === "1" && (
          <p className="text-sm text-coral bg-coral/10 rounded-2xl px-4 py-3 mb-6">
            Pembayaran belum berhasil atau dibatalkan. Kamu bisa coba lagi
            di bawah.
          </p>
        )}

        <Card className="mb-6 bg-white">
          <h2 className="font-manrope font-extrabold text-base mb-3">
            Yang kamu dapat
          </h2>
          <ul className="space-y-2">
            {PRICING.features.map((f) => (
              <li key={f.id} className="flex gap-2 text-sm">
                <span className="text-amber font-bold">✓</span>
                {f.id}
              </li>
            ))}
          </ul>
        </Card>

        {user ? (
          <Card className="bg-white">
            {access.hasPro && access.activeUntil && (
              <p className="text-sm bg-amber/10 rounded-xl px-4 py-3 mb-5">
                {access.onTrial
                  ? `Trial kamu aktif sampai ${formatTanggal(access.activeUntil)}. Bayar sekarang, masa aktif langsung jalan dan trial nggak hangus sia-sia.`
                  : `${PRICING.planName} kamu aktif sampai ${formatTanggal(access.activeUntil)}. Kalau bayar lagi sekarang, masa aktifnya ditambahkan setelah tanggal itu (sisa hari nggak hangus).`}
              </p>
            )}
            <UpgradePlanPicker />
          </Card>
        ) : (
          <Card className="bg-white">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {PRICING.prices.map((price) => (
                <div key={price.id} className="rounded-2xl p-5 border-2 border-border">
                  <p className="font-manrope font-bold text-sm mb-1">
                    {price.label.id}
                    {price.note?.id && (
                      <span className="ml-2 text-[10px] glass-amber text-ink px-2 py-0.5 rounded-full">
                        {price.note.id}
                      </span>
                    )}
                  </p>
                  <p className="font-manrope font-extrabold text-2xl">
                    {formatRupiah(price.amount)}
                    <span className="text-xs font-normal text-text-faint">
                      {periodSuffix(price.days)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <Link href="/daftar?next=/akun" className="block">
              <Pill variant="solid-amber" className="w-full">
                Coba Gratis {PRICING.trialDays} Hari
              </Pill>
            </Link>
            <p className="text-xs text-text-soft text-center mt-3">
              Tanpa kartu, tanpa bayar di awal. Sudah punya akun?{" "}
              <Link href="/masuk?next=/harga" className="font-bold text-ink underline">
                Masuk
              </Link>
            </p>
          </Card>
        )}

        <p className="text-xs text-text-faint mt-6">
          Setelah trial atau langganan habis, akun kamu otomatis balik ke
          versi gratis. Data kamu nggak dihapus. Di Pajangin, versi gratis
          tetap bisa dipakai untuk 2 halaman jualan (dengan watermark).
        </p>
      </div>
    </div>
  );
}
