"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { AREAS, hitungSkor } from "@/lib/tools/validasiin/calc";
import { nf } from "@/lib/tools/format";
import {
  Card,
  Grid,
  kitStyles as k,
  Meter,
  Note,
  Scale,
  Split,
  Stat,
  StdActions,
  TextArea,
  TextInput,
  ToolShell,
  Verdict,
  type Tone,
} from "@/components/tools/kit/Kit";

// Lean Canvas: 9 kotak untuk merangkum ide dalam satu halaman
const CANVAS: { id: string; judul: string; tanya: string }[] = [
  { id: "masalah", judul: "1. Masalah", tanya: "3 masalah utama yang dialami pelanggan. Apa cara mereka mengatasinya sekarang?" },
  { id: "segmen", judul: "2. Segmen pelanggan", tanya: "Siapa pelanggannya? Siapa yang paling awal mau mencoba (early adopter)?" },
  { id: "nilai", judul: "3. Nilai unik", tanya: "Satu kalimat jelas kenapa produkmu beda dan layak diperhatikan." },
  { id: "solusi", judul: "4. Solusi", tanya: "3 fitur utama yang menjawab masing-masing masalah." },
  { id: "saluran", judul: "5. Saluran", tanya: "Lewat mana pelanggan tahu dan membeli? (Instagram, komunitas, sales, dll)" },
  { id: "pendapatan", judul: "6. Sumber pendapatan", tanya: "Bagaimana kamu dibayar? Berapa harganya?" },
  { id: "biaya", judul: "7. Struktur biaya", tanya: "Biaya terbesar untuk menjalankan bisnis ini." },
  { id: "metrik", judul: "8. Metrik kunci", tanya: "Angka yang menunjukkan bisnis ini jalan (misal pengguna aktif mingguan)." },
  { id: "keunggulan", judul: "9. Keunggulan tak mudah ditiru", tanya: "Apa yang kamu punya dan sulit dicontek atau dibeli pesaing?" },
];

interface DataValidasi {
  nama: string;
  kalimat: string;
  canvas: Record<string, string>;
  nilai: Record<string, number[]>;
}

const AWAL: DataValidasi = { nama: "", kalimat: "", canvas: {}, nilai: {} };

const CONTOH: DataValidasi = {
  nama: "KasirKu",
  kalimat: "Aplikasi kasir di HP untuk warung kopi, bikin laporan harian otomatis.",
  canvas: {
    masalah: "Pemilik warung tidak tahu untung harian\nCatatan penjualan masih di buku\nStok bahan sering habis mendadak",
    segmen: "Warung kopi dan kedai kecil di kota besar, 1 sampai 3 karyawan. Early adopter: pemilik muda yang aktif di Instagram.",
    nilai: "Tahu untung hari ini dalam 10 detik, langsung dari HP.",
    solusi: "Kasir di HP tanpa alat tambahan\nLaporan untung otomatis tiap malam\nPengingat stok menipis",
    saluran: "Komunitas pemilik kedai kopi, konten TikTok, kerja sama dengan pemasok biji kopi.",
    pendapatan: "Langganan Rp 49.000 per bulan, gratis 14 hari.",
    biaya: "Gaji 2 developer, server, iklan media sosial.",
    metrik: "Jumlah warung yang mencatat transaksi minimal 5 hari seminggu.",
    keunggulan: "Data harga bahan baku dari jaringan pemasok, jadi hitungan untung lebih akurat.",
  },
  nilai: { masalah: [4, 3], pelanggan: [4, 2], solusi: [4, 4], pasar: [3, 3], bisnis: [2, 4] },
};

function tone(skor: number): Tone {
  if (skor >= 70) return "good";
  if (skor >= 45) return "warn";
  return "bad";
}

export default function Validasiin() {
  const [d, setD, reset] = useToolState<DataValidasi>("validasiin", "draft-v1", AWAL);
  const h = useMemo(() => hitungSkor(d.nilai), [d.nilai]);
  const total = AREAS.length * 2;
  const setNilai = (area: string, idx: number, n: number) =>
    setD((x) => {
      const arr = [...(x.nilai[area] || [0, 0])];
      arr[idx] = n;
      return { ...x, nilai: { ...x.nilai, [area]: arr } };
    });
  const t = h.skor !== null ? tone(h.skor) : "neutral";
  const terisiCanvas = CANVAS.filter((c) => (d.canvas[c.id] || "").trim()).length;

  return (
    <ToolShell
      eyebrow="Founderku Tools · Validasi & Riset"
      title="Validasiin"
      desc="Rangkum ide startup kamu dalam satu halaman (Lean Canvas), lalu cek seberapa siap ide itu diuji ke pasar. Hasilnya bisa dicetak untuk diskusi dengan tim atau mentor."
      actions={<StdActions onContoh={() => reset(CONTOH)} onReset={() => reset()} />}
    >
      <Split
        aside={
          <>
            <Card>
              <Stat
                big
                label="Skor kesiapan ide"
                value={h.skor !== null ? `${nf(h.skor)}/100` : "-"}
                tone={t}
                sub={`${h.terisi} dari ${total} pernyataan dinilai`}
              />
              <div style={{ height: 14 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {h.perArea.map((a) => (
                  <div key={a.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
                      <span>{a.nama}</span>
                      <span style={{ color: "var(--faint)" }}>{a.skor !== null ? nf(a.skor) : "-"}</span>
                    </div>
                    <Meter value={a.skor ?? 0} label={`Skor ${a.nama}`} />
                  </div>
                ))}
              </div>
            </Card>
            {h.skor !== null && (
              <Verdict
                tone={t}
                title={
                  t === "good" ? "Siap diuji ke pasar" : t === "warn" ? "Menjanjikan, perlu divalidasi" : "Masih asumsi"
                }
              >
                <p>
                  {t === "good"
                    ? "Dasarnya kuat. Langkah berikutnya: bikin MVP paling sederhana dan cari 10 pengguna pertama yang mau bayar."
                    : t === "warn"
                      ? "Ada potensi, tapi beberapa hal masih berupa tebakan. Uji dulu sebelum membangun produk lengkap."
                      : "Sebagian besar masih asumsi. Jangan keluar biaya besar dulu, fokus ngobrol dengan calon pelanggan."}
                </p>
                {h.terlemah && (
                  <p>
                    <b>Prioritas: {h.terlemah.nama}.</b> {h.terlemah.saran}
                  </p>
                )}
              </Verdict>
            )}
            <Note>
              Lean Canvas terisi {terisiCanvas} dari {CANVAS.length} kotak. Skor ini alat bantu refleksi, bukan jaminan
              ide akan berhasil.
            </Note>
          </>
        }
      >
        <Card title="Ide kamu">
          <Grid>
            <TextInput label="Nama ide / startup" value={d.nama} maxLength={60} onChange={(v) => setD((x) => ({ ...x, nama: v }))} />
            <TextInput
              label="Dalam satu kalimat"
              placeholder="Produk X untuk Y yang membantu Z"
              value={d.kalimat}
              maxLength={160}
              onChange={(v) => setD((x) => ({ ...x, kalimat: v }))}
            />
          </Grid>
        </Card>

        <Card title="Lean Canvas" hint="Tulis singkat, satu poin per baris. Tidak harus lengkap sekarang.">
          <div className={k.grid2}>
            {CANVAS.map((c) => (
              <TextArea
                key={c.id}
                label={c.judul}
                placeholder={c.tanya}
                rows={4}
                maxLength={600}
                value={d.canvas[c.id] || ""}
                onChange={(v) => setD((x) => ({ ...x, canvas: { ...x.canvas, [c.id]: v } }))}
              />
            ))}
          </div>
        </Card>

        <Card title="Cek kesiapan" hint="Nilai jujur dari 1 (sama sekali belum) sampai 5 (sudah terbukti).">
          {AREAS.map((a) => (
            <div key={a.id} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: "var(--pill-text)", fontWeight: 600, letterSpacing: ".04em", marginTop: 6 }}>
                {a.nama.toUpperCase()}
              </div>
              {a.pertanyaan.map((q, i) => (
                <Scale
                  key={q}
                  label={q}
                  kiri="Belum"
                  kanan="Terbukti"
                  value={(d.nilai[a.id] || [])[i] || 0}
                  onChange={(n) => setNilai(a.id, i, n)}
                />
              ))}
            </div>
          ))}
        </Card>
      </Split>
    </ToolShell>
  );
}
