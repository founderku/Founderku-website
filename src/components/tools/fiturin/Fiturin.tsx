"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { CONFIDENCE, IMPACT, susunMvp, type Fitur } from "@/lib/tools/fiturin/calc";
import { nf } from "@/lib/tools/format";
import {
  Badge,
  Button,
  Card,
  Grid,
  kitStyles as k,
  Note,
  NumInput,
  RemoveBtn,
  Select,
  Split,
  Stat,
  StdActions,
  TextInput,
  Toggle,
  ToolShell,
} from "@/components/tools/kit/Kit";

interface DataFitur {
  kapasitas: number; // orang-minggu tersedia untuk MVP
  fitur: Fitur[];
}

const baru = (nama = ""): Fitur => ({ nama, reach: 0, impact: 1, confidence: 80, effort: 1, wajib: false });

const AWAL: DataFitur = { kapasitas: 12, fitur: [baru(), baru()] };

const CONTOH: DataFitur = {
  kapasitas: 12,
  fitur: [
    { nama: "Catat transaksi di HP", reach: 400, impact: 3, confidence: 100, effort: 3, wajib: true },
    { nama: "Laporan untung harian", reach: 350, impact: 3, confidence: 80, effort: 2, wajib: false },
    { nama: "Pengingat stok menipis", reach: 200, impact: 2, confidence: 50, effort: 2, wajib: false },
    { nama: "Cetak struk Bluetooth", reach: 120, impact: 1, confidence: 80, effort: 3, wajib: false },
    { nama: "Multi cabang", reach: 30, impact: 2, confidence: 50, effort: 6, wajib: false },
    { nama: "Kirim laporan ke WhatsApp", reach: 300, impact: 1, confidence: 80, effort: 1, wajib: false },
  ],
};

export default function Fiturin() {
  const [d, setD, reset] = useToolState<DataFitur>("fiturin", "draft-v1", AWAL);
  const ubahF = (i: number, p: Partial<Fitur>) => setD((x) => ({ ...x, fitur: x.fitur.map((f, j) => (j === i ? { ...f, ...p } : f)) }));
  const urut = useMemo(() => susunMvp(d.fitur, d.kapasitas), [d]);
  const masuk = urut.filter((u) => u.masuk);
  const effortMasuk = masuk.reduce((a, u) => a + (d.fitur[u.index].effort || 0), 0);
  const maksSkor = Math.max(1, ...urut.map((u) => u.skor));
  const adaIsi = d.fitur.some((f) => f.nama.trim() && f.reach > 0);

  return (
    <ToolShell
      eyebrow="Founderku Tools · Produk & MVP"
      title="Fiturin"
      desc="Tentukan fitur mana yang masuk MVP pakai skor RICE: seberapa banyak pengguna terdampak, seberapa besar dampaknya, seberapa yakin, dan berapa lama membuatnya."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Grid>
                <Stat label="Fitur masuk MVP" value={`${masuk.length} dari ${d.fitur.length}`} />
                <Stat label="Waktu terpakai" value={`${nf(effortMasuk, 1)} / ${nf(d.kapasitas, 1)}`} sub="orang-minggu" />
              </Grid>
            </Card>
            <Card title="Urutan prioritas" hint="Fitur wajib selalu di atas, sisanya urut skor RICE.">
              <div className={k.rows}>
                {urut.map((u, n) => {
                  const f = d.fitur[u.index];
                  return (
                    <div key={u.index} style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 14.5, fontWeight: 500 }}>
                          {n + 1}. {f.nama || `Fitur ${u.index + 1}`}
                        </span>
                        <Badge tone={u.masuk ? "good" : "neutral"} text={u.masuk ? "Masuk MVP" : "Nanti"} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--panel-2)", overflow: "hidden" }}>
                          <div style={{ width: `${(u.skor / maksSkor) * 100}%`, height: "100%", borderRadius: 4, background: u.masuk ? "var(--orange)" : "var(--line-2)" }} />
                        </div>
                        <span style={{ fontSize: 12.5, color: "var(--faint)", minWidth: 70, textAlign: "right" }}>
                          RICE {nf(u.skor, 1)}
                          {f.wajib ? " · wajib" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {adaIsi && masuk.length < d.fitur.length && (
                <>
                  <div style={{ height: 10 }} />
                  <Note>Fitur &quot;Nanti&quot; bukan dibuang: simpan untuk versi berikutnya setelah MVP dipakai pengguna.</Note>
                </>
              )}
            </Card>
          </>
        }
      >
        <Card title="Kapasitas tim" hint="Total waktu yang tersedia untuk MVP. Misal 2 developer x 6 minggu = 12 orang-minggu.">
          <NumInput label="Kapasitas" suffix="orang-minggu" value={d.kapasitas} onChange={(n) => setD((x) => ({ ...x, kapasitas: n }))} min={0} />
        </Card>
        <Card title="Daftar fitur">
          <div className={k.rows}>
            {d.fitur.map((f, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
                  <div style={{ flex: 1 }}>
                    <TextInput label={`Fitur ${i + 1}`} value={f.nama} maxLength={80} onChange={(v) => ubahF(i, { nama: v })} />
                  </div>
                  <RemoveBtn label={`Hapus ${f.nama || "fitur"}`} onClick={() => setD((x) => ({ ...x, fitur: x.fitur.filter((_, j) => j !== i) }))} />
                </div>
                <Grid>
                  <NumInput label="Reach (pengguna/bulan)" digits={0} value={f.reach} onChange={(n) => ubahF(i, { reach: n })} min={0} />
                  <Select label="Dampak" value={f.impact} onChange={(v) => ubahF(i, { impact: v })} options={IMPACT.map((o) => ({ v: o.v, label: o.label }))} />
                  <Select
                    label="Keyakinan"
                    value={f.confidence}
                    onChange={(v) => ubahF(i, { confidence: v })}
                    options={CONFIDENCE.map((o) => ({ v: o.v, label: `${o.label} (${o.v}%)` }))}
                  />
                  <NumInput label="Usaha (orang-minggu)" value={f.effort} onChange={(n) => ubahF(i, { effort: n })} min={0} />
                </Grid>
                <Toggle label="Wajib (tanpa ini produk tidak bisa dipakai)" checked={f.wajib} onChange={(v) => ubahF(i, { wajib: v })} />
              </div>
            ))}
            {d.fitur.length < 30 && (
              <div className={`${k.addBtn} no-print`}>
                <Button small onClick={() => setD((x) => ({ ...x, fitur: [...x.fitur, baru()] }))}>
                  + Tambah fitur
                </Button>
              </div>
            )}
          </div>
        </Card>
        <Note>
          RICE = Reach x Impact x Confidence / Effort. Skornya untuk membandingkan antar fitur, bukan angka mutlak. Tandai
          &quot;wajib&quot; hanya untuk fitur yang benar-benar inti.
        </Note>
      </Split>
    </ToolShell>
  );
}
