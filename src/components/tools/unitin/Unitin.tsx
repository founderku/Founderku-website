"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { hitungUnit, UMUR_MAKS, type InputUnit, type Mode } from "@/lib/tools/unitin/calc";
import { nf, rp } from "@/lib/tools/format";
import {
  Card,
  Grid,
  Note,
  NumInput,
  Split,
  Stat,
  StdActions,
  Tabs,
  ToolShell,
  Verdict,
  type Tone,
} from "@/components/tools/kit/Kit";

const AWAL: InputUnit = {
  mode: "langganan",
  harga: 0,
  frekuensi: 1,
  margin: 0,
  churn: 0,
  lamaBulan: 12,
  biayaMarketing: 0,
  biayaSales: 0,
  pelangganBaru: 0,
};

const CONTOH: InputUnit = {
  mode: "langganan",
  harga: 149_000,
  frekuensi: 1,
  margin: 75,
  churn: 6,
  lamaBulan: 12,
  biayaMarketing: 12_000_000,
  biayaSales: 3_000_000,
  pelangganBaru: 60,
};

function toneRasio(r: number | null): Tone {
  if (r === null) return "neutral";
  if (r >= 3) return "good";
  if (r >= 1) return "warn";
  return "bad";
}
function tonePayback(p: number | null): Tone {
  if (p === null) return "neutral";
  if (p <= 12) return "good";
  if (p <= 24) return "warn";
  return "bad";
}

export default function Unitin() {
  const [d, setD, reset] = useToolState<InputUnit>("unitin", "draft-v1", AWAL);
  const ubah = (p: Partial<InputUnit>) => setD((x) => ({ ...x, ...p }));
  const h = useMemo(() => hitungUnit(d), [d]);
  const tr = toneRasio(h.rasio);
  const tp = tonePayback(h.payback);
  const langganan = d.mode === "langganan";
  const adaIsi = h.arpu > 0 && h.cac !== null;

  // Saran perbaikan yang paling berpengaruh
  const saran: string[] = [];
  if (adaIsi && h.rasio !== null && h.rasio < 3 && h.cacMaksSehat !== null) {
    saran.push(`Turunkan biaya dapat 1 pelanggan (CAC) ke ${rp(h.cacMaksSehat)} atau kurang supaya LTV:CAC mencapai 3.`);
    if (langganan && d.churn > 0 && h.cac !== null && h.kontribusi > 0) {
      const churnMaks = (h.kontribusi * 100) / (3 * h.cac);
      if (churnMaks > 0 && churnMaks < d.churn)
        saran.push(`Atau tekan pelanggan yang berhenti (churn) ke sekitar ${nf(churnMaks, 1)}% per bulan.`);
    }
    if (d.margin < 60) saran.push("Naikkan margin: cek harga, biaya server, atau biaya layanan per pelanggan.");
  }
  if (adaIsi && h.payback !== null && h.payback > 12)
    saran.push("Balik modal lebih dari 12 bulan: pertimbangkan paket tahunan dibayar di depan supaya kas tidak tertahan.");

  return (
    <ToolShell
      eyebrow="Founderku Tools · Keuangan Startup"
      title="Unitin"
      desc="Cek unit ekonomi startup kamu: berapa biaya untuk dapat 1 pelanggan (CAC), berapa nilai 1 pelanggan selama berlangganan (LTV), dan berapa bulan biayanya balik."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Stat
                big
                label="LTV : CAC"
                value={adaIsi && h.rasio !== null ? `${nf(h.rasio, 1)} : 1` : "-"}
                tone={adaIsi ? tr : "neutral"}
                sub={adaIsi ? "Idealnya 3 : 1 atau lebih" : "Isi harga, biaya pemasaran, dan pelanggan baru"}
              />
              <div style={{ height: 12 }} />
              <Grid>
                <Stat label="CAC (biaya dapat 1 pelanggan)" value={h.cac !== null ? rp(h.cac) : "-"} />
                <Stat label="LTV (nilai 1 pelanggan)" value={h.ltv !== null ? rp(h.ltv) : "-"} />
                <Stat
                  label="Balik modal (payback)"
                  value={h.payback !== null ? `${nf(h.payback, 1)} bulan` : "-"}
                  tone={adaIsi ? tp : "neutral"}
                />
                <Stat
                  label="Umur pelanggan"
                  value={h.umurBulan !== null ? `${nf(h.umurBulan, 1)} bulan` : "-"}
                  sub={h.umurBulan === UMUR_MAKS ? "Dibatasi 5 tahun" : undefined}
                />
                <Stat label="Pendapatan / pelanggan / bulan" value={rp(h.arpu)} />
                <Stat label="Laba kotor / pelanggan / bulan" value={rp(h.kontribusi)} />
              </Grid>
            </Card>
            {adaIsi && (
              <Verdict
                tone={tr === "good" && tp !== "bad" ? "good" : tr === "bad" || tp === "bad" ? "bad" : "warn"}
                title={
                  tr === "good" && tp !== "bad"
                    ? "Unit ekonomi sehat"
                    : tr === "bad"
                      ? "Rugi di tiap pelanggan"
                      : "Masih bisa diperbaiki"
                }
              >
                {tr === "good" && tp !== "bad" ? (
                  <p>Tiap pelanggan menghasilkan jauh lebih banyak dari biaya mendapatkannya. Ini saat yang wajar untuk menambah biaya pemasaran.</p>
                ) : tr === "bad" ? (
                  <p>Biaya mendapatkan pelanggan lebih besar dari nilai yang dia bawa. Jangan tambah biaya pemasaran dulu sebelum ini diperbaiki.</p>
                ) : (
                  <p>Belum rugi, tapi ruangnya tipis untuk tumbuh cepat.</p>
                )}
                {saran.length > 0 && (
                  <ul>
                    {saran.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                )}
              </Verdict>
            )}
          </>
        }
      >
        <Card title="Model pendapatan">
          <Tabs<Mode>
            value={d.mode}
            onChange={(m) => ubah({ mode: m })}
            items={[
              { id: "langganan", label: "Langganan bulanan" },
              { id: "transaksi", label: "Beli berulang" },
            ]}
          />
          <Grid>
            <NumInput
              money
              label={langganan ? "Harga langganan per bulan" : "Nilai rata-rata sekali beli"}
              value={d.harga}
              onChange={(n) => ubah({ harga: n })}
            />
            {!langganan && (
              <NumInput
                label="Beli berapa kali per bulan"
                hint="Rata-rata per pelanggan, boleh desimal (0,5 = 2 bulan sekali)"
                value={d.frekuensi}
                onChange={(n) => ubah({ frekuensi: n })}
                min={0}
              />
            )}
            <NumInput
              label="Margin kotor"
              suffix="%"
              hint="Harga dikurangi biaya langsung (server, bahan, komisi)"
              value={d.margin}
              onChange={(n) => ubah({ margin: n })}
              min={0}
              max={100}
            />
            {langganan ? (
              <NumInput
                label="Churn per bulan"
                suffix="%"
                hint="Persen pelanggan yang berhenti tiap bulan"
                value={d.churn}
                onChange={(n) => ubah({ churn: n })}
                min={0}
                max={100}
              />
            ) : (
              <NumInput
                label="Pelanggan bertahan berapa bulan"
                digits={0}
                value={d.lamaBulan}
                onChange={(n) => ubah({ lamaBulan: n })}
                min={0}
                max={UMUR_MAKS}
              />
            )}
          </Grid>
        </Card>
        <Card title="Biaya akuisisi per bulan" hint="Rata-rata beberapa bulan terakhir supaya lebih akurat.">
          <Grid>
            <NumInput money label="Biaya marketing & iklan" value={d.biayaMarketing} onChange={(n) => ubah({ biayaMarketing: n })} />
            <NumInput money label="Biaya tim sales" hint="Gaji + komisi, kalau ada" value={d.biayaSales} onChange={(n) => ubah({ biayaSales: n })} />
            <NumInput
              label="Pelanggan baru per bulan"
              digits={0}
              value={d.pelangganBaru}
              onChange={(n) => ubah({ pelangganBaru: Math.round(n) })}
              min={0}
            />
          </Grid>
        </Card>
        <Card tone="soft" title="Cara baca hasilnya">
          <Note>
            LTV:CAC 3:1 berarti tiap Rp1 untuk mendapatkan pelanggan kembali jadi Rp3 laba kotor. Di bawah 1:1 artinya rugi di
            tiap pelanggan. Balik modal di bawah 12 bulan umumnya dianggap sehat untuk startup tahap awal. Angka ini perkiraan,
            makin banyak data bulan yang dipakai makin akurat.
          </Note>
        </Card>
      </Split>
    </ToolShell>
  );
}
