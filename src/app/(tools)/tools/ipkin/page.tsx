import type { Metadata } from "next";
import Ipkin from "@/components/tools/ipkin/Ipkin";
import { ToolFrame } from "@/components/tools/ToolFrame";

export const metadata: Metadata = {
  title: "IPK-in - Hitung IPK, IPS & Simulasi Target IPK · Founderku",
  description: "Hitung IPS per semester dan IPK kumulatif, lihat grafiknya, dan simulasikan nilai yang dibutuhkan untuk mencapai target IPK. Gratis.",
};

export default function IpkinPage() {
  return (
    <ToolFrame toolId="ipkin" toolName="IPK-in" themed>
      <Ipkin />
    </ToolFrame>
  );
}
