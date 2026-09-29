import type { Metadata } from "next";
import { FkShell } from "@/components/shell/FkShell";
import { SsProfileEditor } from "@/components/social/SsProfileEditor";
import { requireAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Profil Social Space", robots: { index: false } };

export default async function SsProfilPage() {
  const { user, profile } = await requireAccount("/social-space/profil");
  const meta = user.user_metadata ?? {};
  const fromMeta = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : "";
  const defaultName = (fromMeta || (user.email ?? "").split("@")[0] || "").slice(0, 60);
  return (
    <FkShell bare>
      <SsProfileEditor userId={user.id} defaultName={defaultName} isAdmin={!!profile?.is_admin} />
    </FkShell>
  );
}
