import type { Metadata } from "next";
import Wawancarain from "@/components/tools/wawancarain/Wawancarain";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { ToolGuide } from "@/components/tools/ToolGuide";

export const metadata: Metadata = {
  title: "Wawancarain - Panduan Wawancara Calon Pelanggan · Founderku",
  description: "Daftar pertanyaan wawancara calon pelanggan yang tidak menggiring, catatan tiap responden, dan rangkuman otomatis. Gratis.",
};

export default function WawancarainPage() {
  return (
    <>
      <ToolFrame toolId="wawancarain" toolName="Wawancarain" themed>
        <Wawancarain />
      </ToolFrame>
      <ToolGuide toolId="wawancarain" toolName="Wawancarain" />
    </>
  );
}
