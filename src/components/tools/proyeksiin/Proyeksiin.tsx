"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { proyeksi, type InputProyeksi } from "@/lib/tools/proyeksiin/calc";
import { nf, rp, rpRingkas } from "@/lib/tools/format";
import {
  Card,
  Grid,
  kitStyles as k,
  Note,
  NumInput,
  Split,
  Stat,
  StdActions,
  ToolShell,
  Verdict,
} from "@/components/tools/kit/Kit";
import { LineChart } from "@/components/tools/kit/Charts";

const AWAL: InputProyeksi = {
  pelangganAwal: 0,
  baruAwal: 0,
  tumbuhBaru: 0,
  churn: 0,
  harga: 0,
  naikHarga: 0,
  margin: 0,
  cac: 0,
  biayaTetap: 0,
  naikBiaya: 0,
};

const CONTOH: InputProyeksi = {
  pelangganAwal: 120,
  baruAwal: 40,
  tumbuhBaru: 6,
  churn: 4,
  harga: 99_000,
  naikHarga: 10,
  margin: 80,
  cac: 250_000,
  biayaTetap: 60_000_000,
  naikBiaya: 15,
};

export default function Proyeksiin() {
  const [d, setD, reset] = useToolState<InputProyeksi>("proyeksiin", "draft-v1", AWAL);
  const ubah = (p: Partial<InputProyeksi>) => setD((x) => ({ ...x, ...p }));
  const h = useMemo(() => proyeksi(d), [d]);
  const adaIsi = d.harga > 0 && (d.pelangganAwal > 0 || d.baruAwal > 0);
  const labelBulan = (i: number) => `B${i + 1}`;

  return (
    <ToolShell
      eyebrow="Founderku Tools · Keuangan Startup"
      title="Proyeksiin"
      desc="Proyeksi keuangan 3 tahun untuk bisnis langganan: pelanggan, pendapatan, biaya, dan kapan mulai untung. Hasilnya siap ditempel di pitch deck."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Grid>
                <Stat
                  label="Mulai untung"
                  value={adaIsi ? (h.bulanUntung ? `Bulan ke-${h.bulanUntung}` : "Belum dalam 3 tahun") : "-"}
                  tone={!adaIsi ? "neutral" : h.bulanUntung && h.bulanUntung <= 24 ? "good" : h.bulanUntung ? "warn" : "bad"}
                />
                <Stat label="Dana yang dibutuhkan" value={adaIsi ? rpRingkas(h.kebutuhanDana) : "-"} sub="Supaya kas tidak minus" />
                <Stat label="Pendapatan tahun 3" value={adaIsi ? rpRingkas(h.tahunan[2].pendapatan) : "-"} />
                <Stat label="Pelanggan akhir tahun 3" value={adaIsi ? nf(h.tahunan[2].pelangganAkhir) : "-"} />
              </Grid>
            </Card>
            {adaIsi && (
              <Card title="Pendapatan vs biaya per bulan" hint="Titik untung ada saat garis pendapatan melewati garis biaya.">
                <LineChart
                  ariaLabel="Grafik pendapatan dan total biaya per bulan"
                  series={[
                    { name: "Pendapatan", slot: 1, values: h.bulan.map((b) => b.pendapatan) },
                    { name: "Total biaya", slot: 2, values: h.bulan.map((b) => b.pendapatan - b.laba) },
                  ]}
                  xLabel={labelBulan}
                  yFormat={rpRingkas}
                />
              </Card>
            )}
            {adaIsi && (
              <Verdict
                tone={h.bulanUntung && h.bulanUntung <= 24 ? "good" : "warn"}
                title={h.bulanUntung ? `Untung mulai bulan ke-${h.bulanUntung}` : "Belum untung dalam 3 tahun"}
              >
                <p>
                  {h.bulanUntung
                    ? `Siapkan dana minimal ${rp(h.kebutuhanDana)} (lebih baik tambah 20 sampai 30% untuk cadangan) sampai titik untung tercapai.`
                    : "Dengan angka ini biaya masih lebih besar dari laba kotor. Coba cek harga, churn, atau biaya akuisisi pelanggan."}
                </p>
              </Verdict>
            )}
          </>
        }
      >
        <Card title="Pelanggan">
          <Grid>
            <NumInput label="Pelanggan sekarang" digits={0} value={d.pelangganAwal} onChange={(n) => ubah({ pelangganAwal: n })} min={0} />
            <NumInput label="Pelanggan baru per bulan" digits={0} value={d.baruAwal} onChange={(n) => ubah({ baruAwal: n })} min={0} />
            <NumInput label="Pelanggan baru tumbuh per bulan" suffix="%" value={d.tumbuhBaru} onChange={(n) => ubah({ tumbuhBaru: n })} min={-50} max={100} />
            <NumInput label="Churn per bulan" suffix="%" hint="Persen pelanggan yang berhenti" value={d.churn} onChange={(n) => ubah({ churn: n })} min={0} max={100} />
          </Grid>
        </Card>
        <Card title="Harga & margin">
          <Grid>
            <NumInput money label="Harga per pelanggan per bulan" value={d.harga} onChange={(n) => ubah({ harga: n })} />
            <NumInput label="Harga naik per tahun" suffix="%" value={d.naikHarga} onChange={(n) => ubah({ naikHarga: n })} min={0} max={100} />
            <NumInput label="Margin kotor" suffix="%" value={d.margin} onChange={(n) => ubah({ margin: n })} min={0} max={100} />
          </Grid>
        </Card>
        <Card title="Biaya">
          <Grid>
            <NumInput money label="Biaya dapat 1 pelanggan (CAC)" hint="Cek dengan Unitin" value={d.cac} onChange={(n) => ubah({ cac: n })} />
            <NumInput money label="Biaya tetap per bulan" hint="Gaji, sewa, software" value={d.biayaTetap} onChange={(n) => ubah({ biayaTetap: n })} />
            <NumInput label="Biaya tetap naik per tahun" suffix="%" value={d.naikBiaya} onChange={(n) => ubah({ naikBiaya: n })} min={0} max={200} />
          </Grid>
        </Card>
        {adaIsi && (
          <Card title="Ringkasan per tahun">
            <div className={k.tableWrap}>
              <table className={k.table}>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Tahun 1</th>
                    <th>Tahun 2</th>
                    <th>Tahun 3</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Pendapatan", "pendapatan"],
                      ["Laba kotor", "labaKotor"],
                      ["Biaya marketing", "marketing"],
                      ["Biaya tetap", "biayaTetap"],
                      ["Laba / rugi", "laba"],
                    ] as const
                  ).map(([l, key]) => (
                    <tr key={key}>
                      <td>{key === "laba" ? <b>{l}</b> : l}</td>
                      {h.tahunan.map((t) => (
                        <td key={t.tahun}>{key === "laba" ? <b>{rpRingkas(t[key])}</b> : rpRingkas(t[key])}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td>Pelanggan akhir tahun</td>
                    {h.tahunan.map((t) => (
                      <td key={t.tahun}>{nf(t.pelangganAkhir)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}
        <Note>
          Proyeksi ini model sederhana untuk bisnis langganan, belum menghitung pajak, penyusutan, dan waktu pembayaran.
          Pakai untuk gambaran dan diskusi dengan investor, bukan laporan keuangan resmi.
        </Note>
      </Split>
    </ToolShell>
  );
}
