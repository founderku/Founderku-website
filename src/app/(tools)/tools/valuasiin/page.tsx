import type { Metadata } from "next";
import Valuasiin from "@/components/tools/valuasiin/Valuasiin";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { ToolGuide } from "@/components/tools/ToolGuide";

export const metadata: Metadata = {
  title: "Valuasiin - Perkiraan Valuasi Startup Tahap Awal · Founderku",
  description: "Perkirakan valuasi pre-money dengan metode Berkus, Scorecard, dan kelipatan pendapatan. Gratis.",
};

export default function ValuasiinPage() {
  return (
    <>
      <ToolFrame toolId="valuasiin" toolName="Valuasiin" themed>
        <Valuasiin />
      </ToolFrame>
      <ToolGuide toolId="valuasiin" toolName="Valuasiin" />
    </>
  );
}
