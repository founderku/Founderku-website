import type { Metadata } from "next";
import Targetin from "@/components/tools/targetin/Targetin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Targetin - OKR untuk Tim Startup · Founderku",
  description: "Susun OKR per kuartal dan pantau progres key result secara otomatis. Gratis.",
};

export default function TargetinPage() {
  return (
    <ToolFrame toolId="targetin" toolName="Targetin" themed>
      <Targetin />
    </ToolFrame>
  );
}
