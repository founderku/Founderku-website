import type { Metadata } from "next";
import { FkShell } from "@/components/shell/FkShell";
import { SsEtalase } from "@/components/social/SsEtalase";
import { getSsViewer } from "@/lib/socialSpace";

export const metadata: Metadata = {
  title: "Etalase · Social Space",
  description: "Produk dan jasa dari pengguna Founderku. Hubungi penjualnya langsung lewat halaman Pajangin.",
  alternates: { canonical: "/social-space/etalase" },
};

export default async function SsEtalasePage() {
  const { userId, isAdmin } = await getSsViewer();
  return (
    <FkShell bare>
      <SsEtalase userId={userId} isAdmin={isAdmin} />
    </FkShell>
  );
}
