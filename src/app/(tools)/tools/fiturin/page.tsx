import type { Metadata } from "next";
import Fiturin from "@/components/tools/fiturin/Fiturin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Fiturin - Prioritas Fitur MVP dengan Skor RICE · Founderku",
  description: "Tentukan fitur yang masuk MVP dengan skor RICE dan kapasitas tim. Gratis.",
};

export default function FiturinPage() {
  return (
    <ToolFrame toolId="fiturin" toolName="Fiturin" themed>
      <Fiturin />
    </ToolFrame>
  );
}
