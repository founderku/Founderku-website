import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FkShell } from "@/components/shell/FkShell";
import { SsChat } from "@/components/social/SsChat";
import { requireAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Chat · Social Space", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SsChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { user, profile } = await requireAccount(`/social-space/chat/${id}`);
  return (
    <FkShell bare>
      <SsChat userId={user.id} requestId={id} isAdmin={!!profile?.is_admin} />
    </FkShell>
  );
}
