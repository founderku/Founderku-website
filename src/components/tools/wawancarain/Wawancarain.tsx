"use client";

import { useMemo, useState } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { rangkum, TARGET_WAWANCARA, type Bayar, type Responden } from "@/lib/tools/wawancarain/calc";
import { nf, pct, tanggalLokal } from "@/lib/tools/format";
import {
  Button,
  Card,
  DateInput,
  Grid,
  kitStyles as k,
  Meter,
  Note,
  RemoveBtn,
  Scale,
  Select,
  Split,
  Stat,
  StdActions,
  Tabs,
  TextArea,
  TextInput,
  Toggle,
  ToolShell,
  Verdict,
} from "@/components/tools/kit/Kit";

interface DataWawancara {
  hipotesis: string;
  target: string;
  pertanyaan: string;
  responden: Responden[];
}

const PERTANYAAN_AWAL = [
  "Ceritakan tentang pekerjaan atau usahamu sehari-hari.",
  "Kapan terakhir kali kamu mengalami masalah ini? Ceritakan kejadiannya.",
  "Apa bagian yang paling menyusahkan dari itu?",
  "Seberapa sering itu terjadi?",
  "Apa yang sudah kamu coba untuk mengatasinya?",
  "Berapa uang atau waktu yang habis untuk itu?",
  "Apa yang kurang dari cara yang sekarang?",
  "Siapa lagi yang sebaiknya saya ajak ngobrol soal ini?",
  "Boleh saya kabari kalau ada versi percobaannya?",
].join("\n");

const HINDARI = [
  "\"Menurutmu ide saya bagus nggak?\" (orang cenderung sopan, jawabannya tidak jujur)",
  "\"Kamu mau beli nggak kalau ada?\" (janji di masa depan jarang ditepati)",
  "\"Fitur apa yang kamu mau?\" (tanyakan masalahnya, bukan solusinya)",
];

const kosong = (): Responden => ({
  nama: "",
  tanggal: tanggalLokal(),
  segmen: "",
  sakit: 0,
  sudahCari: false,
  bayar: "",
  kutipan: "",
  catatan: "",
});

const AWAL: DataWawancara = { hipotesis: "", target: "", pertanyaan: PERTANYAAN_AWAL, responden: [] };

const contohR = (nama: string, seg: string, sakit: number, cari: boolean, bayar: Bayar, kutipan: string): Responden => ({
  nama,
  tanggal: "2026-09-20",
  segmen: seg,
  sakit,
  sudahCari: cari,
  bayar,
  kutipan,
  catatan: "",
});

const CONTOH: DataWawancara = {
  hipotesis: "Pemilik warung kopi kesulitan tahu untung harian karena pencatatan masih manual.",
  target: "Pemilik warung kopi dengan 1 sampai 3 karyawan di Jakarta dan Bandung",
  pertanyaan: PERTANYAAN_AWAL,
  responden: [
    contohR("Bu Sari", "Warung kopi", 5, true, "ya", "Tiap malam saya hitung manual, sering selisih."),
    contohR("Pak Andi", "Kedai kopi", 4, true, "mungkin", "Pernah coba aplikasi kasir, tapi ribet."),
    contohR("Mbak Dewi", "Warung makan", 3, false, "tidak", "Saya pakai feeling saja."),
    contohR("Mas Rudi", "Kedai kopi", 5, true, "ya", "Saya bayar orang untuk rekap tiap minggu."),
    contohR("Bu Lina", "Warung kopi", 4, false, "mungkin", "Pengen tahu menu mana yang paling untung."),
  ],
};

type Tab = "skrip" | "catatan";

export default function Wawancarain() {
  const [d, setD, reset] = useToolState<DataWawancara>("wawancarain", "draft-v1", AWAL);
  const [tab, setTab] = useState<Tab>("skrip");
  const [buka, setBuka] = useState<number | null>(null);
  const h = useMemo(() => rangkum(d.responden), [d.responden]);
  const ubahR = (i: number, p: Partial<Responden>) =>
    setD((x) => ({ ...x, responden: x.responden.map((r, j) => (j === i ? { ...r, ...p } : r)) }));
  const kutipan = d.responden.filter((r) => r.kutipan.trim());

  return (
    <ToolShell
      eyebrow="Founderku Tools · Validasi & Riset"
      title="Wawancarain"
      desc="Panduan wawancara calon pelanggan: daftar pertanyaan yang tidak menggiring, catatan tiap responden, dan rangkuman otomatis apakah masalahnya benar-benar ada."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: "skrip", label: "Skrip wawancara" },
          { id: "catatan", label: `Catatan responden (${d.responden.length})` },
        ]}
      />
      <Split
        aside={
          <>
            <Card>
              <Stat big label="Responden" value={`${h.jumlah}/${TARGET_WAWANCARA}`} sub="Target minimal 10 orang" />
              <div style={{ height: 10 }} />
              <Meter value={(h.jumlah / TARGET_WAWANCARA) * 100} label="Progres wawancara" />
              <div style={{ height: 14 }} />
              <Grid keep>
                <Stat label="Rata-rata sakitnya" value={h.rataSakit !== null ? `${nf(h.rataSakit, 1)}/5` : "-"} />
                <Stat label="Sudah cari solusi" value={h.pctSudahCari !== null ? pct(h.pctSudahCari, 0) : "-"} />
                <Stat label="Mau bayar" value={h.pctMauBayar !== null ? pct(h.pctMauBayar, 0) : "-"} />
                <Stat label="Mungkin bayar" value={h.pctMungkin !== null ? pct(h.pctMungkin, 0) : "-"} />
              </Grid>
            </Card>
            {h.jumlah > 0 && (
              <Verdict
                tone={h.status === "kuat" ? "good" : h.status === "lemah" ? "bad" : "warn"}
                title={
                  h.status === "kuat"
                    ? "Masalahnya nyata"
                    : h.status === "lemah"
                      ? "Masalahnya belum terasa"
                      : h.status === "belum"
                        ? "Sinyal masih campur"
                        : `Lanjutkan sampai ${TARGET_WAWANCARA} orang`
                }
              >
                <p>
                  {h.status === "kuat"
                    ? "Banyak yang merasakan masalahnya dan mau bayar. Saatnya bikin MVP sederhana dan tawarkan ke responden yang bilang mau bayar."
                    : h.status === "lemah"
                      ? "Sebagian besar responden tidak terlalu terganggu. Coba ganti segmen pelanggan atau gali masalah lain yang lebih menyakitkan."
                      : h.status === "belum"
                        ? "Ada yang tertarik, tapi belum kuat. Persempit ke segmen yang skor sakitnya paling tinggi."
                        : "Belum cukup data untuk menyimpulkan. Pola biasanya baru terlihat setelah 10 wawancara."}
                </p>
              </Verdict>
            )}
            {kutipan.length > 0 && (
              <Card title="Kutipan penting">
                <div className={k.rows}>
                  {kutipan.slice(0, 8).map((r, i) => (
                    <p key={i} style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--soft)" }}>
                      &ldquo;{r.kutipan.trim()}&rdquo;
                      <br />
                      <span style={{ fontSize: 12.5, color: "var(--faint)" }}>
                        {r.nama || "Responden"}
                        {r.segmen ? `, ${r.segmen}` : ""}
                      </span>
                    </p>
                  ))}
                </div>
              </Card>
            )}
          </>
        }
      >
        {tab === "skrip" ? (
          <>
            <Card title="Yang ingin kamu buktikan">
              <TextArea
                label="Hipotesis masalah"
                placeholder="Misal: pemilik warung kopi kesulitan tahu untung harian"
                rows={2}
                maxLength={300}
                value={d.hipotesis}
                onChange={(v) => setD((x) => ({ ...x, hipotesis: v }))}
              />
              <div style={{ height: 12 }} />
              <TextInput label="Siapa yang diwawancara" value={d.target} maxLength={160} onChange={(v) => setD((x) => ({ ...x, target: v }))} />
            </Card>
            <Card title="Daftar pertanyaan" hint="Satu pertanyaan per baris. Fokus ke pengalaman nyata di masa lalu, bukan pendapat.">
              <TextArea label="Pertanyaan" rows={11} maxLength={2000} value={d.pertanyaan} onChange={(v) => setD((x) => ({ ...x, pertanyaan: v }))} />
            </Card>
            <Card tone="soft" title="Pertanyaan yang sebaiknya dihindari">
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: "var(--soft)" }}>
                {HINDARI.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>
          </>
        ) : (
          <Card title="Catatan tiap responden" hint="Isi segera setelah wawancara selagi masih ingat.">
            <div className={k.rows}>
              {d.responden.map((r, i) => {
                const terbuka = buka === i;
                return (
                  <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setBuka(terbuka ? null : i)}
                        aria-expanded={terbuka}
                        style={{ background: "none", border: 0, padding: "8px 0", minHeight: 44, textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", flex: 1, fontSize: 15, fontWeight: 500 }}
                      >
                        {i + 1}. {r.nama || "Responden baru"}
                        {(r.sakit > 0 || r.bayar) && (
                          <span style={{ display: "block", color: "var(--faint)", fontWeight: 400, fontSize: 13, marginTop: 2 }}>
                            {[
                              r.sakit ? `Sakit ${r.sakit}/5` : "",
                              r.bayar === "ya" ? "Mau bayar" : r.bayar === "mungkin" ? "Mungkin bayar" : r.bayar === "tidak" ? "Tidak mau bayar" : "",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        )}
                      </button>
                      <RemoveBtn
                        label={`Hapus ${r.nama || "responden"}`}
                        onClick={() => setD((x) => ({ ...x, responden: x.responden.filter((_, j) => j !== i) }))}
                      />
                    </div>
                    {terbuka && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                        <Grid>
                          <TextInput label="Nama / inisial" value={r.nama} maxLength={60} onChange={(v) => ubahR(i, { nama: v })} />
                          <DateInput label="Tanggal" value={r.tanggal} onChange={(v) => ubahR(i, { tanggal: v })} />
                        </Grid>
                        <TextInput label="Segmen" placeholder="Misal: warung kopi" value={r.segmen} maxLength={60} onChange={(v) => ubahR(i, { segmen: v })} />
                        <Scale label="Seberapa menyakitkan masalahnya buat dia?" kiri="Biasa saja" kanan="Sangat" value={r.sakit} onChange={(n) => ubahR(i, { sakit: n })} />
                        <Toggle label="Sudah pernah mencoba solusi lain / keluar uang" checked={r.sudahCari} onChange={(v) => ubahR(i, { sudahCari: v })} />
                        <Select<Bayar>
                          label="Mau bayar untuk solusinya?"
                          value={r.bayar}
                          onChange={(v) => ubahR(i, { bayar: v })}
                          options={[
                            { v: "", label: "Belum ditanyakan" },
                            { v: "ya", label: "Ya, mau pre-order" },
                            { v: "mungkin", label: "Mungkin" },
                            { v: "tidak", label: "Tidak" },
                          ]}
                        />
                        <TextArea label="Kutipan penting (kata-kata dia sendiri)" rows={2} maxLength={300} value={r.kutipan} onChange={(v) => ubahR(i, { kutipan: v })} />
                        <TextArea label="Catatan lain" rows={2} maxLength={800} value={r.catatan} onChange={(v) => ubahR(i, { catatan: v })} />
                      </div>
                    )}
                  </div>
                );
              })}
              {d.responden.length < 60 && (
                <div className={`${k.addBtn} no-print`}>
                  <Button
                    small
                    onClick={() => {
                      setD((x) => ({ ...x, responden: [...x.responden, kosong()] }));
                      setBuka(d.responden.length);
                    }}
                  >
                    + Tambah responden
                  </Button>
                </div>
              )}
              {d.responden.length === 0 && <Note>Belum ada catatan. Tambah responden setelah wawancara pertama.</Note>}
            </div>
          </Card>
        )}
      </Split>
    </ToolShell>
  );
}
