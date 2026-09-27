"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { hitungRunway, BATAS_BULAN, type InputRunway } from "@/lib/tools/runwayin/calc";
import { nf, rp, rpRingkas } from "@/lib/tools/format";
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
  Toggle,
  ToolShell,
  Verdict,
  type Tone,
} from "@/components/tools/kit/Kit";
import { LineChart } from "@/components/tools/kit/Charts";

const AWAL: InputRunway = {
  kas: 0,
  pemasukan: 0,
  tumbuhPemasukan: 0,
  biaya: [
    { nama: "Gaji tim", jumlah: 0 },
    { nama: "Server & software", jumlah: 0 },
    { nama: "Marketing", jumlah: 0 },
    { nama: "Sewa & operasional", jumlah: 0 },
  ],
  tumbuhBiaya: 0,
  skenario: { aktif: false, tambahanBiaya: 0, mulaiBulan: 3, suntikanDana: 0, bulanDana: 6 },
};

const CONTOH: InputRunway = {
  kas: 500_000_000,
  pemasukan: 15_000_000,
  tumbuhPemasukan: 8,
  biaya: [
    { nama: "Gaji tim (4 orang)", jumlah: 45_000_000 },
    { nama: "Server & software", jumlah: 5_000_000 },
    { nama: "Marketing", jumlah: 15_000_000 },
    { nama: "Sewa & operasional", jumlah: 10_000_000 },
  ],
  tumbuhBiaya: 2,
  skenario: { aktif: true, tambahanBiaya: 20_000_000, mulaiBulan: 3, suntikanDana: 0, bulanDana: 6 },
};

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function labelBulan(i: number): string {
  const d = new Date();
  const m = d.getMonth() + i;
  const th = d.getFullYear() + Math.floor(m / 12);
  return `${BULAN[((m % 12) + 12) % 12]} ${String(th).slice(2)}`;
}

function teksRunway(bulan: number | null): string {
  if (bulan === null) return `Lebih dari ${BATAS_BULAN / 12} tahun`;
  return `${nf(bulan, 1)} bulan`;
}

function nilai(bulan: number | null): { tone: Tone; judul: string; isi: string } {
  if (bulan === null)
    return {
      tone: "good",
      judul: "Aman",
      isi: "Dengan angka ini uang tidak habis dalam 5 tahun. Jaga pertumbuhan pemasukan tetap di atas pertumbuhan biaya.",
    };
  if (bulan < 6)
    return {
      tone: "bad",
      judul: "Kurang dari 6 bulan",
      isi: "Galang dana biasanya butuh 3 sampai 6 bulan. Mulai sekarang: pangkas biaya yang tidak langsung menambah pendapatan, dan kejar pemasukan tercepat.",
    };
  if (bulan < 12)
    return {
      tone: "warn",
      judul: "6 sampai 12 bulan",
      isi: "Masih ada waktu, tapi siapkan pendanaan berikutnya atau jalur ke untung dari sekarang. Idealnya mulai galang dana saat runway tinggal 9 sampai 12 bulan.",
    };
  return {
    tone: "good",
    judul: "12 bulan atau lebih",
    isi: "Runway cukup panjang untuk fokus membangun. Tetap pantau burn rate tiap bulan supaya tidak kaget.",
  };
}

export default function Runwayin() {
  const [d, setD, reset] = useToolState<InputRunway>("runwayin", "draft-v1", AWAL);
  const ubah = (p: Partial<InputRunway>) => setD((x) => ({ ...x, ...p }));
  const ubahSk = (p: Partial<InputRunway["skenario"]>) => setD((x) => ({ ...x, skenario: { ...x.skenario, ...p } }));

  const dasar = useMemo(() => hitungRunway(d, false), [d]);
  const skn = useMemo(() => hitungRunway(d, true), [d]);
  const adaSk = d.skenario.aktif;
  const utama = adaSk ? skn : dasar;
  const v = nilai(utama.runwayBulan);
  const adaIsi = d.kas > 0 || dasar.biayaAwal > 0;

  // Panjang grafik: sampai uang habis (+2 bulan), maksimal 36 bulan
  const panjang = Math.min(
    36,
    Math.max(12, (dasar.bulanHabis ?? 36) + 2, adaSk ? (skn.bulanHabis ?? 36) + 2 : 0),
  );
  const potong = (arr: number[]) => arr.slice(0, panjang + 1);

  return (
    <ToolShell
      eyebrow="Founderku Tools · Keuangan Startup"
      title="Runwayin"
      desc="Hitung berapa bulan lagi uang startup kamu cukup (runway), kapan kas habis, dan simulasikan skenario seperti rekrut orang baru atau pendanaan masuk."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Stat
                big
                label={adaSk ? "Runway (dengan skenario)" : "Runway"}
                value={adaIsi ? teksRunway(utama.runwayBulan) : "-"}
                sub={
                  adaIsi && utama.bulanHabis !== null
                    ? `Kas habis sekitar ${labelBulan(utama.bulanHabis)}`
                    : adaIsi
                      ? "Kas tidak habis dalam simulasi"
                      : "Isi kas dan pengeluaran dulu"
                }
              />
              <div style={{ height: 12 }} />
              <Grid keep>
                <Stat label="Burn rate bulan ini" value={rp(Math.max(0, dasar.burnAwal))} sub={dasar.burnAwal <= 0 && adaIsi ? "Sudah untung" : undefined} />
                <Stat
                  label="Mulai untung"
                  value={utama.bulanUntung ? labelBulan(utama.bulanUntung) : "-"}
                  sub={utama.bulanUntung ? `Bulan ke-${utama.bulanUntung}` : "Belum dalam simulasi"}
                />
              </Grid>
              {adaSk && adaIsi && (
                <>
                  <div style={{ height: 12 }} />
                  <Note>
                    Tanpa skenario: {teksRunway(dasar.runwayBulan)}. Dengan skenario:{" "}
                    {teksRunway(skn.runwayBulan)}.
                  </Note>
                </>
              )}
            </Card>
            {adaIsi && (
              <Verdict tone={v.tone} title={v.judul}>
                <p>{v.isi}</p>
              </Verdict>
            )}
            {adaIsi && (
              <Card title="Kas per bulan" hint="Arahkan atau sentuh grafik untuk lihat angka tiap bulan.">
                <LineChart
                  ariaLabel="Grafik kas per bulan"
                  series={[
                    { name: "Tanpa skenario", slot: 1, values: potong(dasar.kasPerBulan) },
                    ...(adaSk ? [{ name: "Dengan skenario", slot: 2 as const, values: potong(skn.kasPerBulan) }] : []),
                  ]}
                  xLabel={labelBulan}
                  yFormat={rpRingkas}
                />
              </Card>
            )}
          </>
        }
      >
        <Card title="Kondisi sekarang">
          <Grid>
            <NumInput money label="Kas di bank sekarang" value={d.kas} onChange={(n) => ubah({ kas: n })} />
            <NumInput
              money
              label="Pemasukan per bulan"
              hint="Rata-rata pemasukan bulan terakhir"
              value={d.pemasukan}
              onChange={(n) => ubah({ pemasukan: n })}
            />
            <NumInput
              label="Pemasukan tumbuh per bulan"
              suffix="%"
              value={d.tumbuhPemasukan}
              onChange={(n) => ubah({ tumbuhPemasukan: n })}
              min={-50}
              max={100}
            />
            <NumInput
              label="Pengeluaran naik per bulan"
              suffix="%"
              hint="Misal karena inflasi atau tim bertambah"
              value={d.tumbuhBiaya}
              onChange={(n) => ubah({ tumbuhBiaya: n })}
              min={-50}
              max={100}
            />
          </Grid>
        </Card>

        <Card title="Pengeluaran per bulan" hint={`Total sekarang: ${rp(dasar.biayaAwal)}`}>
          <div className={k.rows}>
            {d.biaya.map((b, i) => (
              <div key={i} className={k.rowLine}>
                <TextInput
                  label={i === 0 ? "Pos biaya" : `Pos biaya ${i + 1}`}
                  hideLabel={i > 0}
                  value={b.nama}
                  onChange={(v) => ubah({ biaya: d.biaya.map((x, j) => (j === i ? { ...x, nama: v } : x)) })}
                  maxLength={60}
                />
                <NumInput
                  money
                  label={i === 0 ? "Per bulan" : `Biaya per bulan ${i + 1}`}
                  hideLabel={i > 0}
                  value={b.jumlah}
                  onChange={(n) => ubah({ biaya: d.biaya.map((x, j) => (j === i ? { ...x, jumlah: n } : x)) })}
                />
                <RemoveBtn label={`Hapus ${b.nama || "baris"}`} onClick={() => ubah({ biaya: d.biaya.filter((_, j) => j !== i) })} />
              </div>
            ))}
            {d.biaya.length < 20 && (
              <div className={`${k.addBtn} no-print`}>
                <Button small onClick={() => ubah({ biaya: [...d.biaya, { nama: "", jumlah: 0 }] })}>
                  + Tambah pos biaya
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card
          title="Simulasi skenario"
          hint="Bandingkan: bagaimana kalau rekrut orang baru, atau ada pendanaan masuk?"
          right={<Toggle label="Aktif" checked={d.skenario.aktif} onChange={(v) => ubahSk({ aktif: v })} />}
        >
          {d.skenario.aktif ? (
            <Grid>
              <NumInput
                money
                label="Tambahan biaya per bulan"
                hint="Misal gaji 2 engineer baru"
                value={d.skenario.tambahanBiaya}
                onChange={(n) => ubahSk({ tambahanBiaya: n })}
              />
              <NumInput
                label="Mulai bulan ke-"
                digits={0}
                value={d.skenario.mulaiBulan}
                onChange={(n) => ubahSk({ mulaiBulan: Math.round(n) })}
                min={1}
                max={BATAS_BULAN}
              />
              <NumInput
                money
                label="Pendanaan masuk"
                value={d.skenario.suntikanDana}
                onChange={(n) => ubahSk({ suntikanDana: n })}
              />
              <NumInput
                label="Dana masuk di bulan ke-"
                digits={0}
                value={d.skenario.bulanDana}
                onChange={(n) => ubahSk({ bulanDana: Math.round(n) })}
                min={1}
                max={BATAS_BULAN}
              />
            </Grid>
          ) : (
            <Note>Nyalakan untuk membandingkan dua kemungkinan di grafik.</Note>
          )}
        </Card>
        <Note>
          Hitungan ini perkiraan sederhana: pemasukan dan pengeluaran dianggap tumbuh tetap tiap bulan. Pakai sebagai
          bahan diskusi, bukan laporan keuangan resmi.
        </Note>
      </Split>
    </ToolShell>
  );
}
