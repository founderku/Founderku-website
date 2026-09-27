import type { Metadata } from "next";
import Investorin from "@/components/tools/investorin/Investorin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Investorin - Pelacak Galang Dana Startup · Founderku",
  description: "Pantau daftar investor, tahap galang dana, target dana, dan siapa yang perlu di-follow up. Gratis.",
};

export default function InvestorinPage() {
  return (
    <ToolFrame toolId="investorin" toolName="Investorin" themed>
      <Investorin />
    </ToolFrame>
  );
}
