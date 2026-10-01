"use client";

import { useMemo } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import { celah, pembeda, type Pesaing } from "@/lib/tools/kompetitorin/calc";
import {
  Button,
  Card,
  Grid,
  kitStyles as k,
  Note,
  NumInput,
  RemoveBtn,
  Split,
  StdActions,
  TextInput,
  Toggle,
  ToolShell,
  Verdict,
} from "@/components/tools/kit/Kit";

interface DataKompetitor {
  kiri: string;
  kanan: string;
  bawah: string;
  atas: string;
  kriteria: string[];
  kita: Pesaing;
  pesaing: Pesaing[];
}

const kosong = (nama = ""): Pesaing => ({ nama, harga: "", x: 5, y: 5, punya: [] });

const AWAL: DataKompetitor = {
  kiri: "Murah",
  kanan: "Mahal",
  bawah: "Sederhana",
  atas: "Lengkap",
  kriteria: ["", "", ""],
  kita: kosong("Produk kami"),
  pesaing: [kosong(), kosong()],
};

const CONTOH: DataKompetitor = {
  kiri: "Murah",
  kanan: "Mahal",
  bawah: "Sederhana",
  atas: "Lengkap",
  kriteria: ["Bisa dipakai offline", "Laporan untung via WhatsApp", "Multi cabang", "Harga di bawah Rp 100 rb", "Tanpa alat tambahan"],
  kita: { nama: "KasirKu", harga: "Rp 99 rb/bln", x: 3, y: 5, punya: [true, true, false, true, true] },
  pesaing: [
    { nama: "Kasir Besar A", harga: "Rp 299 rb/bln", x: 9, y: 9, punya: [true, false, true, false, false] },
    { nama: "Kasir B", harga: "Rp 149 rb/bln", x: 6, y: 7, punya: [false, false, true, false, true] },
    { nama: "Buku tulis", harga: "Gratis", x: 1, y: 1, punya: [true, false, false, true, true] },
  ],
};

// Hasil "Isi dengan AI": kalau tool masih kosong, isi semuanya. Kalau
// sudah ada isian, hanya kriteria dan pesaing yang masih kosong yang diisi.
function isiKompetitor(x: DataKompetitor, isi: Record<string, unknown>): DataKompetitor {
  const kriteriaAI = (Array.isArray(isi.kriteria) ? isi.kriteria : []).filter((k): k is string => typeof k === "string");
  const ubahProduk = (lama: Pesaing, baruAI: unknown, panjang: number): Pesaing => {
    const b = (baruAI ?? {}) as Partial<Pesaing>;
    const punya = Array.from({ length: panjang }, (_, i) => (Array.isArray(b.punya) ? !!b.punya[i] : !!lama.punya[i]));
    return {
      nama: lama.nama.trim() && lama.nama !== "Produk kami" ? lama.nama : typeof b.nama === "string" ? b.nama : lama.nama,
      harga: lama.harga.trim() ? lama.harga : typeof b.harga === "string" ? b.harga : "",
      x: typeof b.x === "number" ? b.x : lama.x,
      y: typeof b.y === "number" ? b.y : lama.y,
      punya,
    };
  };
  const pesaingAI = Array.isArray(isi.pesaing) ? isi.pesaing : [];
  const masihKosong = x.kriteria.every((k) => !k.trim()) && x.pesaing.every((q) => !q.nama.trim());
  if (masihKosong && kriteriaAI.length) {
    return {
      ...x,
      kriteria: kriteriaAI,
      kita: ubahProduk(x.kita, isi.kita, kriteriaAI.length),
      pesaing: pesaingAI.map((q) => ubahProduk(kosong(), q, kriteriaAI.length)),
    };
  }
  // Sudah ada isian: isi slot kriteria kosong dan pesaing tanpa nama saja
  let ai = 0;
  const kriteria = x.kriteria.map((k) => (k.trim() ? k : (kriteriaAI[ai++] ?? k)));
  let pi = 0;
  const pesaing = x.pesaing.map((q) => (q.nama.trim() ? q : pesaingAI[pi] ? ubahProduk(q, { ...(pesaingAI[pi++] as object), punya: undefined }, x.kriteria.length) : q));
  return { ...x, kriteria, pesaing };
}

// Peta posisi: titik tiap produk di dua sumbu (1-10)
function Peta({ d }: { d: DataKompetitor }) {
  const S = 300;
  const pad = 34;
  const pos = (v: number) => pad + ((Math.max(1, Math.min(10, v || 5)) - 1) / 9) * (S - 2 * pad);
  const semua = [{ ...d.kita, kita: true }, ...d.pesaing.map((p) => ({ ...p, kita: false }))];
  return (
    <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label="Peta posisi produk dibanding pesaing" style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto", overflow: "visible" }}>
      <rect x={pad} y={pad} width={S - 2 * pad} height={S - 2 * pad} rx="12" fill="var(--panel)" stroke="var(--line-2)" />
      <line x1={S / 2} x2={S / 2} y1={pad} y2={S - pad} stroke="var(--line-2)" strokeDasharray="4 5" />
      <line y1={S / 2} y2={S / 2} x1={pad} x2={S - pad} stroke="var(--line-2)" strokeDasharray="4 5" />
      <text x={pad} y={S - 10} fontSize="11.5" fill="var(--faint)">{d.kiri}</text>
      <text x={S - pad} y={S - 10} fontSize="11.5" fill="var(--faint)" textAnchor="end">{d.kanan}</text>
      <text x={10} y={S - pad} fontSize="11.5" fill="var(--faint)" transform={`rotate(-90 10 ${S - pad})`}>{d.bawah}</text>
      <text x={10} y={pad} fontSize="11.5" fill="var(--faint)" textAnchor="end" transform={`rotate(-90 10 ${pad})`}>{d.atas}</text>
      {semua.map((p, i) => {
        const cx = pos(p.x);
        const cy = S - pos(p.y);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={p.kita ? 9 : 7} fill={p.kita ? "#F2A93E" : "#8A85B8"} stroke="var(--card)" strokeWidth="2" />
            <text x={cx} y={cy - 13} fontSize="11.5" textAnchor="middle" fill="var(--text)" fontWeight={p.kita ? 600 : 400}>
              {(p.nama || (p.kita ? "Kami" : `Pesaing ${i}`)).slice(0, 18)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Kompetitorin() {
  const [d, setD, reset] = useToolState<DataKompetitor>("kompetitorin", "draft-v1", AWAL);
  const ubahP = (i: number, p: Partial<Pesaing>) => setD((x) => ({ ...x, pesaing: x.pesaing.map((q, j) => (j === i ? { ...q, ...p } : q)) }));
  const setPunya = (arr: boolean[], i: number, v: boolean) => {
    const n = [...arr];
    n[i] = v;
    return n;
  };
  const beda = useMemo(() => pembeda(d.kriteria, d.kita.punya, d.pesaing), [d]);
  const lubang = useMemo(() => celah(d.kriteria, d.kita.punya, d.pesaing), [d]);
  const kriteriaIsi = d.kriteria.map((x, i) => ({ x, i })).filter(({ x }) => x.trim());

  const EditProduk = ({ p, onUbah, judulNama }: { p: Pesaing; onUbah: (v: Partial<Pesaing>) => void; judulNama: string }) => (
    <>
      <Grid keep>
        <TextInput label={judulNama} value={p.nama} maxLength={40} onChange={(v) => onUbah({ nama: v })} />
        <TextInput label="Harga" placeholder="Rp 99 rb/bln" value={p.harga} maxLength={30} onChange={(v) => onUbah({ harga: v })} />
        <NumInput label={`${d.kiri} (1) - ${d.kanan} (10)`} digits={0} value={p.x} min={1} max={10} onChange={(n) => onUbah({ x: n })} />
        <NumInput label={`${d.bawah} (1) - ${d.atas} (10)`} digits={0} value={p.y} min={1} max={10} onChange={(n) => onUbah({ y: n })} />
      </Grid>
      {kriteriaIsi.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {kriteriaIsi.map(({ x, i }) => (
            <Toggle key={i} label={x} checked={!!p.punya[i]} onChange={(v) => onUbah({ punya: setPunya(p.punya, i, v) })} />
          ))}
        </div>
      )}
    </>
  );

  return (
    <ToolShell
      eyebrow="Founderku Tools · Validasi & Riset"
      title="Kompetitorin"
      desc="Bandingkan produkmu dengan pesaing: tabel fitur, peta posisi, dan otomatis terlihat mana pembedamu dan mana celah yang perlu ditutup."
      actions={
        <StdActions
          onContoh={() => reset(CONTOH)}
          onReset={() => reset()}
          ai={{
            toolId: "kompetitorin",
            contohIde: "Contoh: aplikasi kasir di HP untuk warung kopi, langganan bulanan murah, laporan untung lewat WhatsApp.",
            onIsi: (isi) => setD((x) => isiKompetitor(x, isi)),
          }}
        />
      }
    >
      <Split
        aside={
          <>
            <Card title="Peta posisi">
              <Peta d={d} />
            </Card>
            {kriteriaIsi.length > 0 && (
              <Verdict tone={beda.length ? "good" : "warn"} title={beda.length ? `${beda.length} pembeda kamu` : "Belum ada pembeda jelas"}>
                {beda.length > 0 ? (
                  <ul>
                    {beda.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Semua keunggulanmu juga dimiliki kebanyakan pesaing. Cari satu hal yang bisa kamu lakukan jauh lebih baik.</p>
                )}
                {lubang.length > 0 && (
                  <p style={{ marginTop: 8 }}>
                    <b>Celah yang dimiliki mayoritas pesaing:</b> {lubang.join(", ")}.
                  </p>
                )}
              </Verdict>
            )}
          </>
        }
      >
        <Card title="Kriteria pembanding" hint="Fitur atau hal yang penting buat pelanggan. Satu kriteria per baris.">
          <div className={k.rows}>
            {d.kriteria.map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "end" }}>
                <div style={{ flex: 1 }}>
                  <TextInput
                    label={`Kriteria ${i + 1}`}
                    hideLabel={i > 0}
                    value={x}
                    maxLength={60}
                    onChange={(v) => setD((s) => ({ ...s, kriteria: s.kriteria.map((q, j) => (j === i ? v : q)) }))}
                  />
                </div>
                <RemoveBtn
                  label={`Hapus kriteria ${i + 1}`}
                  onClick={() =>
                    setD((s) => ({
                      ...s,
                      kriteria: s.kriteria.filter((_, j) => j !== i),
                      kita: { ...s.kita, punya: s.kita.punya.filter((_, j) => j !== i) },
                      pesaing: s.pesaing.map((p) => ({ ...p, punya: p.punya.filter((_, j) => j !== i) })),
                    }))
                  }
                />
              </div>
            ))}
            {d.kriteria.length < 12 && (
              <div className={`${k.addBtn} no-print`}>
                <Button small onClick={() => setD((s) => ({ ...s, kriteria: [...s.kriteria, ""] }))}>
                  + Tambah kriteria
                </Button>
              </div>
            )}
          </div>
        </Card>
        <Card title="Sumbu peta posisi" hint="Dua hal yang paling membedakan produk di pasarmu.">
          <Grid keep>
            <TextInput label="Kiri" value={d.kiri} maxLength={20} onChange={(v) => setD((s) => ({ ...s, kiri: v }))} />
            <TextInput label="Kanan" value={d.kanan} maxLength={20} onChange={(v) => setD((s) => ({ ...s, kanan: v }))} />
            <TextInput label="Bawah" value={d.bawah} maxLength={20} onChange={(v) => setD((s) => ({ ...s, bawah: v }))} />
            <TextInput label="Atas" value={d.atas} maxLength={20} onChange={(v) => setD((s) => ({ ...s, atas: v }))} />
          </Grid>
        </Card>
        <Card title="Produk kamu">{EditProduk({ p: d.kita, onUbah: (v) => setD((s) => ({ ...s, kita: { ...s.kita, ...v } })), judulNama: "Nama produk" })}</Card>
        {d.pesaing.map((p, i) => (
          <Card key={i} title={p.nama || `Pesaing ${i + 1}`} right={<RemoveBtn label={`Hapus ${p.nama || "pesaing"}`} onClick={() => setD((s) => ({ ...s, pesaing: s.pesaing.filter((_, j) => j !== i) }))} />}>
            {EditProduk({ p, onUbah: (v) => ubahP(i, v), judulNama: "Nama pesaing" })}
          </Card>
        ))}
        {d.pesaing.length < 6 && (
          <div className="no-print">
            <Button small onClick={() => setD((s) => ({ ...s, pesaing: [...s.pesaing, kosong()] }))}>
              + Tambah pesaing
            </Button>
          </div>
        )}
        {kriteriaIsi.length > 0 && (
          <Card title="Tabel perbandingan">
            <div className={k.tableWrap}>
              <table className={k.table}>
                <thead>
                  <tr>
                    <th>Kriteria</th>
                    <th>{d.kita.nama || "Kami"}</th>
                    {d.pesaing.map((p, i) => (
                      <th key={i}>{p.nama || `Pesaing ${i + 1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kriteriaIsi.map(({ x, i }) => (
                    <tr key={i}>
                      <td>{x}</td>
                      <td>{d.kita.punya[i] ? "✓" : "-"}</td>
                      {d.pesaing.map((p, j) => (
                        <td key={j}>{p.punya[i] ? "✓" : "-"}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td>Harga</td>
                    <td>{d.kita.harga || "-"}</td>
                    {d.pesaing.map((p, j) => (
                      <td key={j}>{p.harga || "-"}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}
        <Note>Masukkan juga alternatif yang bukan produk sejenis, misalnya cara manual (Excel, buku tulis) yang dipakai calon pelanggan sekarang.</Note>
      </Split>
    </ToolShell>
  );
}
