"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { hitungHarga, type InputHarga } from "@/lib/tools/hargain/calc";
import { nf, pct, rp } from "@/lib/tools/format";
import {
  Card,
  Grid,
  kitStyles as k,
  Note,
  NumInput,
  Split,
  Stat,
  StdActions,
  TextArea,
  TextInput,
  Toggle,
  ToolShell,
  Verdict,
} from "@/components/tools/kit/Kit";
import h from "./hargain.module.css";

interface Paket {
  nama: string;
  harga: number;
  fitur: string;
  unggulan: boolean;
}

interface DataHarga extends InputHarga {
  paket: Paket[];
}

const AWAL: DataHarga = {
  biayaVariabel: 0,
  biayaTetap: 0,
  targetMargin: 70,
  nilaiPelanggan: 0,
  kompetitorMin: 0,
  kompetitorMax: 0,
  harga: 0,
  paket: [
    { nama: "Dasar", harga: 0, fitur: "", unggulan: false },
    { nama: "Pro", harga: 0, fitur: "", unggulan: true },
    { nama: "Bisnis", harga: 0, fitur: "", unggulan: false },
  ],
};

const CONTOH: DataHarga = {
  biayaVariabel: 15_000,
  biayaTetap: 40_000_000,
  targetMargin: 75,
  nilaiPelanggan: 600_000,
  kompetitorMin: 79_000,
  kompetitorMax: 199_000,
  harga: 99_000,
  paket: [
    { nama: "Dasar", harga: 49_000, fitur: "1 outlet\nCatat transaksi\nLaporan harian", unggulan: false },
    { nama: "Pro", harga: 99_000, fitur: "Semua fitur Dasar\nLaporan untung via WhatsApp\nPengingat stok", unggulan: true },
    { nama: "Bisnis", harga: 249_000, fitur: "Semua fitur Pro\nSampai 5 outlet\nDukungan prioritas", unggulan: false },
  ],
};

const POSISI = {
  rugi: { tone: "bad" as const, judul: "Harga di bawah biaya", isi: "Tiap pelanggan justru menambah rugi. Naikkan harga atau tekan biaya per pelanggan." },
  murah: { tone: "warn" as const, judul: "Lebih murah dari kompetitor", isi: "Bisa menarik pelanggan awal, tapi hati-hati: harga murah sulit dinaikkan nanti dan bisa terkesan kurang berkualitas." },
  mahal: { tone: "warn" as const, judul: "Lebih mahal dari kompetitor", isi: "Boleh, asalkan pembeda produkmu jelas terlihat dan nilai yang didapat pelanggan memang lebih besar." },
  wajar: { tone: "good" as const, judul: "Harga masuk kisaran pasar", isi: "Posisi aman. Uji dengan beberapa pelanggan pertama dan lihat seberapa cepat mereka setuju." },
};

export default function Hargain() {
  const [d, setD, reset] = useToolState<DataHarga>("hargain", "draft-v1", AWAL);
  const ubah = (p: Partial<DataHarga>) => setD((x) => ({ ...x, ...p }));
  const ubahP = (i: number, p: Partial<Paket>) => setD((x) => ({ ...x, paket: x.paket.map((q, j) => (j === i ? { ...q, ...p } : q)) }));
  const r = useMemo(() => hitungHarga(d), [d]);
  const v = r.posisi ? POSISI[r.posisi] : null;

  return (
    <ToolShell
      eyebrow="Founderku Tools · Keuangan Startup"
      title="Hargain"
      desc="Tentukan harga langganan dari tiga sisi: biaya, nilai buat pelanggan, dan harga kompetitor. Lalu susun paket harga dan lihat berapa pelanggan untuk balik modal."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card title="Kisaran harga">
              <div className={k.rows}>
                <Stat label="Minimal (dari biaya)" value={r.hargaMinimal !== null ? rp(r.hargaMinimal) : "-"} sub={`Supaya margin ${nf(d.targetMargin)}% tercapai`} />
                <Stat
                  label="Dari nilai buat pelanggan"
                  value={r.nilaiBawah !== null && r.nilaiAtas !== null ? `${rp(r.nilaiBawah)} - ${rp(r.nilaiAtas)}` : "-"}
                  sub="10 sampai 30% dari nilai yang dia dapat"
                />
                <Stat
                label="Kompetitor"
                  value={d.kompetitorMin > 0 || d.kompetitorMax > 0 ? `${rp(d.kompetitorMin)} - ${rp(d.kompetitorMax)}` : "-"}
                />
              </div>
            </Card>
            <Card title="Di harga pilihanmu">
              <Grid keep>
                <Stat label="Margin kotor" value={r.margin !== null ? pct(r.margin) : "-"} tone={r.margin === null ? "neutral" : r.margin >= 60 ? "good" : r.margin > 0 ? "warn" : "bad"} />
                <Stat label="Balik modal di" value={r.titikImpas !== null ? `${nf(r.titikImpas)} pelanggan` : "-"} sub="Supaya biaya tetap tertutup" />
              </Grid>
            </Card>
            {v && (
              <Verdict tone={v.tone} title={v.judul}>
                <p>{v.isi}</p>
              </Verdict>
            )}
          </>
        }
      >
        <Card title="1. Biaya" hint="Harga minimal supaya tiap pelanggan menguntungkan.">
          <Grid>
            <NumInput money label="Biaya per pelanggan per bulan" hint="Server, komisi pembayaran, layanan" value={d.biayaVariabel} onChange={(n) => ubah({ biayaVariabel: n })} />
            <NumInput label="Target margin kotor" suffix="%" value={d.targetMargin} min={0} max={95} onChange={(n) => ubah({ targetMargin: n })} />
            <NumInput money label="Biaya tetap per bulan" hint="Gaji, sewa, software" value={d.biayaTetap} onChange={(n) => ubah({ biayaTetap: n })} />
          </Grid>
        </Card>
        <Card title="2. Nilai buat pelanggan" hint="Berapa uang atau waktu (dirupiahkan) yang dihemat atau didapat pelanggan tiap bulan berkat produkmu.">
          <NumInput money label="Nilai per pelanggan per bulan" value={d.nilaiPelanggan} onChange={(n) => ubah({ nilaiPelanggan: n })} />
        </Card>
        <Card title="3. Harga kompetitor">
          <Grid>
            <NumInput money label="Termurah" value={d.kompetitorMin} onChange={(n) => ubah({ kompetitorMin: n })} />
            <NumInput money label="Termahal" value={d.kompetitorMax} onChange={(n) => ubah({ kompetitorMax: n })} />
          </Grid>
        </Card>
        <Card title="4. Harga pilihanmu">
          <NumInput money label="Harga per bulan (paket utama)" value={d.harga} onChange={(n) => ubah({ harga: n })} />
        </Card>
        <Card title="Paket harga" hint="Tiga paket membantu pelanggan memilih. Paket tengah biasanya paling laku.">
          <div className={k.rows}>
            {d.paket.map((p, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
                <Grid keep>
                  <TextInput label={`Nama paket ${i + 1}`} value={p.nama} maxLength={24} onChange={(t) => ubahP(i, { nama: t })} />
                  <NumInput money label="Harga per bulan" value={p.harga} onChange={(n) => ubahP(i, { harga: n })} />
                </Grid>
                <TextArea label="Isi paket (satu per baris)" rows={3} maxLength={400} value={p.fitur} onChange={(t) => ubahP(i, { fitur: t })} />
                <Toggle label="Tandai paling laku" checked={p.unggulan} onChange={(on) => setD((x) => ({ ...x, paket: x.paket.map((q, j) => ({ ...q, unggulan: j === i ? on : false })) }))} />
              </div>
            ))}
          </div>
        </Card>
        {d.paket.some((p) => p.harga > 0) && (
          <Card title="Pratinjau tabel harga">
            <div className={h.tabel}>
              {d.paket.map((p, i) => (
                <div key={i} className={`${h.paket} ${p.unggulan ? h.unggul : ""}`}>
                  {p.unggulan && <span className={h.label}>Paling laku</span>}
                  <b className={h.nama}>{p.nama || `Paket ${i + 1}`}</b>
                  <div className={h.harga}>
                    {rp(p.harga)}
                    <small>/bulan</small>
                  </div>
                  <ul>
                    {p.fitur
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .map((x, j) => (
                        <li key={j}>{x}</li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        )}
        <Note>
          Aturan praktis: harga berbasis nilai (10 sampai 30% dari manfaat yang dirasakan pelanggan) biasanya lebih sehat
          daripada sekadar lebih murah dari kompetitor.
        </Note>
      </Split>
    </ToolShell>
  );
}
