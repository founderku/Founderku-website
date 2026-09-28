import type { Metadata } from "next";
import Laporin from "@/components/tools/laporin/Laporin";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { ToolGuide } from "@/components/tools/ToolGuide";

export const metadata: Metadata = {
  title: "Laporin - Laporan Bulanan untuk Investor · Founderku",
  description: "Susun laporan bulanan untuk investor: metrik, capaian, tantangan, dan bantuan yang dibutuhkan. Siap disalin ke email. Gratis.",
};

export default function LaporinPage() {
  return (
    <>
      <ToolFrame toolId="laporin" toolName="Laporin" themed>
        <Laporin />
      </ToolFrame>
      <ToolGuide toolId="laporin" toolName="Laporin" />
    </>
  );
}
