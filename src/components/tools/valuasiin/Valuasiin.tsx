"use client";

import { useMemo, useState } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { BERKUS, ringkasValuasi, SCORECARD, type InputValuasi } from "@/lib/tools/valuasiin/calc";
import { nf, rp, rpRingkas } from "@/lib/tools/format";
import {
  Card,
  Grid,
  kitStyles as k,
  Note,
  NumInput,
  Select,
  Split,
  Stat,
  StdActions,
  Tabs,
  ToolShell,
  Verdict,
} from "@/components/tools/kit/Kit";

const AWAL: InputValuasi = {
  berkusMaks: 1_000_000_000,
  berkus: [0, 0, 0, 0, 0],
  dasarScorecard: 0,
  scorecard: [100, 100, 100, 100, 100, 100, 100],
  pendapatanTahunan: 0,
  kelipatan: 5,
};

const CONTOH: InputValuasi = {
  berkusMaks: 1_000_000_000,
  berkus: [80, 70, 90, 40, 50],
  dasarScorecard: 8_000_000_000,
  scorecard: [125, 110, 100, 90, 100, 100, 100],
  pendapatanTahunan: 288_000_000,
  kelipatan: 8,
};

const PILIHAN_SC = [
  { v: 50, label: "Jauh di bawah rata-rata (50%)" },
  { v: 75, label: "Di bawah rata-rata (75%)" },
  { v: 100, label: "Rata-rata (100%)" },
  { v: 125, label: "Di atas rata-rata (125%)" },
  { v: 150, label: "Jauh di atas rata-rata (150%)" },
];

type Metode = "berkus" | "scorecard" | "kelipatan";

export default function Valuasiin() {
  const [d, setD, reset] = useToolState<InputValuasi>("valuasiin", "draft-v1", AWAL);
  const [tab, setTab] = useState<Metode>("berkus");
  const r = useMemo(() => ringkasValuasi(d), [d]);
  const setArr = (key: "berkus" | "scorecard", i: number, n: number) =>
    setD((x) => {
      const arr = [...x[key]];
      arr[i] = n;
      return { ...x, [key]: arr };
    });

  return (
    <ToolShell
      eyebrow="Founderku Tools · Pendanaan"
      title="Valuasiin"
      desc="Perkirakan valuasi pre-money startup tahap awal dengan tiga metode yang sering dipakai investor: Berkus, Scorecard, dan kelipatan pendapatan. Hasilnya kisaran untuk bahan negosiasi."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Stat
                big
                label="Kisaran valuasi pre-money"
                value={r.min !== null && r.maks !== null ? (r.min === r.maks ? rpRingkas(r.min) : `${rpRingkas(r.min)} - ${rpRingkas(r.maks)}`) : "-"}
                sub={r.rata !== null ? `Rata-rata ${rpRingkas(r.rata)}` : "Isi minimal satu metode"}
              />
              <div style={{ height: 12 }} />
              <div className={k.rows}>
                {r.hasil.map((h) => (
                  <div key={h.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 14.5, paddingBottom: 8, borderBottom: "1px dashed var(--line)" }}>
                    <span>{h.nama}</span>
                    <b style={{ fontVariantNumeric: "tabular-nums" }}>{h.nilai !== null ? rpRingkas(h.nilai) : "-"}</b>
                  </div>
                ))}
              </div>
            </Card>
            {r.min !== null && r.maks !== null && r.min > 0 && (
              <Verdict tone={r.maks / r.min > 3 ? "warn" : "good"} title={r.maks / r.min > 3 ? "Hasil antar metode jauh berbeda" : "Hasil antar metode cukup konsisten"}>
                <p>
                  {r.maks / r.min > 3
                    ? "Cek lagi asumsi di tiap metode. Saat negosiasi, pakai angka tengah dan siapkan alasan dari metode yang paling kuat datanya."
                    : "Pakai kisaran ini sebagai titik awal negosiasi. Valuasi akhir tetap ditentukan kesepakatan dengan investor."}
                </p>
              </Verdict>
            )}
            <Note>Valuasi tahap awal lebih banyak seni daripada rumus. Angka ini perkiraan, bukan penilaian resmi.</Note>
          </>
        }
      >
        <Tabs<Metode>
          value={tab}
          onChange={setTab}
          items={[
            { id: "berkus", label: "Berkus" },
            { id: "scorecard", label: "Scorecard" },
            { id: "kelipatan", label: "Kelipatan" },
          ]}
        />
        {tab === "berkus" && (
          <Card title="Metode Berkus" hint="Cocok untuk startup yang belum punya pendapatan. Tiap faktor bernilai sampai batas maksimal; nilai sesuai seberapa kuat startup kamu di faktor itu.">
            <NumInput money label="Nilai maksimal per faktor" hint="Misal Rp 1 M, jadi valuasi maksimal Rp 5 M" value={d.berkusMaks} onChange={(n) => setD((x) => ({ ...x, berkusMaks: n }))} />
            <div style={{ height: 14 }} />
            <div className={k.rows}>
              {BERKUS.map((nama, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 120px", gap: 10, alignItems: "end" }}>
                  <div style={{ fontSize: 14.5, paddingBottom: 12 }}>
                    {nama}
                    <div style={{ fontSize: 12.5, color: "var(--faint)" }}>{rp((d.berkusMaks * (d.berkus[i] || 0)) / 100)}</div>
                  </div>
                  <NumInput label={`Kekuatan ${nama}`} hideLabel digits={0} suffix="%" value={d.berkus[i] || 0} min={0} max={100} onChange={(n) => setArr("berkus", i, n)} />
                </div>
              ))}
            </div>
          </Card>
        )}
        {tab === "scorecard" && (
          <Card title="Metode Scorecard" hint="Bandingkan startup kamu dengan rata-rata startup sejenis yang baru didanai di wilayah yang sama.">
            <NumInput money label="Rata-rata valuasi pre-money startup sejenis" value={d.dasarScorecard} onChange={(n) => setD((x) => ({ ...x, dasarScorecard: n }))} />
            <div style={{ height: 14 }} />
            <div className={k.rows}>
              {SCORECARD.map((f, i) => (
                <Select
                  key={i}
                  label={`${f.nama} (bobot ${f.bobot}%)`}
                  value={d.scorecard[i] || 100}
                  onChange={(v) => setArr("scorecard", i, v)}
                  options={PILIHAN_SC}
                />
              ))}
            </div>
          </Card>
        )}
        {tab === "kelipatan" && (
          <Card title="Kelipatan pendapatan" hint="Untuk startup yang sudah punya pendapatan rutin. Kelipatan tergantung sektor dan kecepatan tumbuh.">
            <Grid>
              <NumInput money label="Pendapatan tahunan (ARR)" hint="Pendapatan bulanan x 12" value={d.pendapatanTahunan} onChange={(n) => setD((x) => ({ ...x, pendapatanTahunan: n }))} />
              <NumInput label="Kelipatan" suffix="x" value={d.kelipatan} min={0} max={100} onChange={(n) => setD((x) => ({ ...x, kelipatan: n }))} />
            </Grid>
            <div style={{ height: 10 }} />
            <Note>
              Sebagai gambaran, startup software yang tumbuh cepat sering dinilai beberapa kali lipat pendapatan tahunannya. Cari
              pembanding di sektor kamu sendiri. Saat ini: {d.pendapatanTahunan > 0 ? `${rp(d.pendapatanTahunan)} x ${nf(d.kelipatan, 1)}` : "belum diisi"}.
            </Note>
          </Card>
        )}
      </Split>
    </ToolShell>
  );
}
