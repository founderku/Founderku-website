"use client";

import { useMemo, useState } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { ringkasInvestor, TAHAP, BATAS_HARI, type Investor, type TahapId } from "@/lib/tools/investorin/calc";
import { pct, rp, rpRingkas, tanggalLokal } from "@/lib/tools/format";
import {
  Badge,
  Button,
  Card,
  DateInput,
  Grid,
  kitStyles as k,
  Meter,
  Note,
  NumInput,
  RemoveBtn,
  Select,
  Split,
  Stat,
  StdActions,
  TextArea,
  TextInput,
  ToolShell,
} from "@/components/tools/kit/Kit";

interface DataInvestor {
  target: number;
  investor: Investor[];
}

const JENIS = ["Angel", "VC", "CVC", "Akselerator", "Lainnya"];

const hariIniStr = () => tanggalLokal();

const kosong = (): Investor => ({
  nama: "",
  firma: "",
  jenis: "VC",
  tahap: "target",
  tiket: 0,
  kontakTerakhir: hariIniStr(),
  langkah: "",
  catatan: "",
});

const AWAL: DataInvestor = { target: 0, investor: [] };

// Urutan tampil: yang paling dekat ke deal di atas, lalu deal, lalu tidak lanjut
const URUTAN: Record<TahapId, number> = { termsheet: 0, dd: 1, meeting: 2, dihubungi: 3, target: 4, deal: 5, tidak: 6 };

function mundur(hari: number) {
  const t = new Date();
  t.setDate(t.getDate() - hari);
  return tanggalLokal(t);
}

const contoh = (): DataInvestor => ({
  target: 3_000_000_000,
  investor: [
    { nama: "Budi Santoso", firma: "Angel", jenis: "Angel", tahap: "deal", tiket: 500_000_000, kontakTerakhir: mundur(5), langkah: "Kirim dokumen saham", catatan: "" },
    { nama: "Nadia", firma: "Modal Awal Ventures", jenis: "VC", tahap: "dd", tiket: 1_500_000_000, kontakTerakhir: mundur(3), langkah: "Kirim data pelanggan", catatan: "Tertarik dengan retensi" },
    { nama: "Hendra", firma: "Kopi Group", jenis: "CVC", tahap: "meeting", tiket: 1_000_000_000, kontakTerakhir: mundur(20), langkah: "Follow up hasil meeting", catatan: "" },
    { nama: "Sinta", firma: "Tumbuh Capital", jenis: "VC", tahap: "dihubungi", tiket: 2_000_000_000, kontakTerakhir: mundur(9), langkah: "Tunggu balasan", catatan: "Dikenalkan oleh mentor" },
    { nama: "Rizal", firma: "Akselerator Lokal", jenis: "Akselerator", tahap: "target", tiket: 250_000_000, kontakTerakhir: "", langkah: "Daftar batch berikutnya", catatan: "" },
    { nama: "Maya", firma: "Seed Fund X", jenis: "VC", tahap: "tidak", tiket: 0, kontakTerakhir: mundur(40), langkah: "", catatan: "Terlalu awal untuk mereka" },
  ],
});

export default function Investorin() {
  const [d, setD, reset] = useToolState<DataInvestor>("investorin", "draft-v1", AWAL);
  const [buka, setBuka] = useState<number | null>(null);
  const [filter, setFilter] = useState<TahapId | "semua">("semua");
  const ring = useMemo(() => ringkasInvestor(d.investor, d.target, new Date()), [d]);
  const ubahI = (i: number, p: Partial<Investor>) =>
    setD((x) => ({ ...x, investor: x.investor.map((v, j) => (j === i ? { ...v, ...p } : v)) }));
  const maksTahap = Math.max(1, ...TAHAP.map((t) => ring.perTahap[t.id]));
  const labelTahap = (id: TahapId) => TAHAP.find((t) => t.id === id)?.label ?? id;

  const daftar = d.investor
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => filter === "semua" || v.tahap === filter)
    .sort((a, b) => URUTAN[a.v.tahap] - URUTAN[b.v.tahap]);

  return (
    <ToolShell
      eyebrow="Founderku Tools · Pendanaan"
      title="Investorin"
      desc="Pantau galang dana: daftar investor, tahapnya, perkiraan nilai investasi, dan siapa yang perlu segera di-follow up."
      actions={<StdActions onContoh={() => reset(contoh())} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Stat
                big
                label="Dana terkumpul (deal)"
                value={rpRingkas(ring.komit)}
                sub={d.target > 0 ? `dari target ${rpRingkas(d.target)}` : "Isi target dana di bawah"}
              />
              {ring.pctTarget !== null && (
                <>
                  <div style={{ height: 10 }} />
                  <Meter value={ring.pctTarget} label="Progres target dana" />
                  <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 6 }}>{pct(ring.pctTarget, 0)} tercapai</div>
                </>
              )}
              <div style={{ height: 12 }} />
              <Stat label="Potensi di proses aktif" value={rpRingkas(ring.potensi)} sub="Meeting, due diligence, term sheet" />
            </Card>
            <Card title="Corong galang dana">
              <div className={k.rows}>
                {TAHAP.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFilter(filter === t.id ? "semua" : t.id)}
                    aria-pressed={filter === t.id}
                    style={{ display: "grid", gridTemplateColumns: "110px 1fr 28px", gap: 10, alignItems: "center", background: "none", border: 0, padding: 0, font: "inherit", color: "inherit", cursor: "pointer", textAlign: "left" }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: filter === t.id ? 600 : 400 }}>{t.label}</span>
                    <span style={{ height: 10, borderRadius: 5, background: "var(--panel-2)", overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${(ring.perTahap[t.id] / maksTahap) * 100}%`, borderRadius: 5, background: t.id === "tidak" ? "var(--line-2)" : "var(--orange)" }} />
                    </span>
                    <span style={{ fontSize: 13, color: "var(--faint)", textAlign: "right" }}>{ring.perTahap[t.id]}</span>
                  </button>
                ))}
              </div>
              <div style={{ height: 8 }} />
              <Note>Klik tahap untuk menyaring daftar.</Note>
            </Card>
            {ring.perluDihubungi.length > 0 && (
              <Card title="Perlu di-follow up" hint={`Belum dihubungi ${BATAS_HARI} hari atau lebih.`}>
                <div className={k.rows}>
                  {ring.perluDihubungi.map(({ i, hari }) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14 }}>
                      <span>
                        {d.investor[i].nama || "Investor"}
                        <span style={{ color: "var(--faint)" }}> · {labelTahap(d.investor[i].tahap)}</span>
                      </span>
                      <Badge tone="warn" text={`${hari} hari`} />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        }
      >
        <Card title="Target pendanaan">
          <NumInput money label="Target dana putaran ini" value={d.target} onChange={(n) => setD((x) => ({ ...x, target: n }))} />
        </Card>
        <Card
          title={filter === "semua" ? "Daftar investor" : `Investor: ${labelTahap(filter)}`}
          right={
            filter !== "semua" ? (
              <Button small variant="ghost" onClick={() => setFilter("semua")}>
                Tampilkan semua
              </Button>
            ) : undefined
          }
        >
          <div className={k.rows}>
            {daftar.map(({ v, i }) => {
              const terbuka = buka === i;
              return (
                <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setBuka(terbuka ? null : i)}
                      aria-expanded={terbuka}
                      style={{ background: "none", border: 0, padding: 0, textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", flex: 1, minWidth: 0 }}
                    >
                      <span style={{ display: "block", fontSize: 15, fontWeight: 500 }}>
                        {v.nama || "Investor baru"}
                        {v.firma ? <span style={{ color: "var(--faint)", fontWeight: 400 }}> · {v.firma}</span> : null}
                      </span>
                      <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 4, fontSize: 13, color: "var(--faint)" }}>
                        <Badge tone={v.tahap === "deal" ? "good" : v.tahap === "tidak" ? "neutral" : "warn"} text={labelTahap(v.tahap)} />
                        {v.tiket > 0 && rpRingkas(v.tiket)}
                        {v.langkah && <span>· {v.langkah}</span>}
                      </span>
                    </button>
                    <RemoveBtn label={`Hapus ${v.nama || "investor"}`} onClick={() => setD((x) => ({ ...x, investor: x.investor.filter((_, j) => j !== i) }))} />
                  </div>
                  {terbuka && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                      <Grid>
                        <TextInput label="Nama" value={v.nama} maxLength={60} onChange={(t) => ubahI(i, { nama: t })} />
                        <TextInput label="Firma / asal" value={v.firma} maxLength={60} onChange={(t) => ubahI(i, { firma: t })} />
                        <Select label="Jenis" value={v.jenis} onChange={(t) => ubahI(i, { jenis: t })} options={JENIS.map((j) => ({ v: j, label: j }))} />
                        <Select<TahapId> label="Tahap" value={v.tahap} onChange={(t) => ubahI(i, { tahap: t })} options={TAHAP.map((t) => ({ v: t.id, label: t.label }))} />
                        <NumInput money label="Perkiraan investasi" value={v.tiket} onChange={(n) => ubahI(i, { tiket: n })} />
                        <DateInput label="Kontak terakhir" value={v.kontakTerakhir} onChange={(t) => ubahI(i, { kontakTerakhir: t })} />
                      </Grid>
                      <TextInput label="Langkah berikutnya" value={v.langkah} maxLength={120} onChange={(t) => ubahI(i, { langkah: t })} />
                      <TextArea label="Catatan" rows={2} maxLength={600} value={v.catatan} onChange={(t) => ubahI(i, { catatan: t })} />
                      {v.tiket > 0 && <Note>{rp(v.tiket)}</Note>}
                    </div>
                  )}
                </div>
              );
            })}
            {d.investor.length < 100 && (
              <div className={`${k.addBtn} no-print`}>
                <Button
                  small
                  onClick={() => {
                    setD((x) => ({ ...x, investor: [...x.investor, kosong()] }));
                    setBuka(d.investor.length);
                    setFilter("semua");
                  }}
                >
                  + Tambah investor
                </Button>
              </div>
            )}
            {d.investor.length === 0 && <Note>Mulai dengan menulis 20 sampai 30 calon investor yang cocok dengan tahap dan bidang startup kamu.</Note>}
          </div>
        </Card>
      </Split>
    </ToolShell>
  );
}
