"use client";

import { useState } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import {
  JENIS,
  KATEGORI_RAB,
  aturBulan,
  cekKelengkapan,
  hitungKata,
  hitungRab,
  subtotal,
  type BarisRab,
  type Isian,
  type Jenis,
  type KategoriRab,
  type Kegiatan,
} from "@/lib/tools/proposalin/calc";
import { nf, pct, rp } from "@/lib/tools/format";
import {
  Badge,
  Button,
  Card,
  Grid,
  Meter,
  Note,
  NumInput,
  RemoveBtn,
  Select,
  Split,
  Stat,
  StdActions,
  Tabs,
  TextArea,
  TextInput,
  ToolShell,
  kitStyles as k,
} from "@/components/tools/kit/Kit";
import p from "./proposalin.module.css";

type DataProposal = Isian & { jenis: Jenis };
type Tab = "isi" | "pratinjau";

const MAKS_RAB = 30;
const MAKS_KEGIATAN = 15;

const barisKosong = (): BarisRab => ({ kategori: "Bahan habis pakai", uraian: "", volume: 0, satuan: "", harga: 0 });

const AWAL: DataProposal = {
  jenis: "pkmk",
  judul: "",
  tim: "",
  kampus: "",
  pembimbing: "",
  tahun: "",
  isi: {},
  rab: [barisKosong()],
  bulanN: 4,
  jadwal: [{ nama: "", bulan: [false, false, false, false] }],
};

const CONTOH: DataProposal = {
  jenis: "pkmk",
  judul: "Keripik Tempe Daun Jeruk: Camilan Sehat Berbahan Tempe Lokal untuk Mahasiswa",
  tim: "Rina Lestari (ketua), Dimas Pratama, Sari Wulandari",
  kampus: "Universitas Contoh",
  pembimbing: "Dr. Budi Santoso, S.E., M.M.",
  tahun: "2026",
  isi: {
    latar:
      "Mahasiswa membutuhkan camilan yang murah dan mengenyangkan saat belajar, tetapi pilihan yang tersedia di sekitar kampus didominasi makanan ringan pabrikan dengan kandungan gizi rendah.\n\nDi sisi lain, pengrajin tempe di sekitar kampus kesulitan menjual produk karena tempe mentah cepat basi. Mengolah tempe menjadi keripik memperpanjang masa simpan hingga dua bulan dan menambah nilai jual.",
    tujuan:
      "Tujuan kegiatan ini adalah memproduksi dan memasarkan keripik tempe daun jeruk dengan target penjualan 1.500 bungkus selama empat bulan.\n\nManfaatnya: mahasiswa mendapat camilan bergizi dengan harga terjangkau, pengrajin tempe mitra mendapat pembeli tetap, dan tim mendapat pengalaman menjalankan usaha.",
    gambaran:
      "Produk berupa keripik tempe tipis dengan bumbu daun jeruk, dikemas 100 gram dalam standing pouch. Harga jual Rp 12.000 per bungkus. Pelanggan utama adalah mahasiswa dan karyawan muda di sekitar kampus.",
    pasar:
      "Terdapat sekitar 12.000 mahasiswa di kampus dan sekitarnya. Pesaing utama adalah keripik pabrikan di minimarket. Keunggulan kami: rasa daun jeruk yang jarang ditemui, bahan lokal, dan harga lebih murah untuk ukuran yang sama.",
    keuangan:
      "Biaya produksi sekitar Rp 6.500 per bungkus dengan harga jual Rp 12.000, sehingga untung kotor Rp 5.500 per bungkus. Titik impas tercapai setelah penjualan sekitar 900 bungkus.",
    metode:
      "Tahap 1 (bulan 1): persiapan, uji resep, dan pengurusan izin PIRT.\n\nTahap 2 (bulan 1 sampai 4): produksi rutin 3 kali seminggu bersama pengrajin mitra.\n\nTahap 3 (bulan 2 sampai 4): pemasaran lewat booth kampus, titip jual di kantin, dan media sosial.\n\nTahap 4 (bulan 4): evaluasi penjualan dan penyusunan laporan.",
    pustaka: "Badan Pusat Statistik. 2025. Statistik Pendidikan Tinggi.\nKementerian Kesehatan RI. 2024. Tabel Komposisi Pangan Indonesia.",
  },
  rab: [
    { kategori: "Bahan habis pakai", uraian: "Tempe", volume: 150, satuan: "papan", harga: 8000 },
    { kategori: "Bahan habis pakai", uraian: "Minyak goreng", volume: 40, satuan: "liter", harga: 18000 },
    { kategori: "Bahan habis pakai", uraian: "Kemasan standing pouch", volume: 1500, satuan: "pcs", harga: 1200 },
    { kategori: "Peralatan penunjang", uraian: "Spinner peniris minyak", volume: 1, satuan: "unit", harga: 1250000 },
    { kategori: "Peralatan penunjang", uraian: "Sealer kemasan", volume: 1, satuan: "unit", harga: 450000 },
    { kategori: "Sewa dan jasa", uraian: "Pengurusan izin PIRT", volume: 1, satuan: "paket", harga: 500000 },
    { kategori: "Promosi", uraian: "Cetak stiker dan banner", volume: 1, satuan: "paket", harga: 400000 },
    { kategori: "Transportasi", uraian: "Belanja bahan dan distribusi", volume: 16, satuan: "minggu", harga: 50000 },
  ],
  bulanN: 4,
  jadwal: [
    { nama: "Persiapan, uji resep, dan izin PIRT", bulan: [true, false, false, false] },
    { nama: "Produksi rutin", bulan: [true, true, true, true] },
    { nama: "Pemasaran dan penjualan", bulan: [false, true, true, true] },
    { nama: "Evaluasi dan laporan", bulan: [false, false, false, true] },
  ],
};

// Paragraf dipisah baris kosong
const paragraf = (t: string) =>
  (t || "")
    .split(/\n\s*\n/)
    .map((x) => x.trim())
    .filter(Boolean);

export default function Proposalin() {
  const [d, setD, reset] = useToolState<DataProposal>("proposalin", "draft-v1", AWAL);
  const [tab, setTab] = useState<Tab>("isi");
  const jenis: Jenis = d.jenis in JENIS ? d.jenis : "pkmk";
  const info = JENIS[jenis];
  const rab = Array.isArray(d.rab) ? d.rab : [];
  const jadwal = Array.isArray(d.jadwal) ? d.jadwal : [];
  const bulanN = Math.min(12, Math.max(1, Math.round(d.bulanN || 4)));
  const isi = d.isi || {};
  const aman: DataProposal = { ...d, jenis, rab, jadwal, bulanN, isi };
  const hasilRab = hitungRab(rab);
  const leng = cekKelengkapan(jenis, aman);
  const totalKata = info.bagian.reduce((a, b) => a + hitungKata(isi[b.id] || ""), 0);

  const ubahRab = (i: number, v: Partial<BarisRab>) => setD((x) => ({ ...x, rab: x.rab.map((r, j) => (j === i ? { ...r, ...v } : r)) }));
  const ubahKeg = (i: number, v: Partial<Kegiatan>) =>
    setD((x) => ({ ...x, jadwal: x.jadwal.map((r, j) => (j === i ? { ...r, ...v } : r)) }));

  return (
    <ToolShell
      eyebrow="Founderku Tools · Mahasiswa & Karier"
      title="Proposalin"
      desc="Susun proposal usaha untuk PKM-K, P2MW, atau lomba business plan. Ada pertanyaan panduan di tiap bagian, RAB yang menghitung sendiri, dan jadwal kegiatan. Hasilnya bisa dicetak jadi PDF."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
      printHead={false}
    >
      <div className="no-print">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { id: "isi", label: "Isi proposal" },
            { id: "pratinjau", label: "Pratinjau dokumen" },
          ]}
        />
      </div>

      {tab === "isi" && (
        <div className="no-print">
          <Split
            aside={
              <>
                <Card>
                  <Stat big label="Kelengkapan" value={`${leng.ok}/${leng.total}`} sub={`${nf(totalKata)} kata ditulis`} />
                  <div style={{ height: 12 }} />
                  <Meter value={leng.persen} label="Kelengkapan proposal" />
                  <ul className={p.cek}>
                    {leng.daftar.map((x) => (
                      <li key={x.label}>
                        <Badge tone={x.ok ? "good" : "neutral"} text={x.ok ? "Ada" : "Belum"} />
                        <span>{x.label}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card title="Ringkasan RAB">
                  <Stat label="Total anggaran" value={rp(hasilRab.total)} />
                  {hasilRab.per.length > 0 && (
                    <div className={k.tableWrap} style={{ marginTop: 12 }}>
                      <table className={k.table}>
                        <thead>
                          <tr>
                            <th>Kategori</th>
                            <th>Jumlah</th>
                            <th>%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hasilRab.per.map((x) => (
                            <tr key={x.kategori}>
                              <td>{x.kategori}</td>
                              <td>{rp(x.jumlah)}</td>
                              <td>{pct(x.persen)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ height: 10 }} />
                  <Note>Program pendanaan biasanya membatasi total dana dan persentase tiap kategori. Cocokkan dengan pedoman terbaru.</Note>
                </Card>
                <Card tone="soft" title="Butuh bahan isian?">
                  <Note>
                    Model bisnis: <a href="/tools/kanvasin">Kanvasin</a>. Ukuran pasar: <a href="/tools/pasarin">Pasarin</a>. Harga jual dan
                    untung per produk: <a href="/tools/hargain">Hargain</a>.
                  </Note>
                </Card>
              </>
            }
          >
            <Card title="Jenis proposal">
              <Select<Jenis>
                label="Untuk apa proposal ini?"
                value={jenis}
                onChange={(v) => setD((x) => ({ ...x, jenis: v }))}
                options={(Object.keys(JENIS) as Jenis[]).map((v) => ({ v, label: JENIS[v].label }))}
              />
              <div style={{ height: 10 }} />
              <Note>{info.catatan}</Note>
            </Card>

            <Card title="Identitas">
              <TextInput label="Judul proposal" value={d.judul} maxLength={200} onChange={(v) => setD((x) => ({ ...x, judul: v }))} />
              <div style={{ height: 12 }} />
              <TextInput
                label="Tim atau pengusul"
                placeholder="Nama ketua dan anggota"
                value={d.tim}
                maxLength={200}
                onChange={(v) => setD((x) => ({ ...x, tim: v }))}
              />
              <div style={{ height: 12 }} />
              <Grid cols={3}>
                <TextInput label="Kampus" value={d.kampus} maxLength={100} onChange={(v) => setD((x) => ({ ...x, kampus: v }))} />
                <TextInput
                  label="Dosen pendamping"
                  value={d.pembimbing}
                  maxLength={100}
                  onChange={(v) => setD((x) => ({ ...x, pembimbing: v }))}
                />
                <TextInput label="Tahun" value={d.tahun} maxLength={10} onChange={(v) => setD((x) => ({ ...x, tahun: v }))} />
              </Grid>
            </Card>

            {info.bagian.map((b, i) => {
              const kata = hitungKata(isi[b.id] || "");
              return (
                <Card
                  key={`${jenis}-${b.id}`}
                  title={`${i + 1}. ${b.judul}`}
                  hint={b.tanya}
                  right={
                    b.kata > 0 ? (
                      <span className={p.kata} aria-label={`${kata} dari saran ${b.kata} kata`}>
                        {nf(kata)}/{nf(b.kata)} kata
                      </span>
                    ) : undefined
                  }
                >
                  <TextArea
                    label={b.id === "pustaka" ? "Satu sumber per baris" : "Isi (pisahkan paragraf dengan baris kosong)"}
                    rows={b.kata >= 250 ? 8 : 5}
                    maxLength={8000}
                    value={isi[b.id] || ""}
                    onChange={(v) => setD((x) => ({ ...x, isi: { ...(x.isi || {}), [b.id]: v } }))}
                  />
                </Card>
              );
            })}

            <Card title="Rencana anggaran biaya (RAB)" hint={`Total: ${rp(hasilRab.total)}`}>
              <div className={k.rows}>
                {rab.map((r, i) => (
                  <div key={i} className={p.rowRab}>
                    <Select<KategoriRab>
                      label="Kategori"
                      value={r.kategori}
                      onChange={(v) => ubahRab(i, { kategori: v })}
                      options={KATEGORI_RAB.map((v) => ({ v, label: v }))}
                    />
                    <TextInput
                      label="Uraian"
                      value={r.uraian}
                      maxLength={100}
                      onChange={(v) => ubahRab(i, { uraian: v })}
                    />
                    <NumInput
                      label="Volume"
                      value={r.volume}
                      digits={0}
                      min={0}
                      onChange={(n) => ubahRab(i, { volume: n })}
                    />
                    <TextInput
                      label="Satuan"
                      placeholder="pcs"
                      value={r.satuan}
                      maxLength={20}
                      onChange={(v) => ubahRab(i, { satuan: v })}
                    />
                    <NumInput
                      money
                      label="Harga satuan"
                      value={r.harga}
                      onChange={(n) => ubahRab(i, { harga: n })}
                    />
                    <div className={p.sub}>
                      <span className={k.label}>Jumlah</span>
                      <b>{rp(subtotal(r))}</b>
                    </div>
                    <RemoveBtn
                      label={`Hapus ${r.uraian || `baris ${i + 1}`}`}
                      onClick={() => setD((x) => ({ ...x, rab: x.rab.filter((_, j) => j !== i) }))}
                    />
                  </div>
                ))}
                {rab.length < MAKS_RAB && (
                  <div className={`${k.addBtn} no-print`}>
                    <Button small onClick={() => setD((x) => ({ ...x, rab: [...(x.rab || []), barisKosong()] }))}>
                      + Tambah baris anggaran
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Jadwal kegiatan" hint="Centang bulan saat tiap kegiatan berjalan.">
              <div style={{ maxWidth: 220 }}>
                <Select<number>
                  label="Lama kegiatan"
                  value={bulanN}
                  onChange={(n) => setD((x) => ({ ...x, bulanN: n, jadwal: (x.jadwal || []).map((g) => ({ ...g, bulan: aturBulan(g.bulan || [], n) })) }))}
                  options={Array.from({ length: 12 }, (_, i) => ({ v: i + 1, label: `${i + 1} bulan` }))}
                />
              </div>
              <div style={{ height: 14 }} />
              <div className={k.rows}>
                {jadwal.map((g, i) => (
                  <div key={i} className={p.rowKeg}>
                    <TextInput
                      label={`Kegiatan ${i + 1}`}
                      hideLabel
                      placeholder={`Kegiatan ${i + 1}`}
                      value={g.nama}
                      maxLength={100}
                      onChange={(v) => ubahKeg(i, { nama: v })}
                    />
                    <div className={p.bulan} role="group" aria-label={`Bulan untuk kegiatan ${i + 1}`}>
                      {aturBulan(g.bulan || [], bulanN).map((on, m) => (
                        <label key={m} className={`${p.cb} ${on ? p.cbOn : ""}`}>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={(e) => {
                              const baru = aturBulan(g.bulan || [], bulanN);
                              baru[m] = e.target.checked;
                              ubahKeg(i, { bulan: baru });
                            }}
                          />
                          <span aria-hidden="true">{m + 1}</span>
                          <span className={k.srOnly}>Bulan {m + 1}</span>
                        </label>
                      ))}
                    </div>
                    <RemoveBtn
                      label={`Hapus kegiatan ${g.nama || i + 1}`}
                      onClick={() => setD((x) => ({ ...x, jadwal: x.jadwal.filter((_, j) => j !== i) }))}
                    />
                  </div>
                ))}
                {jadwal.length < MAKS_KEGIATAN && (
                  <div className={`${k.addBtn} no-print`}>
                    <Button
                      small
                      onClick={() => setD((x) => ({ ...x, jadwal: [...(x.jadwal || []), { nama: "", bulan: aturBulan([], bulanN) }] }))}
                    >
                      + Tambah kegiatan
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </Split>
        </div>
      )}

      {/* Dokumen: tampil di tab Pratinjau dan selalu ikut tercetak */}
      <div className={`${p.dok} ${tab === "pratinjau" ? "" : p.cetakSaja}`}>
        {tab === "pratinjau" && (
          <div className={`${p.info} no-print`}>
            <Note>
              Pratinjau ini untuk draf dan diskusi tim. Untuk pengiriman resmi, salin isinya ke template dari penyelenggara supaya
              format halaman, huruf, dan sampulnya sesuai pedoman.
            </Note>
          </div>
        )}
        <article className={p.kertas}>
          <section className={p.sampul}>
            <div className={p.jenisDok}>{info.label}</div>
            <h1 className={p.judulDok}>{d.judul || "Judul proposal"}</h1>
            <div className={p.garis} />
            <div className={p.oleh}>Diusulkan oleh:</div>
            <div className={p.tim}>{d.tim || "Nama tim atau pengusul"}</div>
            {d.pembimbing && (
              <>
                <div className={p.oleh}>Dosen pendamping:</div>
                <div className={p.tim}>{d.pembimbing}</div>
              </>
            )}
            <div className={p.kampus}>
              {d.kampus && <div>{d.kampus}</div>}
              {d.tahun && <div>{d.tahun}</div>}
            </div>
          </section>

          <section className={p.badan}>
            {info.bagian.map((b, i) => {
              const par = paragraf(isi[b.id] || "");
              return (
                <div key={b.id} className={p.bab}>
                  <h2>
                    {i + 1}. {b.judul}
                  </h2>
                  {b.id === "pustaka" ? (
                    (isi[b.id] || "").trim() ? (
                      <ol className={p.pustaka}>
                        {(isi[b.id] || "")
                          .split("\n")
                          .map((x) => x.trim())
                          .filter(Boolean)
                          .map((x, j) => (
                            <li key={j}>{x}</li>
                          ))}
                      </ol>
                    ) : (
                      <p className={p.kosong}>Belum diisi.</p>
                    )
                  ) : par.length ? (
                    par.map((x, j) => <p key={j}>{x}</p>)
                  ) : (
                    <p className={p.kosong}>Belum diisi.</p>
                  )}
                </div>
              );
            })}

            <div className={p.bab}>
              <h2>{info.bagian.length + 1}. Rencana Anggaran Biaya</h2>
              {rab.some((r) => subtotal(r) > 0) ? (
                <table className={p.tabel}>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Uraian</th>
                      <th>Volume</th>
                      <th>Harga satuan</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KATEGORI_RAB.filter((kat) => rab.some((r) => r.kategori === kat && subtotal(r) > 0)).map((kat) => (
                      <RabKategori key={kat} kategori={kat} baris={rab.filter((r) => r.kategori === kat && subtotal(r) > 0)} />
                    ))}
                    <tr className={p.total}>
                      <td colSpan={4}>Total anggaran</td>
                      <td>{rp(hasilRab.total)}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className={p.kosong}>Belum diisi.</p>
              )}
            </div>

            <div className={p.bab}>
              <h2>{info.bagian.length + 2}. Jadwal Kegiatan</h2>
              {jadwal.some((g) => g.nama.trim()) ? (
                <table className={`${p.tabel} ${p.tabelJadwal}`}>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kegiatan</th>
                      {Array.from({ length: bulanN }, (_, m) => (
                        <th key={m}>Bln {m + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jadwal
                      .filter((g) => g.nama.trim())
                      .map((g, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{g.nama}</td>
                          {aturBulan(g.bulan || [], bulanN).map((on, m) => (
                            <td key={m} className={on ? p.isi : ""}>
                              {on ? <span className={k.srOnly}>Ya</span> : null}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className={p.kosong}>Belum diisi.</p>
              )}
            </div>
          </section>
        </article>
      </div>
    </ToolShell>
  );
}

function RabKategori({ kategori, baris }: { kategori: string; baris: BarisRab[] }) {
  const jumlah = baris.reduce((a, b) => a + subtotal(b), 0);
  return (
    <>
      <tr className={p.kat}>
        <td colSpan={4}>{kategori}</td>
        <td>{rp(jumlah)}</td>
      </tr>
      {baris.map((r, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{r.uraian || "-"}</td>
          <td>
            {nf(r.volume)} {r.satuan}
          </td>
          <td>{rp(r.harga)}</td>
          <td>{rp(subtotal(r))}</td>
        </tr>
      ))}
    </>
  );
}
