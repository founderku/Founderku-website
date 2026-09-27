import type { Metadata } from "next";
import Valuasiin from "@/components/tools/valuasiin/Valuasiin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Valuasiin - Perkiraan Valuasi Startup Tahap Awal · Founderku",
  description: "Perkirakan valuasi pre-money dengan metode Berkus, Scorecard, dan kelipatan pendapatan. Gratis.",
};

export default function ValuasiinPage() {
  return (
    <ToolFrame toolId="valuasiin" toolName="Valuasiin" themed>
      <Valuasiin />
    </ToolFrame>
  );
}
