import type { Metadata } from "next";
import "./tool.css";
import Jalanin from "@/components/tools/jalanin/Jalanin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Jalanin - Peta Perjalanan Bisnis · Founderku",
  description: "Checklist interaktif tahap-tahap membangun usaha, dari validasi ide sampai scale up. Gratis.",
};

export default function JalaninPage() {
  return (
    <ToolFrame toolId="jalanin" toolName="Jalanin">
      <div className="tool-jalanin">
        <Jalanin />
      </div>
    </ToolFrame>
  );
}
