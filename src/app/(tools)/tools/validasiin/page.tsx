import type { Metadata } from "next";
import Validasiin from "@/components/tools/validasiin/Validasiin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Validasiin - Lean Canvas & Cek Kesiapan Ide Startup · Founderku",
  description: "Rangkum ide startup dalam Lean Canvas dan cek seberapa siap ide kamu diuji ke pasar. Gratis, bisa dicetak jadi PDF.",
};

export default function ValidasiinPage() {
  return (
    <ToolFrame toolId="validasiin" toolName="Validasiin" themed>
      <Validasiin />
    </ToolFrame>
  );
}
