import type { Metadata } from "next";
import Hargain from "@/components/tools/hargain/Hargain";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Hargain - Menentukan Harga & Paket Langganan · Founderku",
  description: "Tentukan harga langganan dari biaya, nilai buat pelanggan, dan kompetitor, lalu susun paket harga. Gratis.",
};

export default function HargainPage() {
  return (
    <ToolFrame toolId="hargain" toolName="Hargain" themed>
      <Hargain />
    </ToolFrame>
  );
}
