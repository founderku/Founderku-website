import type { Metadata } from "next";
import Bagiin from "@/components/tools/bagiin/Bagiin";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { ToolGuide } from "@/components/tools/ToolGuide";

export const metadata: Metadata = {
  title: "Bagiin - Pembagian Saham Pendiri & Vesting · Founderku",
  description: "Bagi saham antar pendiri berdasarkan kontribusi, lengkap dengan jadwal vesting dan cliff. Gratis.",
};

export default function BagiinPage() {
  return (
    <>
      <ToolFrame toolId="bagiin" toolName="Bagiin" themed>
        <Bagiin />
      </ToolFrame>
      <ToolGuide toolId="bagiin" toolName="Bagiin" />
    </>
  );
}
