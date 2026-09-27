import type { Metadata } from "next";
import Kompetitorin from "@/components/tools/kompetitorin/Kompetitorin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Kompetitorin - Analisis Kompetitor & Peta Posisi · Founderku",
  description: "Bandingkan produk dengan pesaing: tabel fitur, peta posisi, pembeda, dan celah. Gratis.",
};

export default function KompetitorinPage() {
  return (
    <ToolFrame toolId="kompetitorin" toolName="Kompetitorin" themed>
      <Kompetitorin />
    </ToolFrame>
  );
}
