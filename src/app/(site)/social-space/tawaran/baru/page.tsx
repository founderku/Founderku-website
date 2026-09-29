import type { Metadata } from "next";
import { FkShell } from "@/components/shell/FkShell";
import { SsPostEditor } from "@/components/social/SsPostEditor";
import { requireAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Pasang tawaran · Social Space", robots: { index: false } };

export default async function SsNewPostPage() {
  const { user, profile } = await requireAccount("/social-space/tawaran/baru");
  return (
    <FkShell bare>
      <SsPostEditor userId={user.id} postId={null} isAdmin={!!profile?.is_admin} />
    </FkShell>
  );
}
