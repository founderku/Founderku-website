import type { Metadata } from "next";
import { FkShell } from "@/components/shell/FkShell";
import { createClient } from "@/lib/supabase/server";
import { getAccessStatus } from "@/lib/access";
import { PRICING } from "@/lib/pricing";
import { HargaView } from "@/components/HargaView";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = {
  title: `Harga · ${PRICING.planName}`,
  description: PRICING.description.id,
};

// Tampilan sama dengan beranda lewat FkShell (navigasi & footer bersama).
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
    <FkShell bare>
      <HargaView
        loggedIn={!!user}
        hasPro={access.hasPro}
        onTrial={access.onTrial}
        activeUntil={access.activeUntil ? access.activeUntil.toISOString() : null}
        failed={failed === "1"}
      />
    </FkShell>
  );
}
