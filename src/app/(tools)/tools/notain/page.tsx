import type { Metadata } from "next";
import "./tool.css";
import Notain from "@/components/tools/notain/Notain";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Notain - Bikin Invoice & Kwitansi · Founderku",
  description: "Bikin invoice dan kwitansi profesional untuk UMKM. Gratis.",
};

export default function NotainPage() {
  return (
    <ToolFrame toolId="notain" toolName="Notain">
      <div className="tool-notain">
        <Notain />
      </div>
    </ToolFrame>
  );
}
