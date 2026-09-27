import type { Metadata } from "next";
import Runwayin from "@/components/tools/runwayin/Runwayin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Runwayin - Hitung Runway & Burn Rate Startup · Founderku",
  description: "Hitung berapa bulan uang startup kamu cukup, kapan kas habis, dan simulasikan skenario rekrut atau pendanaan. Gratis.",
};

export default function RunwayinPage() {
  return (
    <ToolFrame toolId="runwayin" toolName="Runwayin" themed>
      <Runwayin />
    </ToolFrame>
  );
}
