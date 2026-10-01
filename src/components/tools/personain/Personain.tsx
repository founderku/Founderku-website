"use client";

import { useState } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { isiYangKosong } from "@/components/tools/ProKit";
import {
  Button,
  Card,
  Grid,
  Meter,
  Note,
  Split,
  StdActions,
  TextArea,
  TextInput,
  ToolShell,
} from "@/components/tools/kit/Kit";
import ps from "./personain.module.css";

interface Persona {
  nama: string;
  peran: string;
  umur: string;
  lokasi: string;
  penghasilan: string;
  kutipan: string;
  tujuan: string;
  masalah: string;
  kebiasaan: string;
  saluran: string;
  keberatan: string;
  pemicu: string;
}

const BAGIAN: { id: keyof Persona; judul: string; tanya: string }[] = [
  { id: "tujuan", judul: "Tujuan", tanya: "Apa yang ingin dia capai?" },
  { id: "masalah", judul: "Masalah terbesar", tanya: "Apa yang paling bikin dia pusing?" },
  { id: "kebiasaan", judul: "Kebiasaan sehari-hari", tanya: "Bagaimana dia bekerja dan memakai HP?" },
  { id: "saluran", judul: "Tempat mencari info", tanya: "Instagram, TikTok, grup WhatsApp, teman?" },
  { id: "pemicu", judul: "Yang bikin dia mau beli", tanya: "Momen atau alasan dia akhirnya membeli." },
  { id: "keberatan", judul: "Keberatan membeli", tanya: "Apa yang bikin dia ragu?" },
];

const baru = (): Persona => ({
  nama: "",
  peran: "",
  umur: "",
  lokasi: "",
  penghasilan: "",
  kutipan: "",
  tujuan: "",
  masalah: "",
  kebiasaan: "",
  saluran: "",
  keberatan: "",
  pemicu: "",
});

const AWAL = { persona: [baru()] };

const CONTOH = {
  persona: [
    {
      nama: "Bu Sari",
      peran: "Pemilik warung kopi",
      umur: "38 tahun",
      lokasi: "Bekasi",
      penghasilan: "Omzet Rp 25 jt/bulan",
      kutipan: "Tiap malam saya hitung manual, tapi tetap nggak tahu untungnya berapa.",
      tujuan: "Tahu untung harian\nBuka cabang kedua tahun depan",
      masalah: "Catatan penjualan di buku sering hilang\nStok bahan habis mendadak saat ramai",
      kebiasaan: "Pakai HP Android untuk WhatsApp dan QRIS\nSibuk dari pagi sampai malam",
      saluran: "Grup WhatsApp sesama pemilik warung\nTikTok resep dan usaha",
      pemicu: "Direkomendasikan teman sesama pemilik warung\nBisa dicoba gratis dulu",
      keberatan: "Takut ribet dan makan waktu\nTidak mau keluar uang untuk alat tambahan",
    },
  ],
};

export default function Personain() {
  const [d, setD, reset] = useToolState<{ persona: Persona[] }>("personain", "draft-v1", AWAL);
  const [aktif, setAktif] = useState(0);
  const idx = Math.min(aktif, d.persona.length - 1);
  const p = d.persona[idx];
  const ubah = (v: Partial<Persona>) => setD((x) => ({ persona: x.persona.map((q, j) => (j === idx ? { ...q, ...v } : q)) }));
  const kolom = Object.keys(baru()) as (keyof Persona)[];
  const terisi = kolom.filter((c) => p[c].trim()).length;
  const baris = (t: string) =>
    t
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  return (
    <ToolShell
      eyebrow="Founderku Tools · Validasi & Riset"
      title="Personain"
      desc="Gambarkan pelanggan idealmu (persona): siapa dia, apa tujuannya, masalahnya, dan apa yang bikin dia mau membeli. Hasilnya kartu persona siap dicetak untuk tim."
      actions={
        <StdActions
          onContoh={() => { reset(CONTOH); setAktif(0); }}
          onReset={() => { reset(); setAktif(0); }}
          ai={{
            toolId: "personain",
            contohIde: "Contoh: aplikasi kasir di HP untuk warung kopi kecil. Pelanggannya pemilik warung yang belum pernah pakai aplikasi kasir.",
            onIsi: (isi) => {
              const dariAI = isi.persona as Record<string, unknown> | undefined;
              const kosong = kolom.every((c) => !p[c].trim());
              if (!kosong && d.persona.length < 3) {
                // Persona yang sedang dibuka sudah terisi: tambah persona baru
                setD((x) => ({ persona: [...x.persona, { ...baru(), ...isiYangKosong({ ...baru() }, dariAI) }] }));
                setAktif(d.persona.length);
              } else {
                setD((x) => ({ persona: x.persona.map((q, j) => (j === idx ? { ...q, ...isiYangKosong({ ...q }, dariAI) } : q)) }));
              }
            },
          }}
        />
      }
    >
      <div className={`${ps.pilih} no-print`}>
          {d.persona.map((q, i) => (
            <button key={i} type="button" className={`${ps.tab} ${i === idx ? ps.tabOn : ""}`} onClick={() => setAktif(i)} aria-pressed={i === idx}>
              {q.nama || `Persona ${i + 1}`}
            </button>
          ))}
          {d.persona.length < 3 && (
            <Button
              small
              variant="ghost"
              onClick={() => {
                setD((x) => ({ persona: [...x.persona, baru()] }));
                setAktif(d.persona.length);
              }}
            >
              + Persona
            </Button>
          )}
        </div>
      <Split
        aside={
          <>
            <div className={ps.kartu}>
              <div className={ps.atas}>
                <span className={ps.avatar} aria-hidden="true">
                  {(p.nama || "?").trim().charAt(0).toUpperCase()}
                </span>
                <div>
                  <b className={ps.nama}>{p.nama || "Nama persona"}</b>
                  <div className={ps.meta}>{[p.peran, p.umur, p.lokasi].filter(Boolean).join(" · ") || "Peran · umur · lokasi"}</div>
                  {p.penghasilan && <div className={ps.meta}>{p.penghasilan}</div>}
                </div>
              </div>
              {p.kutipan && <p className={ps.kutipan}>&ldquo;{p.kutipan}&rdquo;</p>}
              <div className={ps.grid}>
                {BAGIAN.map((b) => (
                  <div key={b.id}>
                    <small className={ps.judul}>{b.judul}</small>
                    {baris(p[b.id]).length ? (
                      <ul>
                        {baris(p[b.id]).map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className={ps.kosong}>Belum diisi</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="no-print">
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
                  <span>Kelengkapan</span>
                  <span style={{ color: "var(--faint)" }}>
                    {terisi}/{kolom.length}
                  </span>
                </div>
                <Meter value={(terisi / kolom.length) * 100} label="Kelengkapan persona" />
                <div style={{ height: 10 }} />
                <Note>Buat persona dari hasil wawancara nyata (lihat Wawancarain), bukan dari tebakan.</Note>
              </Card>
            </div>
          </>
        }
      >
        <div className="no-print" style={{ display: "contents" }}>
          <Card title="Siapa dia" right={d.persona.length > 1 ? <Button small variant="ghost" onClick={() => { setD((x) => ({ persona: x.persona.filter((_, j) => j !== idx) })); setAktif(0); }}>Hapus persona</Button> : undefined}>
            <Grid keep>
              <TextInput label="Nama" placeholder="Misal: Bu Sari" value={p.nama} maxLength={40} onChange={(v) => ubah({ nama: v })} />
              <TextInput label="Peran / pekerjaan" value={p.peran} maxLength={50} onChange={(v) => ubah({ peran: v })} />
              <TextInput label="Umur" value={p.umur} maxLength={20} onChange={(v) => ubah({ umur: v })} />
              <TextInput label="Lokasi" value={p.lokasi} maxLength={40} onChange={(v) => ubah({ lokasi: v })} />
            </Grid>
            <div style={{ height: 12 }} />
            <TextInput label="Penghasilan / skala usaha" value={p.penghasilan} maxLength={60} onChange={(v) => ubah({ penghasilan: v })} />
            <div style={{ height: 12 }} />
            <TextArea label="Kutipan khas dia" rows={2} maxLength={200} value={p.kutipan} onChange={(v) => ubah({ kutipan: v })} />
          </Card>
          <Card title="Isi kepala dia" hint="Satu poin per baris.">
            <div className={ps.form}>
              {BAGIAN.map((b) => (
                <TextArea key={b.id} label={b.judul} placeholder={b.tanya} rows={3} maxLength={500} value={p[b.id]} onChange={(v) => ubah({ [b.id]: v })} />
              ))}
            </div>
          </Card>
        </div>
      </Split>
    </ToolShell>
  );
}
