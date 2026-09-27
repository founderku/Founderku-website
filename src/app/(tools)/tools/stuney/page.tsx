import type { Metadata } from "next";
import Stuney from "@/components/tools/stuney/Stuney";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Stuney - Catat Uang Saku, Dompet & Tabungan Pelajar · Founderku",
  description: "Catat uang saku dan pengeluaran, pisahkan uang per dompet (tunai, GoPay, OVO, bank), atur anggaran bulanan, dan kejar target tabungan. Gratis.",
};

export default function StuneyPage() {
  return (
    <ToolFrame toolId="stuney" toolName="Stuney" themed>
      <Stuney />
    </ToolFrame>
  );
}
