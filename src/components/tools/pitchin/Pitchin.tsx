"use client";

import { useState } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { SLIDES } from "@/lib/tools/pitchin/slides";
import {
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
import p from "./pitchin.module.css";

interface DataPitch {
  nama: string;
  tagline: string;
  kontak: string;
  judul: Record<string, string>;
  isi: Record<string, string>;
}

const AWAL: DataPitch = { nama: "", tagline: "", kontak: "", judul: {}, isi: {} };

const CONTOH: DataPitch = {
  nama: "KasirKu",
  tagline: "Tahu untung warung hari ini dalam 10 detik.",
  kontak: "rina@kasirku.id · kasirku.id",
  judul: {},
  isi: Object.fromEntries(SLIDES.map((s) => [s.id, s.contoh])),
};

type Tab = "isi" | "pratinjau";

function baris(teks: string): string[] {
  return teks
    .split("\n")
    .map((x) => x.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function Slide({
  no,
  judul,
  poin,
  nama,
}: {
  no: number;
  judul: string;
  poin: string[];
  nama: string;
}) {
  return (
    <div className={p.slide}>
      <div className={p.bar} />
      <div className={p.inner}>
        <div className={p.kecil}>{String(no).padStart(2, "0")}</div>
        <h2 className={p.judul}>
          {judul}
          <span className={p.dot}>.</span>
        </h2>
        {poin.length ? (
          <ul className={p.poin}>
            {poin.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        ) : (
          <p className={p.kosong}>Belum diisi</p>
        )}
      </div>
      <div className={p.kaki}>{nama}</div>
    </div>
  );
}

function Sampul({ d }: { d: DataPitch }) {
  return (
    <div className={`${p.slide} ${p.sampul}`}>
      <div className={p.inner}>
        <div className={p.kecil}>Pitch deck</div>
        <div className={p.namaBesar}>
          {d.nama || "Nama startup"}
          <span className={p.dot}>.</span>
        </div>
        <p className={p.tagline}>{d.tagline || "Satu kalimat yang menjelaskan startup kamu."}</p>
      </div>
      <div className={p.kaki}>{d.kontak}</div>
    </div>
  );
}

export default function Pitchin() {
  const [d, setD, reset] = useToolState<DataPitch>("pitchin", "draft-v1", AWAL);
  const [tab, setTab] = useState<Tab>("isi");
  const terisi = SLIDES.filter((s) => baris(d.isi[s.id] || "").length > 0).length;
  const judulDari = (id: string, awal: string) => (d.judul[id] || "").trim() || awal;

  return (
    <ToolShell
      eyebrow="Founderku Tools · Pendanaan"
      title="Pitchin"
      desc="Susun pitch deck 10 slide dengan panduan tiap slide. Isi poin-poinnya, lihat pratinjaunya, lalu cetak jadi PDF satu slide per halaman."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
      printHead={false}
    >
      <div className="no-print">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { id: "isi", label: "Isi slide" },
            { id: "pratinjau", label: "Pratinjau" },
          ]}
        />
      </div>

      {tab === "isi" && (
        <div className="no-print">
          <Split
            aside={
              <>
                <Card>
                  <Stat big label="Slide terisi" value={`${terisi}/${SLIDES.length}`} />
                  <div style={{ height: 12 }} />
                  <Meter value={(terisi / SLIDES.length) * 100} label="Kelengkapan slide" />
                  <div style={{ height: 14 }} />
                  <Note>
                    Tips: maksimal 3 sampai 5 poin per slide, dan tiap poin cukup satu baris. Investor biasanya melihat satu
                    deck kurang dari 4 menit.
                  </Note>
                </Card>
                <Card tone="soft" title="Siap dicetak?">
                  <Note>
                    Buka tab Pratinjau untuk cek hasilnya, lalu tekan Cetak / PDF. Di jendela cetak, pilih &quot;Simpan
                    sebagai PDF&quot; dan orientasi lanskap.
                  </Note>
                </Card>
              </>
            }
          >
            <Card title="Sampul">
              <Grid>
                <TextInput label="Nama startup" value={d.nama} maxLength={40} onChange={(v) => setD((x) => ({ ...x, nama: v }))} />
                <TextInput
                  label="Kontak"
                  placeholder="email · situs"
                  value={d.kontak}
                  maxLength={80}
                  onChange={(v) => setD((x) => ({ ...x, kontak: v }))}
                />
              </Grid>
              <div style={{ height: 14 }} />
              <TextInput
                label="Tagline (satu kalimat)"
                value={d.tagline}
                maxLength={120}
                onChange={(v) => setD((x) => ({ ...x, tagline: v }))}
              />
            </Card>
            {SLIDES.map((s, i) => (
              <Card key={s.id} title={`${i + 1}. ${judulDari(s.id, s.judul)}`} hint={s.tips}>
                <Grid>
                  <TextInput
                    label="Judul slide"
                    placeholder={s.judul}
                    value={d.judul[s.id] || ""}
                    maxLength={50}
                    onChange={(v) => setD((x) => ({ ...x, judul: { ...x.judul, [s.id]: v } }))}
                  />
                  <div />
                </Grid>
                <div style={{ height: 12 }} />
                <TextArea
                  label="Poin-poin (satu per baris)"
                  placeholder={s.contoh}
                  rows={4}
                  maxLength={700}
                  value={d.isi[s.id] || ""}
                  onChange={(v) => setD((x) => ({ ...x, isi: { ...x.isi, [s.id]: v } }))}
                />
              </Card>
            ))}
          </Split>
        </div>
      )}

      {/* Pratinjau: selalu ikut tercetak, walau sedang di tab Isi */}
      <div className={`${p.deck} ${tab === "pratinjau" ? "" : p.cetakSaja}`} data-pitch-deck>
        <Sampul d={d} />
        {SLIDES.map((s, i) => (
          <Slide key={s.id} no={i + 1} judul={judulDari(s.id, s.judul)} poin={baris(d.isi[s.id] || "")} nama={d.nama} />
        ))}
      </div>
    </ToolShell>
  );
}
