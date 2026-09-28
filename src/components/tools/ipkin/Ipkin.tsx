"use client";

import { useToolState } from "@/lib/tools/useToolState";
import {
  SKALA,
  bulat2,
  hitungIPK,
  predikat,
  simulasiTarget,
  type Matkul,
  type Semester,
  type Skala,
} from "@/lib/tools/ipkin/calc";
import { nf } from "@/lib/tools/format";
import {
  Badge,
  Button,
  Card,
  Grid,
  Note,
  NumInput,
  RemoveBtn,
  Select,
  Split,
  Stat,
  StdActions,
  TextInput,
  ToolShell,
  Verdict,
  kitStyles as k,
} from "@/components/tools/kit/Kit";
import { LineChart } from "@/components/tools/kit/Charts";
import g from "./ipkin.module.css";

interface DataIpk {
  skala: Skala;
  semester: Semester[];
  target: number;
  totalSks: number;
}

const MAKS_SEMESTER = 14;
const MAKS_MATKUL = 15;

const matkulKosong = (): Matkul => ({ nama: "", sks: 0, nilai: "" });

const AWAL: DataIpk = {
  skala: "standar",
  semester: [{ nama: "", matkul: [matkulKosong(), matkulKosong(), matkulKosong()] }],
  target: 3.5,
  totalSks: 144,
};

const mk = (nama: string, sks: number, nilai: string): Matkul => ({ nama, sks, nilai });

const CONTOH: DataIpk = {
  skala: "standar",
  target: 3.5,
  totalSks: 144,
  semester: [
    {
      nama: "",
      matkul: [
        mk("Pengantar Manajemen", 3, "AB"),
        mk("Matematika Ekonomi", 3, "B"),
        mk("Pengantar Akuntansi", 3, "A"),
        mk("Bahasa Inggris", 2, "A"),
        mk("Pendidikan Pancasila", 2, "AB"),
        mk("Pengantar Ekonomi Mikro", 3, "BC"),
        mk("Agama", 2, "A"),
      ],
    },
    {
      nama: "",
      matkul: [
        mk("Statistika Bisnis", 3, "B"),
        mk("Akuntansi Keuangan", 3, "AB"),
        mk("Pengantar Ekonomi Makro", 3, "B"),
        mk("Perilaku Organisasi", 3, "A"),
        mk("Bahasa Indonesia", 2, "A"),
        mk("Kewarganegaraan", 2, "A"),
        mk("Pengantar Bisnis Digital", 3, "AB"),
      ],
    },
    {
      nama: "",
      matkul: [
        mk("Manajemen Pemasaran", 3, "A"),
        mk("Manajemen Keuangan", 3, "AB"),
        mk("Riset Operasi", 3, "B"),
        mk("Kewirausahaan", 3, "A"),
        mk("Sistem Informasi Manajemen", 3, "AB"),
        mk("Etika Bisnis", 2, "A"),
        mk("Hukum Bisnis", 3, "AB"),
      ],
    },
    {
      nama: "",
      matkul: [
        mk("Manajemen Operasi", 3, "AB"),
        mk("Manajemen SDM", 3, "A"),
        mk("Metodologi Penelitian", 3, ""),
        mk("Perilaku Konsumen", 3, ""),
        mk("Studi Kelayakan Bisnis", 3, ""),
      ],
    },
  ],
};

// IP selalu tampil 2 angka di belakang koma, seperti di transkrip
const ip = (n: number | null) => (n === null ? "-" : bulat2(n).toFixed(2).replace(".", ","));

export default function Ipkin() {
  const [d, setD, reset] = useToolState<DataIpk>("ipkin", "draft-v1", AWAL);
  const skala: Skala = d.skala in SKALA ? d.skala : "standar";
  const semester = Array.isArray(d.semester) ? d.semester : AWAL.semester;
  const h = hitungIPK(semester, skala);
  const pred = predikat(h.ipk);
  const sisa = Math.max(0, (d.totalSks || 0) - h.sks);
  const sim = simulasiTarget(h.sks, h.mutu, d.target, sisa);

  const opsiNilai = [{ v: "", label: "Belum ada" }, ...SKALA[skala].nilai.map((n) => ({ v: n.huruf, label: `${n.huruf} (${nf(n.bobot, 1)})` }))];

  const ubahSem = (i: number, f: (s: Semester) => Semester) =>
    setD((x) => ({ ...x, semester: x.semester.map((s, j) => (j === i ? f(s) : s)) }));
  const ubahMk = (i: number, m: number, isi: Partial<Matkul>) =>
    ubahSem(i, (s) => ({ ...s, matkul: s.matkul.map((x, j) => (j === m ? { ...x, ...isi } : x)) }));

  // Grafik: hanya semester yang sudah punya nilai
  const titik = h.per.map((p, i) => ({ ...p, no: i + 1 })).filter((p) => p.ips !== null);

  return (
    <ToolShell
      eyebrow="Founderku Tools · Mahasiswa & Karier"
      title="IPK-in"
      desc="Hitung IPS tiap semester dan IPK kumulatif, lihat grafik perkembangannya, dan simulasikan berapa nilai rata-rata yang dibutuhkan untuk mengejar target IPK."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Stat big label="IPK kumulatif" value={ip(h.ipk)} sub={h.sks ? `dari ${nf(h.sks)} SKS yang sudah ada nilainya` : "Isi nilai mata kuliah dulu"} />
              {pred && (
                <div className={g.pred}>
                  <Badge tone={pred.tone} text={`Predikat: ${pred.label}`} />
                </div>
              )}
              <div style={{ height: 12 }} />
              <Grid keep>
                <Stat label="Total SKS" value={nf(h.sks)} />
                <Stat label="Semester" value={nf(titik.length)} />
              </Grid>
            </Card>

            {titik.length > 0 && (
              <Card title="Perkembangan IP">
                {titik.length >= 2 && (
                  <LineChart
                    ariaLabel="Grafik IPS dan IPK per semester"
                    height={220}
                    series={[
                      { name: "IPS", slot: 2, values: titik.map((p) => bulat2(p.ips ?? 0)) },
                      { name: "IPK", slot: 1, values: titik.map((p) => bulat2(p.ipk ?? 0)) },
                    ]}
                    xLabel={(i) => `S${titik[i]?.no ?? i + 1}`}
                    yFormat={(n) => nf(n, 2)}
                    yMin={Math.max(0, Math.floor(Math.min(...titik.map((p) => p.ips ?? 4)) - 0.5))}
                  />
                )}
                <div className={k.tableWrap}>
                  <table className={k.table}>
                    <thead>
                      <tr>
                        <th>Semester</th>
                        <th>SKS</th>
                        <th>IPS</th>
                        <th>IPK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {titik.map((p) => (
                        <tr key={p.no}>
                          <td>Semester {p.no}</td>
                          <td>{nf(p.sks)}</td>
                          <td>{ip(p.ips)}</td>
                          <td>{ip(p.ipk)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <Card title="Simulasi target IPK" hint="Berapa rata-rata nilai yang dibutuhkan di sisa SKS supaya IPK akhir mencapai target?">
              <Grid keep>
                <NumInput label="Target IPK" value={d.target} digits={2} min={0} max={4} onChange={(n) => setD((x) => ({ ...x, target: n }))} />
                <NumInput label="Total SKS lulus" value={d.totalSks} digits={0} min={0} max={300} onChange={(n) => setD((x) => ({ ...x, totalSks: n }))} />
              </Grid>
              <div style={{ height: 12 }} />
              {!sim ? (
                <Note>
                  {sisa <= 0 && d.totalSks > 0
                    ? "SKS yang sudah dinilai sudah mencapai total SKS lulus, jadi tidak ada sisa SKS untuk disimulasikan."
                    : "Isi target IPK dan total SKS lulus (umumnya 144 SKS untuk S1, cek pedoman kampusmu)."}
                </Note>
              ) : (
                <Verdict
                  tone={sim.status === "aman" || sim.status === "bisa" ? "good" : sim.status === "berat" ? "warn" : "bad"}
                  title={
                    sim.status === "aman"
                      ? "Target sudah aman"
                      : sim.status === "bisa"
                        ? `Butuh rata-rata ${ip(sim.butuh)}`
                        : sim.status === "berat"
                          ? `Butuh rata-rata ${ip(sim.butuh)}`
                          : "Target belum mungkin"
                  }
                >
                  <p>
                    {sim.status === "aman" &&
                      `Dengan ${nf(sisa)} SKS tersisa, IPK akhirmu tetap di atas ${ip(d.target)} walau nilai sisanya rendah. Tetap jaga ya.`}
                    {sim.status === "bisa" && `Di ${nf(sisa)} SKS tersisa, usahakan rata-rata nilai minimal ${ip(sim.butuh)}. Masih realistis.`}
                    {sim.status === "berat" &&
                      `Di ${nf(sisa)} SKS tersisa kamu perlu rata-rata ${ip(sim.butuh)}, artinya hampir semua mata kuliah harus A. Berat tapi masih mungkin.`}
                    {sim.status === "mustahil" &&
                      `Walau semua ${nf(sisa)} SKS tersisa dapat A, IPK akhir maksimal ${ip(sim.maksimal)}. Coba turunkan target sedikit.`}
                  </p>
                  {sim.status !== "mustahil" && <p>IPK tertinggi yang masih bisa dicapai: {ip(sim.maksimal)}.</p>}
                </Verdict>
              )}
            </Card>

            <Card tone="soft">
              <Note>
                Predikat mengikuti batas yang umum dipakai (Permendikbud No. 3 Tahun 2020): memuaskan 2,76 sampai 3,00; sangat
                memuaskan 3,01 sampai 3,50; dengan pujian di atas 3,50. Tiap kampus bisa punya syarat tambahan, misalnya masa
                studi atau tidak ada nilai D, jadi cek pedoman akademik kampusmu.
              </Note>
            </Card>
          </>
        }
      >
        <Card title="Skala nilai" hint="Pilih yang sesuai kampusmu. Bobot tiap huruf bisa berbeda antar kampus.">
          <Select<Skala>
            label="Skala nilai huruf"
            value={skala}
            onChange={(v) => setD((x) => ({ ...x, skala: v }))}
            options={(Object.keys(SKALA) as Skala[]).map((v) => ({ v, label: SKALA[v].label }))}
          />
        </Card>

        {semester.map((sem, i) => {
          const hs = h.per[i];
          const matkul = Array.isArray(sem.matkul) ? sem.matkul : [];
          return (
            <Card
              key={i}
              title={`Semester ${i + 1}`}
              hint={hs && hs.ips !== null ? `IPS ${ip(hs.ips)} · ${nf(hs.sks)} SKS dinilai` : "Belum ada nilai"}
              right={
                semester.length > 1 ? (
                  <RemoveBtn
                    label={`Hapus semester ${i + 1}`}
                    onClick={() => {
                      if (window.confirm(`Hapus semester ${i + 1} beserta semua mata kuliahnya?`))
                        setD((x) => ({ ...x, semester: x.semester.filter((_, j) => j !== i) }));
                    }}
                  />
                ) : undefined
              }
            >
              <div className={k.rows}>
                {matkul.map((m, j) => (
                  <div key={j} className={g.rowMk}>
                    <TextInput
                      label={j === 0 ? "Mata kuliah" : `Mata kuliah ${j + 1}`}
                      hideLabel={j > 0}
                      placeholder={`Mata kuliah ${j + 1}`}
                      value={m.nama}
                      maxLength={80}
                      onChange={(v) => ubahMk(i, j, { nama: v })}
                    />
                    <NumInput
                      label={j === 0 ? "SKS" : `SKS ${j + 1}`}
                      hideLabel={j > 0}
                      value={m.sks}
                      digits={0}
                      min={0}
                      max={24}
                      onChange={(n) => ubahMk(i, j, { sks: n })}
                    />
                    <Select<string>
                      label={j === 0 ? "Nilai" : `Nilai ${j + 1}`}
                      hideLabel={j > 0}
                      value={SKALA[skala].nilai.some((n) => n.huruf === m.nilai) ? m.nilai : ""}
                      onChange={(v) => ubahMk(i, j, { nilai: v })}
                      options={opsiNilai}
                    />
                    <RemoveBtn
                      label={`Hapus ${m.nama || `mata kuliah ${j + 1}`}`}
                      onClick={() => ubahSem(i, (s) => ({ ...s, matkul: s.matkul.filter((_, x) => x !== j) }))}
                    />
                  </div>
                ))}
                {matkul.length < MAKS_MATKUL && (
                  <div className={`${k.addBtn} no-print`}>
                    <Button small onClick={() => ubahSem(i, (s) => ({ ...s, matkul: [...s.matkul, matkulKosong()] }))}>
                      + Tambah mata kuliah
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {semester.length < MAKS_SEMESTER && (
          <div className="no-print">
            <Button
              onClick={() =>
                setD((x) => ({ ...x, semester: [...x.semester, { nama: "", matkul: [matkulKosong(), matkulKosong(), matkulKosong()] }] }))
              }
            >
              + Tambah semester
            </Button>
          </div>
        )}
        <Note>Mata kuliah yang nilainya &quot;Belum ada&quot; tidak ikut dihitung. Nilai E tetap dihitung dengan bobot 0.</Note>
      </Split>
    </ToolShell>
  );
}
