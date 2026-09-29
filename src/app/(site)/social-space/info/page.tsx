import type { Metadata } from "next";
import { FkShell } from "@/components/shell/FkShell";
import { SsInfo } from "@/components/social/SsInfo";
import { getSsViewer } from "@/lib/socialSpace";

export const metadata: Metadata = {
  title: "Info Beasiswa, Magang & Lowongan · Social Space",
  description: "Info beasiswa, magang, volunteer, dan lowongan kerja pilihan untuk mahasiswa dan founder muda. Diperbarui dan otomatis bersih dari info kedaluwarsa.",
  alternates: { canonical: "/social-space/info" },
};

export default async function SsInfoPage() {
  const { userId, isAdmin } = await getSsViewer();
  return (
    <FkShell bare>
      <SsInfo userId={userId} isAdmin={isAdmin} />
    </FkShell>
  );
}
