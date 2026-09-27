import type { Metadata } from "next";
import Bagiin from "@/components/tools/bagiin/Bagiin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Bagiin - Pembagian Saham Pendiri & Vesting · Founderku",
  description: "Bagi saham antar pendiri berdasarkan kontribusi, lengkap dengan jadwal vesting dan cliff. Gratis.",
};

export default function BagiinPage() {
  return (
    <ToolFrame toolId="bagiin" toolName="Bagiin" themed>
      <Bagiin />
    </ToolFrame>
  );
}
