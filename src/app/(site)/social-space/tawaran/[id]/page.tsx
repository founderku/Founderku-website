import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FkShell } from "@/components/shell/FkShell";
import { SsPostEditor } from "@/components/social/SsPostEditor";
import { requireAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Ubah tawaran · Social Space", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SsEditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { user, profile } = await requireAccount(`/social-space/tawaran/${id}`);
  return (
    <FkShell bare>
      <SsPostEditor userId={user.id} postId={id} isAdmin={!!profile?.is_admin} />
    </FkShell>
  );
}
