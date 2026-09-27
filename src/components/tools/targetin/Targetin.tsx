"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { progresKR, progresObjective, statusOKR, type KR, type Objective } from "@/lib/tools/targetin/calc";
import { nf } from "@/lib/tools/format";
import {
  Badge,
  Button,
  Card,
  Grid,
  kitStyles as k,
  Meter,
  Note,
  NumInput,
  RemoveBtn,
  Split,
  Stat,
  StdActions,
  TextInput,
  ToolShell,
  type Tone,
} from "@/components/tools/kit/Kit";

interface DataOKR {
  periode: string;
  objective: Objective[];
}

const krBaru = (): KR => ({ nama: "", awal: 0, target: 0, sekarang: 0 });
const objBaru = (): Objective => ({ nama: "", pemilik: "", kr: [krBaru(), krBaru()] });

const AWAL: DataOKR = { periode: "", objective: [objBaru()] };

const CONTOH: DataOKR = {
  periode: "Kuartal 4 2026",
  objective: [
    {
      nama: "Jadi aplikasi kasir andalan warung kopi di Jabodetabek",
      pemilik: "Rina",
      kr: [
        { nama: "Warung aktif mingguan", awal: 420, target: 800, sekarang: 610 },
        { nama: "Churn bulanan (%)", awal: 6, target: 3, sekarang: 4.5 },
        { nama: "NPS pelanggan", awal: 30, target: 50, sekarang: 41 },
      ],
    },
    {
      nama: "Siap galang dana pre-seed",
      pemilik: "Dimas",
      kr: [
        { nama: "Pendapatan bulanan (juta)", awal: 24, target: 45, sekarang: 30 },
        { nama: "Investor yang diajak meeting", awal: 0, target: 15, sekarang: 4 },
      ],
    },
  ],
};

const LABEL: Record<"baik" | "hati" | "tertinggal", { tone: Tone; teks: string }> = {
  baik: { tone: "good", teks: "Sesuai jalur" },
  hati: { tone: "warn", teks: "Perlu dorongan" },
  tertinggal: { tone: "bad", teks: "Tertinggal" },
};

export default function Targetin() {
  const [d, setD, reset] = useToolState<DataOKR>("targetin", "draft-v1", AWAL);
  const ubahO = (i: number, p: Partial<Objective>) => setD((x) => ({ ...x, objective: x.objective.map((o, j) => (j === i ? { ...o, ...p } : o)) }));
  const ubahK = (oi: number, ki: number, p: Partial<KR>) =>
    setD((x) => ({ ...x, objective: x.objective.map((o, j) => (j === oi ? { ...o, kr: o.kr.map((r, n) => (n === ki ? { ...r, ...p } : r)) } : o)) }));
  const prog = useMemo(() => d.objective.map(progresObjective), [d.objective]);
  const ada = prog.filter((x): x is number => x !== null);
  const total = ada.length ? ada.reduce((a, b) => a + b, 0) / ada.length : null;
  const st = statusOKR(total);

  return (
    <ToolShell
      eyebrow="Founderku Tools · Tim & Eksekusi"
      title="Targetin"
      desc="Susun OKR (Objective & Key Results) untuk tim: tujuan besar kuartal ini dan angka yang membuktikannya. Progres dihitung otomatis setiap kamu update angka terbaru."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Stat big label={d.periode ? `Progres ${d.periode}` : "Progres keseluruhan"} value={total !== null ? `${nf(total)}%` : "-"} tone={st ? LABEL[st].tone : "neutral"} toneText={st ? LABEL[st].teks : undefined} sub={st ? undefined : "Isi objective dan key result"} />
              <div style={{ height: 10 }} />
              <Meter value={total ?? 0} label="Progres keseluruhan" />
            </Card>
            <Card title="Per objective">
              <div className={k.rows}>
                {d.objective.map((o, i) => {
                  const s = statusOKR(prog[i]);
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.4 }}>{o.nama || `Objective ${i + 1}`}</span>
                        <span style={{ fontSize: 13.5, color: "var(--faint)", whiteSpace: "nowrap" }}>{prog[i] !== null ? `${nf(prog[i] ?? 0)}%` : "-"}</span>
                      </div>
                      <Meter value={prog[i] ?? 0} label={`Progres ${o.nama}`} />
                      {s && (
                        <div style={{ marginTop: 6 }}>
                          <Badge tone={LABEL[s].tone} text={LABEL[s].teks} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
            <Note>Di OKR, capaian 70% sudah dianggap bagus. Target sengaja dibuat menantang.</Note>
          </>
        }
      >
        <Card title="Periode">
          <TextInput label="Nama periode" placeholder="Misal: Kuartal 4 2026" value={d.periode} maxLength={40} onChange={(v) => setD((x) => ({ ...x, periode: v }))} />
        </Card>
        {d.objective.map((o, oi) => (
          <Card
            key={oi}
            title={`Objective ${oi + 1}`}
            right={d.objective.length > 1 ? <RemoveBtn label={`Hapus objective ${oi + 1}`} onClick={() => setD((x) => ({ ...x, objective: x.objective.filter((_, j) => j !== oi) }))} /> : undefined}
          >
            <TextInput label="Tujuan (kualitatif, memotivasi)" value={o.nama} maxLength={120} onChange={(v) => ubahO(oi, { nama: v })} />
            <div style={{ height: 12 }} />
            <TextInput label="Penanggung jawab" value={o.pemilik} maxLength={40} onChange={(v) => ubahO(oi, { pemilik: v })} />
            <div style={{ height: 14 }} />
            <div className={k.rows}>
              {o.kr.map((r, ki) => {
                const p = progresKR(r);
                return (
                  <div key={ki} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 16, background: "var(--panel)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
                      <div style={{ flex: 1 }}>
                        <TextInput label={`Key result ${ki + 1}`} placeholder="Angka yang bisa diukur" value={r.nama} maxLength={100} onChange={(v) => ubahK(oi, ki, { nama: v })} />
                      </div>
                      <RemoveBtn label={`Hapus key result ${ki + 1}`} onClick={() => ubahO(oi, { kr: o.kr.filter((_, n) => n !== ki) })} />
                    </div>
                    <Grid cols={3} keep>
                      <NumInput label="Sekarang" value={r.sekarang} onChange={(n) => ubahK(oi, ki, { sekarang: n })} />
                      <NumInput label="Awal" value={r.awal} onChange={(n) => ubahK(oi, ki, { awal: n })} />
                      <NumInput label="Target" value={r.target} onChange={(n) => ubahK(oi, ki, { target: n })} />
                    </Grid>
                    {p !== null && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <Meter value={p} label={`Progres ${r.nama}`} />
                        </div>
                        <span style={{ fontSize: 13, color: "var(--faint)", minWidth: 40, textAlign: "right" }}>{nf(p)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {o.kr.length < 5 && (
                <div className={`${k.addBtn} no-print`}>
                  <Button small onClick={() => ubahO(oi, { kr: [...o.kr, krBaru()] })}>
                    + Key result
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {d.objective.length < 5 && (
          <div className="no-print">
            <Button small onClick={() => setD((x) => ({ ...x, objective: [...x.objective, objBaru()] }))}>
              + Tambah objective
            </Button>
          </div>
        )}
        <Note>Cukup 2 sampai 3 objective per kuartal, masing-masing 2 sampai 4 key result. Target turun (misal churn) juga bisa: isi awal lebih besar dari target.</Note>
      </Split>
    </ToolShell>
  );
}
