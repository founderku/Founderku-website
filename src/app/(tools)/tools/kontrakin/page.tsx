import type { Metadata } from "next";
import "./tool.css";
import Kontrakin from "@/components/tools/kontrakin/Kontrakin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Kontrakin - Generator Surat Perjanjian Kerjasama · Founderku",
  description: "Bikin surat perjanjian kerjasama/MOU sederhana untuk UMKM. Gratis.",
};

export default function KontrakinPage() {
  return (
    <ToolFrame toolId="kontrakin" toolName="Kontrakin">
      <div className="tool-kontrakin">
        <Kontrakin />
      </div>
    </ToolFrame>
  );
}
