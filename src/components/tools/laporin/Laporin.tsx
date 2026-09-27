"use client";

import { useMemo, useState } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { perubahan, runwayBulan, susunTeks, type DataLaporan, type Metrik } from "@/lib/tools/laporin/calc";
import { nf, tanggalLokal } from "@/lib/tools/format";
import {
  Badge,
  Button,
  Card,
  DateInput,
  Grid,
  kitStyles as k,
  Note,
  NumInput,
  RemoveBtn,
  Select,
  Split,
  StdActions,
  TextArea,
  TextInput,
  ToolShell,
} from "@/components/tools/kit/Kit";
import l from "./laporin.module.css";

const bulanIni = () => tanggalLokal().slice(0, 7);

const metrikBaru = (nama = ""): Metrik => ({ nama, ini: 0, lalu: 0, satuan: "angka" });

const AWAL: DataLaporan = {
  nama: "",
  bulan: "",
  ringkasan: "",
  metrik: [
    { nama: "Pendapatan bulanan", ini: 0, lalu: 0, satuan: "rp" },
    metrikBaru("Pengguna aktif"),
  ],
  capaian: "",
  tantangan: "",
  rencana: "",
  bantuan: "",
  kas: 0,
  burn: 0,
  penutup: "Terima kasih atas dukungannya. Balas email ini kalau ada pertanyaan.",
};

const contoh = (): DataLaporan => ({
  nama: "KasirKu",
  bulan: bulanIni(),
  ringkasan: "Bulan ini pendapatan naik 20% dan kami menutup kerja sama pertama dengan pemasok biji kopi.",
  metrik: [
    { nama: "Pendapatan bulanan", ini: 24_000_000, lalu: 20_000_000, satuan: "rp" },
    { nama: "Warung aktif", ini: 420, lalu: 356, satuan: "angka" },
    { nama: "Churn bulanan", ini: 4.2, lalu: 5.1, satuan: "persen" },
  ],
  capaian: "Rilis laporan untung otomatis via WhatsApp\nKerja sama dengan 1 pemasok biji kopi\nRekrut 1 engineer",
  tantangan: "Biaya iklan naik 15%, sedang uji saluran komunitas",
  rencana: "Tembus 500 warung aktif\nUji paket tahunan",
  bantuan: "Intro ke jaringan pemasok bahan makanan\nKenalan dengan investor pre-seed bidang UMKM",
  kas: 450_000_000,
  burn: 55_000_000,
  penutup: "Terima kasih atas dukungannya. Balas email ini kalau ada pertanyaan.",
});

export default function Laporin() {
  const [d, setD, reset] = useToolState<DataLaporan>("laporin", "draft-v1", AWAL);
  const [salin, setSalin] = useState<"" | "ok" | "gagal">("");
  const ubah = (p: Partial<DataLaporan>) => setD((x) => ({ ...x, ...p }));
  const ubahM = (i: number, p: Partial<Metrik>) => setD((x) => ({ ...x, metrik: x.metrik.map((m, j) => (j === i ? { ...m, ...p } : m)) }));
  const teks = useMemo(() => susunTeks(d), [d]);
  const runway = runwayBulan(d.kas, d.burn);

  const salinTeks = async () => {
    try {
      await navigator.clipboard.writeText(teks);
      setSalin("ok");
    } catch {
      setSalin("gagal");
    }
    setTimeout(() => setSalin(""), 2500);
  };

  return (
    <ToolShell
      eyebrow="Founderku Tools · Pendanaan"
      title="Laporin"
      desc="Susun laporan bulanan untuk investor dan mentor: metrik, capaian, tantangan, dan bantuan yang dibutuhkan. Hasilnya teks rapi siap disalin ke email."
      actions={<StdActions onContoh={() => reset(contoh())} onReset={() => reset()} />}
      printHead={false}
    >
      <Split
        aside={
          <Card
            title="Pratinjau email"
            right={
              <span className="no-print">
                <Button small variant="solid" onClick={salinTeks}>
                  {salin === "ok" ? "Tersalin" : "Salin teks"}
                </Button>
              </span>
            }
          >
            <pre className={l.email}>{teks}</pre>
            {salin === "gagal" && <Note>Browser menolak menyalin otomatis. Blok teks di atas lalu salin manual.</Note>}
          </Card>
        }
      >
        {/* Saat dicetak, yang tercetak cuma pratinjau email */}
        <div className="no-print" style={{ display: "contents" }}>
        <Card title="Info laporan">
          <Grid>
            <TextInput label="Nama startup" value={d.nama} maxLength={40} onChange={(v) => ubah({ nama: v })} />
            <DateInput label="Bulan" type="month" value={d.bulan} onChange={(v) => ubah({ bulan: v })} />
          </Grid>
          <div style={{ height: 12 }} />
          <TextArea label="Ringkasan singkat (1 sampai 2 kalimat)" rows={2} maxLength={400} value={d.ringkasan} onChange={(v) => ubah({ ringkasan: v })} />
        </Card>

        <Card title="Metrik utama" hint="Bandingkan dengan bulan lalu. Pakai metrik yang sama tiap bulan supaya konsisten.">
          <div className={k.rows}>
            {d.metrik.map((m, i) => {
              const p = perubahan(m.ini, m.lalu);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
                    <div style={{ flex: 1 }}>
                      <TextInput label={`Metrik ${i + 1}`} value={m.nama} maxLength={50} onChange={(v) => ubahM(i, { nama: v })} />
                    </div>
                    <RemoveBtn label={`Hapus ${m.nama || "metrik"}`} onClick={() => setD((x) => ({ ...x, metrik: x.metrik.filter((_, j) => j !== i) }))} />
                  </div>
                  <Grid cols={3}>
                    <Select<Metrik["satuan"]>
                      label="Satuan"
                      value={m.satuan}
                      onChange={(v) => ubahM(i, { satuan: v })}
                      options={[
                        { v: "angka", label: "Angka" },
                        { v: "rp", label: "Rupiah" },
                        { v: "persen", label: "Persen" },
                      ]}
                    />
                    <NumInput label="Bulan ini" money={m.satuan === "rp"} digits={m.satuan === "persen" ? 1 : 0} value={m.ini} onChange={(n) => ubahM(i, { ini: n })} />
                    <NumInput label="Bulan lalu" money={m.satuan === "rp"} digits={m.satuan === "persen" ? 1 : 0} value={m.lalu} onChange={(n) => ubahM(i, { lalu: n })} />
                  </Grid>
                  {p !== null && (
                    <div>
                      {/* Netral: naik belum tentu bagus (misal churn), turun belum tentu buruk */}
                      <Badge tone="neutral" text={`${p >= 0 ? "+" : ""}${nf(p, 1)}% dari bulan lalu`} />
                    </div>
                  )}
                </div>
              );
            })}
            {d.metrik.length < 8 && (
              <div className={`${k.addBtn} no-print`}>
                <Button small onClick={() => setD((x) => ({ ...x, metrik: [...x.metrik, metrikBaru()] }))}>
                  + Tambah metrik
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card title="Kas & runway">
          <Grid>
            <NumInput money label="Kas sekarang" value={d.kas} onChange={(n) => ubah({ kas: n })} />
            <NumInput money label="Burn rate per bulan" value={d.burn} onChange={(n) => ubah({ burn: n })} />
          </Grid>
          {runway !== null && (
            <>
              <div style={{ height: 10 }} />
              <Note>Runway sekitar {nf(runway, 1)} bulan. Hitung lebih detail di Runwayin.</Note>
            </>
          )}
        </Card>

        <Card title="Cerita bulan ini" hint="Satu poin per baris. Jujur soal tantangan justru bikin investor lebih percaya.">
          <div className={k.rows}>
            <TextArea label="Capaian" rows={3} maxLength={800} value={d.capaian} onChange={(v) => ubah({ capaian: v })} />
            <TextArea label="Tantangan" rows={3} maxLength={800} value={d.tantangan} onChange={(v) => ubah({ tantangan: v })} />
            <TextArea label="Rencana bulan depan" rows={3} maxLength={800} value={d.rencana} onChange={(v) => ubah({ rencana: v })} />
            <TextArea
              label="Butuh bantuan (paling sering dibaca investor)"
              hint="Minta hal spesifik: intro ke orang tertentu, saran rekrutmen, dll."
              rows={3}
              maxLength={800}
              value={d.bantuan}
              onChange={(v) => ubah({ bantuan: v })}
            />
            <TextArea label="Penutup" rows={2} maxLength={300} value={d.penutup} onChange={(v) => ubah({ penutup: v })} />
          </div>
        </Card>
        </div>
      </Split>
    </ToolShell>
  );
}
