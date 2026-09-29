import type { Metadata } from "next";
import { FkShell } from "@/components/shell/FkShell";
import { SsEtalase } from "@/components/social/SsEtalase";
import { getSsViewer } from "@/lib/socialSpace";

export const metadata: Metadata = {
  title: "Social Space · Dari skill jadi penghasilan",
  description:
    "Etalase produk dan jasa dari pengguna Founderku, info beasiswa, magang, dan lowongan, serta tukar skill bareng founder lain. Gratis dengan satu akun Founderku.",
  alternates: { canonical: "/social-space" },
};

// Halaman utama Social Space: Etalase. Bisa dilihat tanpa login.
export default async function SocialSpacePage() {
  const { userId, isAdmin } = await getSsViewer();
  return (
    <FkShell bare>
      <SsEtalase userId={userId} isAdmin={isAdmin} landing />
    </FkShell>
  );
}
