"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { hitungPasar, type InputPasar } from "@/lib/tools/pasarin/calc";
import { nf, pct, rpRingkas } from "@/lib/tools/format";
import {
  Card,
  Grid,
  kitStyles as k,
  Note,
  NumInput,
  Split,
  Stat,
  StdActions,
  TextArea,
  TextInput,
  ToolShell,
  Verdict,
} from "@/components/tools/kit/Kit";

const AWAL: InputPasar = {
  namaPasar: "",
  pelanggan: 0,
  nilaiTahun: 0,
  pctSam: 0,
  pctSom: 0,
  tahun: 3,
  alasanSam: "",
  alasanSom: "",
};

const CONTOH: InputPasar = {
  namaPasar: "Aplikasi kasir untuk warung kopi dan kedai makanan",
  pelanggan: 3_000_000,
  nilaiTahun: 588_000,
  pctSam: 15,
  pctSom: 5,
  tahun: 3,
  alasanSam: "Warung di kota besar yang pemiliknya sudah pakai smartphone dan QRIS (sekitar 15%).",
  alasanSom: "Target 5% dari pasar terjangkau lewat komunitas pemilik kedai dan kerja sama pemasok.",
};

// Lingkaran bertumpuk: luas lingkaran sebanding dengan nilai pasar
function Lingkaran({ tam, sam, som }: { tam: number; sam: number; som: number }) {
  const R = 130;
  const r = (v: number) => (tam > 0 ? Math.max(10, R * Math.sqrt(v / tam)) : 0);
  const rs = r(sam);
  const ro = r(som);
  const cy = 150;
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label="Diagram ukuran pasar TAM, SAM, SOM" style={{ width: "100%", maxWidth: 320, display: "block", margin: "0 auto" }}>
      <circle cx="150" cy={cy} r={R} fill="rgba(138,133,184,.22)" stroke="rgba(138,133,184,.7)" strokeWidth="1.5" />
      <circle cx="150" cy={cy + R - rs} r={rs} fill="rgba(242,169,62,.3)" stroke="rgba(242,169,62,.9)" strokeWidth="1.5" />
      <circle cx="150" cy={cy + R - ro} r={ro} fill="rgba(232,95,61,.55)" stroke="#E85F3D" strokeWidth="1.5" />
      <text x="150" y={cy - R + 26} textAnchor="middle" fontSize="13" fill="var(--text)" fontWeight="600">TAM</text>
      {rs > 34 && (
        <text x="150" y={cy + R - 2 * rs + 22} textAnchor="middle" fontSize="12" fill="var(--text)" fontWeight="600">SAM</text>
      )}
    </svg>
  );
}

export default function Pasarin() {
  const [d, setD, reset] = useToolState<InputPasar>("pasarin", "draft-v1", AWAL);
  const ubah = (p: Partial<InputPasar>) => setD((x) => ({ ...x, ...p }));
  const h = useMemo(() => hitungPasar(d), [d]);
  const adaIsi = h.tam > 0;

  return (
    <ToolShell
      eyebrow="Founderku Tools · Validasi & Riset"
      title="Pasarin"
      desc="Hitung ukuran pasar dari bawah: total pasar (TAM), pasar yang bisa kamu jangkau (SAM), dan target realistis (SOM). Angkanya siap ditempel di pitch deck."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              {adaIsi && <Lingkaran tam={h.tam} sam={h.sam} som={h.som} />}
              <div className={k.rows} style={{ marginTop: adaIsi ? 12 : 0 }}>
                <Stat label="TAM (total pasar per tahun)" value={adaIsi ? rpRingkas(h.tam) : "-"} sub={`${nf(d.pelanggan)} calon pelanggan`} />
                <Stat label="SAM (bisa dijangkau)" value={adaIsi ? rpRingkas(h.sam) : "-"} sub={`${nf(h.pelangganSam)} pelanggan`} />
                <Stat
                  big
                  label={`SOM (target ${d.tahun || 1} tahun)`}
                  value={adaIsi ? rpRingkas(h.som) : "-"}
                  sub={`${nf(h.pelangganSom)} pelanggan · sekitar ${nf(h.somPerTahunPelanggan)} per tahun`}
                />
              </div>
            </Card>
            {adaIsi && (
              <Verdict tone={h.terlaluOptimis ? "warn" : "good"} title={h.terlaluOptimis ? "Target SOM terlalu optimis" : "Target SOM masuk akal"}>
                <p>
                  {h.terlaluOptimis
                    ? `Merebut ${pct(d.pctSom)} pasar terjangkau dalam ${d.tahun} tahun itu berat untuk startup baru. Investor biasanya lebih percaya angka yang konservatif dengan alasan jelas.`
                    : "Angkanya konservatif. Pastikan alasan di tiap langkah jelas, karena investor akan menanyakan dari mana angka itu berasal."}
                </p>
              </Verdict>
            )}
          </>
        }
      >
        <Card title="Pasar kamu">
          <TextInput label="Produk dan pasarnya" placeholder="Misal: aplikasi kasir untuk warung kopi" value={d.namaPasar} maxLength={120} onChange={(v) => ubah({ namaPasar: v })} />
        </Card>
        <Card title="1. Total pasar (TAM)" hint="Semua calon pelanggan yang mungkin butuh produkmu, dikali nilai per pelanggan per tahun.">
          <Grid>
            <NumInput label="Jumlah calon pelanggan" digits={0} value={d.pelanggan} onChange={(n) => ubah({ pelanggan: n })} min={0} />
            <NumInput money label="Nilai per pelanggan per tahun" hint="Misal langganan Rp 49.000 x 12 bulan" value={d.nilaiTahun} onChange={(n) => ubah({ nilaiTahun: n })} />
          </Grid>
        </Card>
        <Card title="2. Pasar terjangkau (SAM)" hint="Berapa persen dari total itu yang benar-benar bisa kamu layani (wilayah, segmen, saluran).">
          <NumInput label="Persen yang bisa dijangkau" suffix="%" value={d.pctSam} onChange={(n) => ubah({ pctSam: n })} min={0} max={100} />
          <div style={{ height: 12 }} />
          <TextArea label="Alasannya" rows={2} maxLength={400} value={d.alasanSam} onChange={(v) => ubah({ alasanSam: v })} />
        </Card>
        <Card title="3. Target realistis (SOM)" hint="Bagian dari pasar terjangkau yang masuk akal direbut dalam beberapa tahun.">
          <Grid>
            <NumInput label="Persen dari SAM" suffix="%" value={d.pctSom} onChange={(n) => ubah({ pctSom: n })} min={0} max={100} />
            <NumInput label="Dalam berapa tahun" digits={0} value={d.tahun} onChange={(n) => ubah({ tahun: Math.round(n) })} min={1} max={10} />
          </Grid>
          <div style={{ height: 12 }} />
          <TextArea label="Alasannya" rows={2} maxLength={400} value={d.alasanSom} onChange={(v) => ubah({ alasanSom: v })} />
        </Card>
        <Note>
          Cara bottom-up (dari jumlah pelanggan) lebih dipercaya investor dibanding mengutip angka besar dari laporan riset.
          Cantumkan sumber jumlah pelanggan kalau ada.
        </Note>
      </Split>
    </ToolShell>
  );
}
