import type { Metadata } from "next";
import Personain from "@/components/tools/personain/Personain";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Personain - Bikin Persona Pelanggan · Founderku",
  description: "Gambarkan pelanggan ideal dalam kartu persona siap cetak: tujuan, masalah, dan alasan membeli. Gratis.",
};

export default function PersonainPage() {
  return (
    <ToolFrame toolId="personain" toolName="Personain" themed>
      <Personain />
    </ToolFrame>
  );
}
