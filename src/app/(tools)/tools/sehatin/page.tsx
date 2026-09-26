import type { Metadata } from "next";
import "./tool.css";
import Sehatin from "@/components/tools/sehatin/Sehatin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Sehatin - Cek Kesehatan Bisnis · Founderku",
  description: "Kuis interaktif buat cek kesehatan usaha kamu di 5 aspek: keuangan, legalitas, pemasaran, operasional, dan tim. Gratis.",
};

export default function SehatinPage() {
  return (
    <ToolFrame toolId="sehatin" toolName="Sehatin">
      <div className="tool-sehatin">
        <Sehatin />
      </div>
    </ToolFrame>
  );
}
