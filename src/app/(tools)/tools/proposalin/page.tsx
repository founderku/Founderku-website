import type { Metadata } from "next";
import "./tool.css";
import Proposalin from "@/components/tools/proposalin/Proposalin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Proposalin - Susun Proposal PKM-K, P2MW & Business Plan · Founderku",
  description: "Kerangka proposal usaha mahasiswa dengan panduan tiap bagian, RAB otomatis, dan jadwal kegiatan. Cetak jadi PDF. Gratis.",
};

export default function ProposalinPage() {
  return (
    <ToolFrame toolId="proposalin" toolName="Proposalin" themed>
      <Proposalin />
    </ToolFrame>
  );
}
