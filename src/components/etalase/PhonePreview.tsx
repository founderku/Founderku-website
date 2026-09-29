import Link from "next/link";
import { styleOf } from "@/lib/storeStyles";
import type { StoreStyleId } from "@/lib/types";
import { EtalasePage, type EtalaseData } from "./EtalasePage";

// Preview halaman produk di dalam bingkai HP. Isinya komponen yang sama
// persis dengan halaman yang tayang di /l/..., jadi tidak ada beda
// antara yang dilihat penjual dan pembeli.
export function PhonePreview({
  data,
  style,
  showStyleLink = true,
  height = 640,
}: {
  data: EtalaseData;
  style: StoreStyleId;
  showStyleLink?: boolean;
  height?: number;
}) {
  const theme = styleOf(style);
  return (
    <div>
      <div
        className="mx-auto w-full max-w-[380px] rounded-[40px] bg-[#14131f] p-2.5 shadow-[0_30px_60px_-30px_rgba(20,19,31,0.45)]"
      >
        <div
          className="fk-keep-light relative overflow-y-auto overflow-x-hidden rounded-[32px] bg-white [scrollbar-width:none]"
          style={{ height }}
        >
          <EtalasePage data={data} style={style} preview />
        </div>
      </div>
      {showStyleLink && (
        <p className="text-center text-xs text-text-soft mt-3">
          Style toko: <b className="font-manrope">{theme.label}</b>{" "}
          <Link href="/pajangin/dashboard/style" className="underline font-bold">
            Ganti style
          </Link>
        </p>
      )}
    </div>
  );
}
