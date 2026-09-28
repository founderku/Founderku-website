import type { Metadata } from "next";
import "./tool.css";
import Proposalin from "@/components/tools/proposalin/Proposalin";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { ToolGuide } from "@/components/tools/ToolGuide";

export const metadata: Metadata = {
  title: "Proposalin - Susun Proposal PKM-K, P2MW & Business Plan · Founderku",
  description: "Kerangka proposal usaha mahasiswa dengan panduan tiap bagian, RAB otomatis, dan jadwal kegiatan. Cetak jadi PDF. Gratis.",
};

export default function ProposalinPage() {
  return (
    <>
      <ToolFrame toolId="proposalin" toolName="Proposalin" themed>
        <Proposalin />
      </ToolFrame>
      <ToolGuide toolId="proposalin" toolName="Proposalin" />
    </>
  );
}
