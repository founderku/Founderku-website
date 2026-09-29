import type { Metadata } from "next";
import { FkShell } from "@/components/shell/FkShell";
import { SsPublicProfile } from "@/components/social/SsPublicProfile";
import { getSsViewer } from "@/lib/socialSpace";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle} · Social Space`, robots: { index: false } };
}

// Profil publik. Bisa dilihat tanpa login (kalau profilnya publik).
export default async function SsUserPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const { userId, isAdmin } = await getSsViewer();
  return (
    <FkShell bare>
      <SsPublicProfile handle={decodeURIComponent(handle).toLowerCase().slice(0, 30)} userId={userId} isAdmin={isAdmin} />
    </FkShell>
  );
}
