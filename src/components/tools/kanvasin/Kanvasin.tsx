"use client";

import { useToolState } from "@/lib/tools/useToolState";
import { isiYangKosong } from "@/components/tools/ProKit";
import { BLOK, NAMA_MODEL, butir, kelengkapan, saran, type Model } from "@/lib/tools/kanvasin/calc";
import {
  Badge,
  Card,
  Grid,
  Meter,
  Note,
  Split,
  Stat,
  StdActions,
  Tabs,
  TextArea,
  TextInput,
  ToolShell,
} from "@/components/tools/kit/Kit";
import c from "./kanvasin.module.css";

interface DataKanvas {
  model: Model;
  nama: string;
  penyusun: string;
  bmc: Record<string, string>;
  lean: Record<string, string>;
}

const AWAL: DataKanvas = { model: "lean", nama: "", penyusun: "", bmc: {}, lean: {} };

const CONTOH: DataKanvas = {
  model: "lean",
  nama: "Kopi Kos",
  penyusun: "Tim Kopi Kos, Universitas Contoh",
  bmc: Object.fromEntries(BLOK.bmc.map((b) => [b.id, b.contoh])),
  lean: Object.fromEntries(BLOK.lean.map((b) => [b.id, b.contoh])),
};

function tanggalHariIni() {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
}

export default function Kanvasin() {
  const [d, setD, reset] = useToolState<DataKanvas>("kanvasin", "draft-v1", AWAL);
  const model: Model = d.model === "bmc" ? "bmc" : "lean";
  const isi = (model === "bmc" ? d.bmc : d.lean) || {};
  const blok = BLOK[model];
  const leng = kelengkapan(model, isi);
  const daftarSaran = saran(model, isi);

  const ubah = (id: string, v: string) => setD((x) => ({ ...x, [model]: { ...(x[model] || {}), [id]: v } }));

  return (
    <ToolShell
      eyebrow="Founderku Tools · Mahasiswa & Karier"
      title="Kanvasin"
      desc="Susun Business Model Canvas atau Lean Canvas dengan pertanyaan panduan di tiap blok. Cocok untuk tugas kuliah kewirausahaan, PKM, dan lomba bisnis. Hasilnya bisa dicetak satu halaman."
      actions={
        <StdActions
          onContoh={() => reset(CONTOH)}
          onReset={() => reset()}
          ai={{
            toolId: "kanvasin",
            konteks: { model: d.model },
            contohIde: "Contoh: kedai kopi kecil dekat kampus, buka sampai malam, harga ramah mahasiswa.",
            onIsi: (isi) =>
              setD((x) => ({
                ...x,
                nama: x.nama.trim() ? x.nama : String(isi.nama ?? ""),
                [x.model]: isiYangKosong(x[x.model], isi.kotak),
              })),
          }}
        />
      }
      printHead={false}
    >
      <div className="no-print">
        <Tabs<Model>
          value={model}
          onChange={(v) => setD((x) => ({ ...x, model: v }))}
          items={[
            { id: "lean", label: "Lean Canvas" },
            { id: "bmc", label: "Business Model Canvas" },
          ]}
        />
        <Split
          aside={
            <>
              <Card>
                <Stat big label="Blok terisi" value={`${leng.terisi}/${leng.total}`} />
                <div style={{ height: 12 }} />
                <Meter value={leng.persen} label="Kelengkapan kanvas" />
              </Card>
              {daftarSaran.length > 0 && (
                <Card title="Saran">
                  <ul className={c.saran}>
                    {daftarSaran.map((x, i) => (
                      <li key={i}>
                        <Badge tone={x.tone} text={x.tone === "good" ? "Mantap" : "Cek lagi"} />
                        <span>{x.teks}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              <Card tone="soft" title={model === "lean" ? "Kapan pakai Lean Canvas?" : "Kapan pakai BMC?"}>
                <Note>
                  {model === "lean"
                    ? "Lean Canvas cocok untuk ide yang baru mulai: fokus ke masalah, solusi, dan angka yang perlu dibuktikan. Kalau usahanya sudah berjalan, Business Model Canvas biasanya lebih pas."
                    : "Business Model Canvas cocok untuk usaha yang sudah jelas bentuknya: siapa mitra, sumber daya, dan cara menjaga pelanggan. Kalau idenya masih baru, coba Lean Canvas dulu."}
                </Note>
                <div style={{ height: 10 }} />
                <Note>Tulis satu poin per baris, singkat saja. Kanvas yang baik muat dibaca dalam 1 menit.</Note>
              </Card>
              <Card tone="soft" title="Siap dicetak?">
                <Note>
                  Cek pratinjau di bawah, lalu tekan Cetak / PDF. Kanvas otomatis tercetak di satu halaman A4 lanskap.
                </Note>
              </Card>
            </>
          }
        >
          <Card title="Identitas">
            <Grid>
              <TextInput label="Nama usaha atau ide" value={d.nama} maxLength={60} onChange={(v) => setD((x) => ({ ...x, nama: v }))} />
              <TextInput
                label="Disusun oleh"
                placeholder="Nama tim, kelas, atau kampus"
                value={d.penyusun}
                maxLength={100}
                onChange={(v) => setD((x) => ({ ...x, penyusun: v }))}
              />
            </Grid>
          </Card>
          {blok.map((b, i) => (
            <Card key={`${model}-${b.id}`} title={`${i + 1}. ${b.judul}`} hint={b.tanya}>
              <TextArea
                label="Poin-poin (satu per baris)"
                placeholder={b.contoh}
                rows={3}
                maxLength={600}
                value={isi[b.id] || ""}
                onChange={(v) => ubah(b.id, v)}
              />
            </Card>
          ))}
        </Split>
      </div>

      {/* Pratinjau kanvas: tampil di layar dan satu-satunya yang tercetak */}
      <section className={c.kertas} aria-label={`Pratinjau ${NAMA_MODEL[model]}`}>
        <header className={c.kop}>
          <div>
            <div className={c.jenis}>{NAMA_MODEL[model]}</div>
            <div className={c.nama}>
              {d.nama || "Nama usaha"}
              <span className={c.dot}>.</span>
            </div>
          </div>
          <div className={c.meta}>
            {d.penyusun && <div>{d.penyusun}</div>}
            <div suppressHydrationWarning>{tanggalHariIni()}</div>
          </div>
        </header>
        <div className={c.kanvas}>
          {blok.map((b, i) => {
            const poin = butir(isi[b.id] || "");
            return (
              <div key={b.id} className={c.blok} style={{ gridArea: b.area }}>
                <div className={c.blokJudul}>
                  <span className={c.no}>{i + 1}</span>
                  {b.judul}
                </div>
                {poin.length ? (
                  <ul className={c.poin}>
                    {poin.slice(0, 8).map((x, j) => (
                      <li key={j}>{x}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={c.kosong}>Belum diisi</p>
                )}
              </div>
            );
          })}
        </div>
        <div className={c.kaki}>Dibuat dengan Kanvasin · founderku.com/tools/kanvasin</div>
      </section>
    </ToolShell>
  );
}
