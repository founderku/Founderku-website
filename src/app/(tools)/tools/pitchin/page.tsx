import type { Metadata } from "next";
import "./tool.css";
import Pitchin from "@/components/tools/pitchin/Pitchin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "Pitchin - Bikin Pitch Deck Startup 10 Slide · Founderku",
  description: "Susun pitch deck 10 slide dengan panduan tiap slide, lalu cetak jadi PDF. Gratis.",
};

export default function PitchinPage() {
  return (
    <ToolFrame toolId="pitchin" toolName="Pitchin" themed>
      <Pitchin />
    </ToolFrame>
  );
}
