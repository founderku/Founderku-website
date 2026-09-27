import type { Metadata } from "next";
import Proyeksiin from "@/components/tools/proyeksiin/Proyeksiin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Proyeksiin - Proyeksi Keuangan Startup 3 Tahun · Founderku",
  description: "Proyeksi pelanggan, pendapatan, biaya, dan titik untung startup selama 3 tahun. Gratis.",
};

export default function ProyeksiinPage() {
  return (
    <ToolFrame toolId="proyeksiin" toolName="Proyeksiin" themed>
      <Proyeksiin />
    </ToolFrame>
  );
}
