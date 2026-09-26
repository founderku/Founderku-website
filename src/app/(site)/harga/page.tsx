import type { Metadata } from "next";
import Script from "next/script";
import { createClient } from "@/lib/supabase/server";
import { getAccessStatus } from "@/lib/access";
import { PRICING } from "@/lib/pricing";
import { HargaView } from "@/components/HargaView";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = {
  title: `Harga · ${PRICING.planName}`,
  description: PRICING.description.id,
};

// Tampilan sama dengan beranda: gaya dan navigasi diambil dari
// /assets/fk-site.css dan /assets/fk-site.js (dipakai juga halaman statis).
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
    <>
      {/* Gaya bersama dengan halaman statis (file di public/), jadi tidak bisa di-import */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/assets/fk-site.css" precedence="default" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* Font Poppins cuma dipakai halaman ini di dalam aplikasi (sama dengan beranda) */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        precedence="default"
      />
      <div className="fk-page">
        {/* Diisi oleh fk-site.js setelah halaman aktif */}
        <header className="nav" id="nav" data-fk-nav suppressHydrationWarning />
        <main className="frame">
          <HargaView
            loggedIn={!!user}
            hasPro={access.hasPro}
            onTrial={access.onTrial}
            activeUntil={access.activeUntil ? access.activeUntil.toISOString() : null}
            failed={failed === "1"}
          />
          <footer className="band" data-fk-foot suppressHydrationWarning />
        </main>
      </div>
      <Script src="/assets/fk-site.js" strategy="afterInteractive" />
    </>
  );
}
