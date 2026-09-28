import type { Metadata } from "next";
import "./tool.css";
import Kanvasin from "@/components/tools/kanvasin/Kanvasin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Kanvasin - Bikin Business Model Canvas & Lean Canvas · Founderku",
  description: "Susun Business Model Canvas atau Lean Canvas dengan panduan tiap blok, lalu cetak satu halaman. Gratis untuk tugas kuliah, PKM, dan lomba bisnis.",
};

export default function KanvasinPage() {
  return (
    <ToolFrame toolId="kanvasin" toolName="Kanvasin" themed>
      <Kanvasin />
    </ToolFrame>
  );
}
