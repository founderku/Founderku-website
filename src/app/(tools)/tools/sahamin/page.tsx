import type { Metadata } from "next";
import Sahamin from "@/components/tools/sahamin/Sahamin";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { ToolGuide } from "@/components/tools/ToolGuide";

export const metadata: Metadata = {
  title: "Sahamin - Simulasi Cap Table & Dilusi Saham · Founderku",
  description: "Simulasikan kepemilikan saham pendiri, ESOP, dan investor setelah tiap putaran pendanaan. Gratis.",
};

export default function SahaminPage() {
  return (
    <>
      <ToolFrame toolId="sahamin" toolName="Sahamin" themed>
        <Sahamin />
      </ToolFrame>
      <ToolGuide toolId="sahamin" toolName="Sahamin" />
    </>
  );
}
