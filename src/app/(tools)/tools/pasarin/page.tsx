import type { Metadata } from "next";
import Pasarin from "@/components/tools/pasarin/Pasarin";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { ToolGuide } from "@/components/tools/ToolGuide";

export const metadata: Metadata = {
  title: "Pasarin - Hitung TAM, SAM, SOM Startup · Founderku",
  description: "Hitung ukuran pasar startup dari bawah: TAM, SAM, dan SOM, lengkap dengan cek apakah targetnya realistis. Gratis.",
};

export default function PasarinPage() {
  return (
    <>
      <ToolFrame toolId="pasarin" toolName="Pasarin" themed>
        <Pasarin />
      </ToolFrame>
      <ToolGuide toolId="pasarin" toolName="Pasarin" />
    </>
  );
}
