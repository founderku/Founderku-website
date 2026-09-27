"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { bagiSaham, bulanBerjalan, FAKTOR_AWAL, persenCair, type Faktor, type Pendiri } from "@/lib/tools/bagiin/calc";
import { nf, pct, tanggalLokal } from "@/lib/tools/format";
import {
  Button,
  Card,
  DateInput,
  Grid,
  kitStyles as k,
  Meter,
  Note,
  NumInput,
  RemoveBtn,
  Split,
  StdActions,
  TextInput,
  ToolShell,
  Verdict,
} from "@/components/tools/kit/Kit";

interface DataBagi {
  faktor: Faktor[];
  pendiri: Pendiri[];
  vestingBulan: number;
  cliffBulan: number;
  mulai: string;
}

const AWAL: DataBagi = {
  faktor: FAKTOR_AWAL,
  pendiri: [
    { nama: "Pendiri 1", nilai: [] },
    { nama: "Pendiri 2", nilai: [] },
  ],
  vestingBulan: 48,
  cliffBulan: 12,
  mulai: "",
};

const contoh = (): DataBagi => {
  const t = new Date();
  t.setMonth(t.getMonth() - 14);
  return {
    faktor: FAKTOR_AWAL,
    pendiri: [
      { nama: "Rina (CEO)", nilai: [9, 10, 6, 6, 8, 9] },
      { nama: "Dimas (CTO)", nilai: [4, 10, 10, 3, 3, 8] },
      { nama: "Sari (COO)", nilai: [2, 5, 6, 1, 6, 4] },
    ],
    vestingBulan: 48,
    cliffBulan: 12,
    mulai: tanggalLokal(t),
  };
};

export default function Bagiin() {
  const [d, setD, reset] = useToolState<DataBagi>("bagiin", "draft-v1", AWAL);
  const porsi = useMemo(() => bagiSaham(d.faktor, d.pendiri), [d.faktor, d.pendiri]);
  const berjalan = bulanBerjalan(d.mulai, new Date());
  const cairSekarang = berjalan !== null ? persenCair(berjalan, d.vestingBulan, d.cliffBulan) : null;
  const totalBobot = d.faktor.reduce((a, f) => a + (f.bobot || 0), 0);
  const ubahNilai = (pi: number, fi: number, n: number) =>
    setD((x) => ({
      ...x,
      pendiri: x.pendiri.map((p, j) => {
        if (j !== pi) return p;
        const nilai = [...p.nilai];
        nilai[fi] = n;
        return { ...p, nilai };
      }),
    }));
  const titik = [d.cliffBulan, Math.round(d.vestingBulan / 2), d.vestingBulan].filter((v, i, a) => v > 0 && a.indexOf(v) === i);
  const selisih = porsi.length > 1 ? Math.max(...porsi) - Math.min(...porsi) : 0;

  return (
    <ToolShell
      eyebrow="Founderku Tools · Tim & Eksekusi"
      title="Bagiin"
      desc="Bagi saham antar pendiri secara adil berdasarkan kontribusi masing-masing, lalu atur jadwal vesting supaya saham cair bertahap selama pendiri tetap berkontribusi."
      actions={<StdActions onContoh={() => reset(contoh())} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card title="Usulan pembagian">
              <div className={k.rows}>
                {d.pendiri.map((p, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 15, marginBottom: 6 }}>
                      <span style={{ fontWeight: 500 }}>{p.nama || `Pendiri ${i + 1}`}</span>
                      <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{pct(porsi[i])}</span>
                    </div>
                    <Meter value={porsi[i]} label={`Porsi ${p.nama}`} />
                  </div>
                ))}
              </div>
            </Card>
            {d.pendiri.length > 1 && (
              <Verdict tone={selisih > 60 ? "warn" : "good"} title={selisih > 60 ? "Selisihnya besar" : "Pembagian cukup seimbang"}>
                <p>
                  {selisih > 60
                    ? "Satu pendiri memegang jauh lebih banyak. Wajar kalau kontribusinya memang beda jauh, tapi pastikan semua pendiri merasa adil sebelum disepakati."
                    : "Angka ini titik awal diskusi. Bicarakan terbuka, lalu tuangkan ke perjanjian pendiri yang ditandatangani semua pihak."}
                </p>
              </Verdict>
            )}
            <Card title="Jadwal vesting" hint={`Cliff ${d.cliffBulan} bulan, penuh di bulan ke-${d.vestingBulan}.`}>
              <div className={k.tableWrap}>
                <table className={k.table}>
                  <thead>
                    <tr>
                      <th>Pendiri</th>
                      {titik.map((b) => (
                        <th key={b}>Bulan {b}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.pendiri.map((p, i) => (
                      <tr key={i}>
                        <td>{p.nama || `Pendiri ${i + 1}`}</td>
                        {titik.map((b) => (
                          <td key={b}>{pct((porsi[i] * persenCair(b, d.vestingBulan, d.cliffBulan)) / 100)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {cairSekarang !== null && (
                <>
                  <div style={{ height: 12 }} />
                  <Note>
                    Sudah berjalan {nf(berjalan ?? 0)} bulan: {pct(cairSekarang, 0)} dari jatah tiap pendiri sudah cair.
                  </Note>
                </>
              )}
            </Card>
          </>
        }
      >
        <Card title="Pendiri">
          <div className={k.rows}>
            {d.pendiri.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "end" }}>
                <div style={{ flex: 1 }}>
                  <TextInput
                    label={i === 0 ? "Nama" : `Nama pendiri ${i + 1}`}
                    hideLabel={i > 0}
                    value={p.nama}
                    maxLength={40}
                    onChange={(v) => setD((x) => ({ ...x, pendiri: x.pendiri.map((q, j) => (j === i ? { ...q, nama: v } : q)) }))}
                  />
                </div>
                <RemoveBtn
                  label={`Hapus ${p.nama || "pendiri"}`}
                  onClick={() => d.pendiri.length > 1 && setD((x) => ({ ...x, pendiri: x.pendiri.filter((_, j) => j !== i) }))}
                />
              </div>
            ))}
            {d.pendiri.length < 6 && (
              <div className={`${k.addBtn} no-print`}>
                <Button small onClick={() => setD((x) => ({ ...x, pendiri: [...x.pendiri, { nama: "", nilai: [] }] }))}>
                  + Tambah pendiri
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card title="Nilai kontribusi" hint="Beri skor 0 sampai 10 untuk tiap pendiri. Bobot = seberapa penting faktor itu untuk startup kamu.">
          <div className={k.rows}>
            {d.faktor.map((f, fi) => (
              <div key={fi} style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 110px", gap: 10, alignItems: "end" }}>
                  <TextInput
                    label={`Faktor ${fi + 1}`}
                    value={f.nama}
                    maxLength={60}
                    onChange={(v) => setD((x) => ({ ...x, faktor: x.faktor.map((q, j) => (j === fi ? { ...q, nama: v } : q)) }))}
                  />
                  <NumInput
                    label="Bobot"
                    digits={0}
                    value={f.bobot}
                    min={0}
                    max={100}
                    onChange={(n) => setD((x) => ({ ...x, faktor: x.faktor.map((q, j) => (j === fi ? { ...q, bobot: n } : q)) }))}
                  />
                </div>
                <Grid keep>
                  {d.pendiri.map((p, pi) => (
                    <NumInput
                      key={pi}
                      label={`Skor ${p.nama || `Pendiri ${pi + 1}`}`}
                      digits={0}
                      suffix="/10"
                      value={p.nilai[fi] || 0}
                      min={0}
                      max={10}
                      onChange={(n) => ubahNilai(pi, fi, n)}
                    />
                  ))}
                </Grid>
              </div>
            ))}
          </div>
          <div style={{ height: 8 }} />
          <Note>Total bobot {nf(totalBobot)}. Tidak harus 100, yang penting perbandingannya.</Note>
        </Card>

        <Card title="Aturan vesting" hint="Umumnya 4 tahun (48 bulan) dengan cliff 1 tahun: kalau pendiri keluar sebelum 1 tahun, tidak dapat saham.">
          <Grid>
            <NumInput label="Masa vesting" digits={0} suffix="bulan" value={d.vestingBulan} min={1} max={120} onChange={(n) => setD((x) => ({ ...x, vestingBulan: n }))} />
            <NumInput label="Cliff" digits={0} suffix="bulan" value={d.cliffBulan} min={0} max={60} onChange={(n) => setD((x) => ({ ...x, cliffBulan: n }))} />
            <DateInput label="Tanggal mulai" value={d.mulai} onChange={(v) => setD((x) => ({ ...x, mulai: v }))} />
          </Grid>
        </Card>
        <Note>
          Hasil ini usulan untuk bahan diskusi, bukan dokumen hukum. Untuk perjanjian pendiri dan pembagian saham resmi di akta
          PT, konsultasikan dengan notaris atau konsultan hukum.
        </Note>
      </Split>
    </ToolShell>
  );
}
