import type { Metadata } from "next";
import Unitin from "@/components/tools/unitin/Unitin";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { ToolGuide } from "@/components/tools/ToolGuide";

export const metadata: Metadata = {
  title: "Unitin - Hitung CAC, LTV & Payback Startup · Founderku",
  description: "Cek unit ekonomi startup: biaya dapat pelanggan (CAC), nilai pelanggan (LTV), rasio LTV:CAC, dan waktu balik modal. Gratis.",
};

export default function UnitinPage() {
  return (
    <>
      <ToolFrame toolId="unitin" toolName="Unitin" themed>
        <Unitin />
      </ToolFrame>
      <ToolGuide toolId="unitin" toolName="Unitin" />
    </>
  );
}
