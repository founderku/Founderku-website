import type { Metadata } from "next";
import "./tool.css";
import PajakCalculator from "@/components/tools/pajakin/PajakCalculator";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Pajakin - Simulasi PPh Final UMKM · Founderku",
  description: "Hitung PPh Final UMKM (0,5%) sesuai PP 20/2026, termasuk batas omzet bebas pajak Rp500 juta. Gratis.",
};

export default function PajakinPage() {
  return (
    <ToolFrame toolId="pajakin" toolName="Pajakin">
      <div className="tool-pajakin">
        <PajakCalculator />
      </div>
    </ToolFrame>
  );
}
