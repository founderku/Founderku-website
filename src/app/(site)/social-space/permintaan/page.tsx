import type { Metadata } from "next";
import { FkShell } from "@/components/shell/FkShell";
import { SsInbox } from "@/components/social/SsInbox";
import { requireAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Permintaan · Social Space", robots: { index: false } };

export default async function SsInboxPage() {
  const { user, profile } = await requireAccount("/social-space/permintaan");
  return (
    <FkShell bare>
      <SsInbox userId={user.id} isAdmin={!!profile?.is_admin} />
    </FkShell>
  );
}
