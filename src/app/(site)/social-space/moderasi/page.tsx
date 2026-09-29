import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FkShell } from "@/components/shell/FkShell";
import { SsModeration } from "@/components/social/SsModeration";
import { requireAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Moderasi · Social Space", robots: { index: false } };

export default async function SsModerasiPage() {
  const { user, profile } = await requireAccount("/social-space/moderasi");
  // Bukan admin: kembali ke Jelajah tanpa menjelaskan apa pun
  if (!profile?.is_admin) redirect("/social-space");
  return (
    <FkShell bare>
      <SsModeration userId={user.id} />
    </FkShell>
  );
}
