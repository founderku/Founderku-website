"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { hitungSaham, persen, type InputSaham } from "@/lib/tools/sahamin/calc";
import { nf, pct, rp, rpRingkas } from "@/lib/tools/format";
import {
  Button,
  Card,
  Grid,
  kitStyles as k,
  Note,
  NumInput,
  RemoveBtn,
  Split,
  Stat,
  StdActions,
  TextInput,
  ToolShell,
  Verdict,
} from "@/components/tools/kit/Kit";
import { StackedBars } from "@/components/tools/kit/Charts";

const MAKS_PUTARAN = 4;

const AWAL: InputSaham = {
  pendiri: [
    { nama: "Pendiri 1", porsi: 50 },
    { nama: "Pendiri 2", porsi: 50 },
  ],
  esop: 10,
  putaran: [{ nama: "Pre-seed", preMoney: 0, investasi: 0 }],
};

const CONTOH: InputSaham = {
  pendiri: [
    { nama: "Rina (CEO)", porsi: 60 },
    { nama: "Dimas (CTO)", porsi: 40 },
  ],
  esop: 10,
  putaran: [
    { nama: "Pre-seed", preMoney: 8_000_000_000, investasi: 2_000_000_000 },
    { nama: "Seed", preMoney: 30_000_000_000, investasi: 7_500_000_000 },
  ],
};

export default function Sahamin() {
  const [d, setD, reset] = useToolState<InputSaham>("sahamin", "draft-v1", AWAL);
  const ubah = (p: Partial<InputSaham>) => setD((x) => ({ ...x, ...p }));
  const tahap = useMemo(() => hitungSaham(d), [d]);
  const akhir = tahap[tahap.length - 1];
  const totalPorsi = d.pendiri.reduce((a, p) => a + (p.porsi || 0), 0);
  const pendiriAwal = tahap[0].pemegang.filter((p) => p.jenis === "pendiri").reduce((a, p) => a + persen(tahap[0], p.id), 0);
  const pendiriAkhir = akhir.pemegang.filter((p) => p.jenis === "pendiri").reduce((a, p) => a + persen(akhir, p.id), 0);
  const adaPutaran = tahap.some((t) => t.postMoney !== null);

  // Grafik: pendiri digabung, ESOP, lalu investor tiap putaran (maks 6 warna)
  const keys = [
    { key: "pendiri", name: "Pendiri", slot: 1 as const },
    { key: "esop", name: "ESOP", slot: 2 as const },
    ...d.putaran.slice(0, MAKS_PUTARAN).map((r, i) => ({
      key: "r" + i,
      name: `Investor ${r.nama || "putaran " + (i + 1)}`,
      slot: (i + 3) as 3 | 4 | 5 | 6,
    })),
  ];
  const rows = tahap.map((t) => {
    const v: Record<string, number> = {};
    t.pemegang.forEach((p) => {
      const kunci = p.jenis === "pendiri" ? "pendiri" : p.id;
      v[kunci] = (v[kunci] || 0) + persen(t, p.id);
    });
    return { label: t.nama, values: v };
  });

  return (
    <ToolShell
      eyebrow="Founderku Tools · Pendanaan"
      title="Sahamin"
      desc="Simulasikan kepemilikan saham (cap table): berapa persen milik pendiri, jatah saham karyawan (ESOP), dan investor setelah tiap putaran pendanaan."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Grid>
                <Stat label="Saham pendiri di awal" value={pct(pendiriAwal)} />
                <Stat label={`Setelah ${akhir.nama}`} value={pct(pendiriAkhir)} />
                <Stat label="Valuasi terakhir (post-money)" value={akhir.postMoney ? rpRingkas(akhir.postMoney) : "-"} />
                <Stat
                  label="Nilai saham pendiri"
                  value={akhir.postMoney ? rpRingkas((akhir.postMoney * pendiriAkhir) / 100) : "-"}
                  sub="Di atas kertas, belum bisa dicairkan"
                />
              </Grid>
            </Card>
            {adaPutaran && (
              <Verdict tone={pendiriAkhir >= 50 ? "good" : pendiriAkhir >= 35 ? "warn" : "bad"} title={`Pendiri memegang ${pct(pendiriAkhir)}`}>
                <p>
                  {pendiriAkhir >= 50
                    ? "Pendiri masih memegang mayoritas. Wajar untuk tahap awal."
                    : pendiriAkhir >= 35
                      ? "Masih wajar setelah beberapa putaran, tapi hati-hati melepas terlalu banyak di putaran awal."
                      : "Porsi pendiri sudah kecil. Investor biasanya ingin pendiri tetap punya cukup saham supaya tetap termotivasi."}
                </p>
              </Verdict>
            )}
            <Card title="Komposisi saham tiap tahap" hint="Arahkan atau sentuh batang untuk lihat angkanya.">
              <StackedBars rows={rows} keys={keys} format={(n) => pct(n)} />
            </Card>
          </>
        }
      >
        <Card
          title="Pendiri"
          hint={
            Math.abs(totalPorsi - 100) > 0.01
              ? `Total porsi ${nf(totalPorsi, 1)}%. Nanti dihitung ulang supaya jadi 100%.`
              : "Pembagian saham antar pendiri (total 100%)."
          }
        >
          <div className={k.rows}>
            {d.pendiri.map((p, i) => (
              <div key={i} className={k.rowLine}>
                <TextInput
                  label={i === 0 ? "Nama" : `Nama pendiri ${i + 1}`}
                  hideLabel={i > 0}
                  value={p.nama}
                  maxLength={40}
                  onChange={(v) => ubah({ pendiri: d.pendiri.map((x, j) => (j === i ? { ...x, nama: v } : x)) })}
                />
                <NumInput
                  label={i === 0 ? "Porsi" : `Porsi pendiri ${i + 1}`}
                  hideLabel={i > 0}
                  suffix="%"
                  value={p.porsi}
                  min={0}
                  max={100}
                  onChange={(n) => ubah({ pendiri: d.pendiri.map((x, j) => (j === i ? { ...x, porsi: n } : x)) })}
                />
                <RemoveBtn
                  label={`Hapus ${p.nama || "pendiri"}`}
                  onClick={() => d.pendiri.length > 1 && ubah({ pendiri: d.pendiri.filter((_, j) => j !== i) })}
                />
              </div>
            ))}
            {d.pendiri.length < 6 && (
              <div className={`${k.addBtn} no-print`}>
                <Button small onClick={() => ubah({ pendiri: [...d.pendiri, { nama: "", porsi: 0 }] })}>
                  + Tambah pendiri
                </Button>
              </div>
            )}
          </div>
          <div style={{ height: 16 }} />
          <NumInput
            label="Jatah saham karyawan (ESOP)"
            suffix="%"
            hint="Disisihkan sebelum investor masuk. Umumnya 10 sampai 15%."
            value={d.esop}
            min={0}
            max={50}
            onChange={(n) => ubah({ esop: n })}
          />
        </Card>

        <Card title="Putaran pendanaan" hint="Valuasi pre-money = nilai perusahaan sebelum uang investor masuk.">
          <div className={k.rows}>
            {d.putaran.map((r, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
                  <div style={{ flex: 1 }}>
                    <TextInput
                      label={`Nama putaran ${i + 1}`}
                      value={r.nama}
                      maxLength={30}
                      onChange={(v) => ubah({ putaran: d.putaran.map((x, j) => (j === i ? { ...x, nama: v } : x)) })}
                    />
                  </div>
                  <RemoveBtn label={`Hapus ${r.nama || "putaran"}`} onClick={() => ubah({ putaran: d.putaran.filter((_, j) => j !== i) })} />
                </div>
                <Grid>
                  <NumInput
                    money
                    label="Valuasi pre-money"
                    value={r.preMoney}
                    onChange={(n) => ubah({ putaran: d.putaran.map((x, j) => (j === i ? { ...x, preMoney: n } : x)) })}
                  />
                  <NumInput
                    money
                    label="Dana investor"
                    value={r.investasi}
                    onChange={(n) => ubah({ putaran: d.putaran.map((x, j) => (j === i ? { ...x, investasi: n } : x)) })}
                  />
                </Grid>
                {tahap[i + 1]?.postMoney ? (
                  <Note>
                    Investor dapat {pct(persen(tahap[i + 1], "r" + i))} · post-money {rp(tahap[i + 1].postMoney ?? 0)}
                  </Note>
                ) : null}
              </div>
            ))}
            {d.putaran.length < MAKS_PUTARAN && (
              <div className={`${k.addBtn} no-print`}>
                <Button
                  small
                  onClick={() =>
                    ubah({
                      putaran: [
                        ...d.putaran,
                        { nama: ["Pre-seed", "Seed", "Seri A", "Seri B"][d.putaran.length] ?? "", preMoney: 0, investasi: 0 },
                      ],
                    })
                  }
                >
                  + Tambah putaran
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card title="Tabel kepemilikan">
          <div className={k.tableWrap}>
            <table className={k.table}>
              <thead>
                <tr>
                  <th>Pemegang</th>
                  {tahap.map((t, ti) => (
                    <th key={ti}>{t.nama}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {akhir.pemegang.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nama}</td>
                    {tahap.map((t, ti) => (
                      <td key={ti}>{t.pemegang.some((x) => x.id === p.id) ? pct(persen(t, p.id)) : "-"}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td>Harga per lembar</td>
                  {tahap.map((t, ti) => (
                    <td key={ti}>{t.hargaPerSaham ? rp(t.hargaPerSaham) : "-"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ height: 10 }} />
          <Note>
            Dihitung dengan {nf(tahap[0].total)} lembar saham awal sebagai acuan. Simulasi ini untuk putaran priced (harga saham
            ditentukan), belum termasuk SAFE atau convertible note. Untuk dokumen resmi, konsultasikan dengan notaris atau
            konsultan hukum.
          </Note>
        </Card>
      </Split>
    </ToolShell>
  );
}
