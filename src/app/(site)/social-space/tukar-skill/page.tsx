import type { Metadata } from "next";
import { FkShell } from "@/components/shell/FkShell";
import { SsFeed } from "@/components/social/SsFeed";
import { getSsViewer } from "@/lib/socialSpace";

export const metadata: Metadata = {
  title: "Tukar Skill · Social Space",
  description:
    "Tukar skill bareng founder lain tanpa bayar. Pasang tawaran, ajak tukar, ngobrol, lalu saling kasih ulasan. Gratis dengan akun Founderku.",
  alternates: { canonical: "/social-space/tukar-skill" },
};

// Tab Tukar Skill Social Space. Bisa dilihat tanpa login.
export default async function SocialSpacePage({ searchParams }: { searchParams: Promise<{ cari?: string }> }) {
  const { cari } = await searchParams;
  const { userId, isAdmin } = await getSsViewer();
  return (
    <FkShell bare>
      <SsFeed userId={userId} isAdmin={isAdmin} initialQuery={(cari ?? "").slice(0, 60)} />
    </FkShell>
  );
}
