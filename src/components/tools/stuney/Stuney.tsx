"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useToolState } from "@/lib/tools/useToolState";
import {
  anggaranBulan,
  bulanDari,
  buatId,
  cariKategori,
  contoh,
  dariVersiLama,
  DOMPET_SIAP,
  hariIni,
  KATEGORI_KELUAR,
  KATEGORI_MASUK,
  kosong,
  laporan,
  lencana,
  level,
  PERUNTUKAN,
  saldoDompet,
  saldoPeruntukan,
  streak,
  TANPA_DOMPET,
  totalBulan,
  totalSemua,
  urutTerbaru,
  type DataStuney,
  type Dompet,
  type Jenis,
  type Periode,
  type Peruntukan,
  type Target,
  type Transaksi,
} from "@/lib/tools/stuney/calc";
import { nf, rp } from "@/lib/tools/format";
import {
  Badge,
  Button,
  Card,
  DateInput,
  Grid,
  kitStyles as k,
  Meter,
  Note,
  NumInput,
  RemoveBtn,
  Select,
  Split,
  StdActions,
  Tabs,
  TextInput,
  ToolShell,
  Verdict,
} from "@/components/tools/kit/Kit";
import st from "./stuney.module.css";

type Tab = "beranda" | "transaksi" | "tabungan" | "laporan" | "profil";
const TABS: { id: Tab; label: string }[] = [
  { id: "beranda", label: "Beranda" },
  { id: "transaksi", label: "Transaksi" },
  { id: "tabungan", label: "Tabungan" },
  { id: "laporan", label: "Laporan" },
  { id: "profil", label: "Profil" },
];

const namaBulan = (bulan: string) => {
  const [y, m] = bulan.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};
const tglPanjang = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};
const tglPendek = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};
const namaDompet = (data: DataStuney, id?: string) => data.dompet.find((d) => d.id === id)?.nama ?? "Tanpa dompet";
const labelPeruntukan = (p: Peruntukan) => PERUNTUKAN.find((x) => x.v === p)?.label ?? "";

// ---------- Form catat / ubah transaksi ----------
interface Draf {
  jenis: Jenis;
  jumlah: number;
  kategori: string;
  dompet: string;
  keDompet: string;
  tanggal: string;
  catatan: string;
}

function drafBaru(data: DataStuney, jenis: Jenis = "keluar"): Draf {
  const d0 = data.dompet[0]?.id ?? "";
  const d1 = data.dompet.find((d) => d.id !== d0)?.id ?? d0;
  return {
    jenis,
    jumlah: 0,
    kategori: jenis === "masuk" ? KATEGORI_MASUK[0].id : jenis === "keluar" ? KATEGORI_KELUAR[0].id : "pindah",
    dompet: d0,
    keDompet: d1,
    tanggal: hariIni(),
    catatan: "",
  };
}

function FormTransaksi({
  data,
  edit,
  onSimpan,
  onBatal,
}: {
  data: DataStuney;
  edit: Transaksi | null;
  onSimpan: (d: Draf) => void;
  onBatal?: () => void;
}) {
  const [draf, setDraf] = useState<Draf>(() => (edit ? { ...edit, keDompet: edit.keDompet ?? "" } : drafBaru(data)));
  const [editLalu, setEditLalu] = useState<string | null>(edit?.id ?? null);
  const [galat, setGalat] = useState("");
  const [tersimpan, setTersimpan] = useState(false);
  if ((edit?.id ?? null) !== editLalu) {
    // Pindah dari mode ubah ke catat baru (atau sebaliknya)
    setEditLalu(edit?.id ?? null);
    setDraf(edit ? { ...edit, keDompet: edit.keDompet ?? "" } : drafBaru(data));
    setGalat("");
  }
  const ubah = (p: Partial<Draf>) => {
    setTersimpan(false);
    setDraf((x) => ({ ...x, ...p }));
  };
  const gantiJenis = (j: Jenis) => {
    const b = drafBaru(data, j);
    ubah({ jenis: j, kategori: b.kategori, keDompet: draf.dompet === b.keDompet ? b.dompet : b.keDompet });
  };
  const daftarKat = draf.jenis === "masuk" ? KATEGORI_MASUK : KATEGORI_KELUAR;
  const opsiDompet = data.dompet.map((d) => ({ v: d.id, label: d.nama }));
  if (!data.dompet.some((d) => d.id === draf.dompet)) opsiDompet.push({ v: draf.dompet, label: "Tanpa dompet" });

  const simpan = () => {
    if (!(draf.jumlah > 0)) return setGalat("Isi nominalnya dulu, lebih dari Rp 0.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draf.tanggal)) return setGalat("Pilih tanggalnya dulu.");
    if (data.dompet.length === 0) return setGalat("Tambahkan dompet dulu di tab Profil.");
    if (draf.jenis === "pindah" && draf.dompet === draf.keDompet) return setGalat("Dompet asal dan tujuan harus berbeda.");
    setGalat("");
    onSimpan(draf);
    if (!edit) {
      setDraf((x) => ({ ...drafBaru(data, x.jenis), dompet: x.dompet, keDompet: x.keDompet, tanggal: x.tanggal }));
      setTersimpan(true);
    }
  };

  return (
    <Card title={edit ? "Ubah transaksi" : "Catat transaksi"} hint={edit ? undefined : "Nominal pakai titik ribuan, misalnya 15.000."}>
      <div className={st.stack} id="form-transaksi">
        <div className={st.seg}>
        <Tabs<Jenis>
          value={draf.jenis}
          onChange={gantiJenis}
          items={[
            { id: "keluar", label: "Pengeluaran" },
            { id: "masuk", label: "Pemasukan" },
            { id: "pindah", label: "Pindah dana" },
          ]}
        />
        </div>
        <NumInput money label="Nominal" value={draf.jumlah} max={1_000_000_000_000} onChange={(n) => ubah({ jumlah: n })} />
        {draf.jenis !== "pindah" && (
          <div>
            <div className={k.label} id="lbl-kat" style={{ marginBottom: 8 }}>
              Kategori
            </div>
            <div className={st.catGrid} role="radiogroup" aria-labelledby="lbl-kat">
              {daftarKat.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={draf.kategori === c.id}
                  className={`${st.catBtn} ${draf.kategori === c.id ? st.catOn : ""}`}
                  onClick={() => ubah({ kategori: c.id })}
                >
                  <span aria-hidden="true">{c.ikon}</span>
                  {c.nama}
                </button>
              ))}
            </div>
          </div>
        )}
        <Grid keep>
          <DateInput label="Tanggal" value={draf.tanggal} onChange={(v) => ubah({ tanggal: v })} />
          <Select<string>
            label={draf.jenis === "masuk" ? "Masuk ke dompet" : "Dari dompet"}
            value={draf.dompet}
            options={opsiDompet}
            onChange={(v) => ubah({ dompet: v })}
          />
        </Grid>
        {draf.jenis === "pindah" && (
          <Select<string> label="Ke dompet" value={draf.keDompet} options={opsiDompet} onChange={(v) => ubah({ keDompet: v })} />
        )}
        <TextInput
          label="Catatan (opsional)"
          placeholder={draf.jenis === "pindah" ? "Contoh: isi GoPay untuk jajan" : "Contoh: makan siang kantin"}
          value={draf.catatan}
          maxLength={80}
          onChange={(v) => ubah({ catatan: v })}
        />
        {galat && (
          <p className={st.err} role="alert">
            {galat}
          </p>
        )}
        {tersimpan && !galat && <Badge tone="good" text="Tersimpan. Transaksi terbaru ada di paling atas." />}
        <div className={st.formBtns}>
          {edit && onBatal && (
            <Button onClick={onBatal} variant="ghost">
              Batal
            </Button>
          )}
          <Button variant="solid" onClick={simpan}>
            {edit ? "Simpan perubahan" : "Simpan"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------- Baris transaksi ----------
function BarisTx({ t, data, onUbah, onHapus }: { t: Transaksi; data: DataStuney; onUbah?: () => void; onHapus?: () => void }) {
  const kat = cariKategori(t.jenis, t.kategori);
  const tanda = t.jenis === "masuk" ? "+" : t.jenis === "keluar" ? "-" : "";
  const kelas = t.jenis === "masuk" ? st.pos : t.jenis === "keluar" ? st.neg : st.move;
  const dompetTeks = t.jenis === "pindah" ? `${namaDompet(data, t.dompet)} ke ${namaDompet(data, t.keDompet)}` : namaDompet(data, t.dompet);
  return (
    <div className={st.tx}>
      <div className={st.txIcon} aria-hidden="true">
        {kat.ikon}
      </div>
      <div className={st.txMid}>
        <div className={st.txCat}>{kat.nama}</div>
        <div className={st.txNote}>{[t.catatan, dompetTeks].filter(Boolean).join(" · ")}</div>
      </div>
      <div className={st.txRight}>
        <span className={`${st.amt} ${kelas}`}>
          {tanda}
          {rp(t.jumlah)}
        </span>
        <span className={st.date}>{tglPendek(t.tanggal)}</span>
        {(onUbah || onHapus) && (
          <span className={`${st.txActs} no-print`}>
            {onUbah && (
              <button type="button" className={st.linkBtn} onClick={onUbah} aria-label={`Ubah transaksi ${kat.nama} ${rp(t.jumlah)}`}>
                Ubah
              </button>
            )}
            {onHapus && <RemoveBtn label={`Hapus transaksi ${kat.nama} ${rp(t.jumlah)}`} onClick={onHapus} />}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------- Donat laporan ----------
function Donat({ items, total }: { items: { nama: string; jumlah: number; slot: string }[]; total: number }) {
  let jalan = 0;
  return (
    <div className={`${k.viz} ${st.donutWrap}`}>
      <svg viewBox="0 0 42 42" role="img" aria-label={`Pengeluaran per kategori, total ${rp(total)}`}>
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--panel-2)" strokeWidth="6" />
        {total > 0 &&
          items.map((it) => {
            const p = (it.jumlah / total) * 100;
            const el = (
              <circle
                key={it.nama}
                cx="21"
                cy="21"
                r="15.9155"
                fill="none"
                stroke={it.slot}
                strokeWidth="6"
                strokeDasharray={`${Math.max(0, p - 0.6)} ${100 - Math.max(0, p - 0.6)}`}
                strokeDashoffset={-jalan}
              />
            );
            jalan += p;
            return el;
          })}
      </svg>
      <div className={st.donutMid}>
        <small>Total keluar</small>
        <b>{rp(total)}</b>
      </div>
    </div>
  );
}

const SLOT = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)", "var(--s5)", "var(--s6)"];

// ---------- Komponen utama ----------
export default function Stuney() {
  const [data, setData, reset] = useToolState<DataStuney>("stuney", "data-v1", kosong());
  const [tab, setTab] = useState<Tab>("beranda");
  const [editId, setEditId] = useState<string | null>(null);
  const [filterJenis, setFilterJenis] = useState<"semua" | Jenis>("semua");
  const [filterDompet, setFilterDompet] = useState("semua");
  const [filterBulan, setFilterBulan] = useState("semua");
  const [periode, setPeriode] = useState<Periode>("bulanan");
  const [dompetBaru, setDompetBaru] = useState(DOMPET_SIAP[3]);
  const [goalBaru, setGoalBaru] = useState({ nama: "", target: 0, tenggat: "" });
  const [goalGalat, setGoalGalat] = useState("");
  const [setor, setSetor] = useState<Record<string, number>>({});
  const [impor, setImpor] = useState<DataStuney | null>(null);
  const atasRef = useRef<HTMLDivElement>(null);

  const hari = hariIni();
  const bulanIni = bulanDari(hari);
  const tot = useMemo(() => totalSemua(data), [data]);
  const bln = useMemo(() => totalBulan(data, bulanIni), [data, bulanIni]);
  const saldo = useMemo(() => saldoDompet(data), [data]);
  const ag = useMemo(() => anggaranBulan(data, bulanIni), [data, bulanIni]);
  const stk = useMemo(() => streak(data, hari), [data, hari]);
  const lvl = useMemo(() => level(data, hari), [data, hari]);
  const bdg = useMemo(() => lencana(data, hari), [data, hari]);
  const lap = useMemo(() => laporan(data, periode, hari), [data, periode, hari]);
  const perPeruntukan = useMemo(() => saldoPeruntukan(data), [data]);
  const urut = useMemo(() => urutTerbaru(data.transaksi), [data.transaksi]);
  const editTx = editId ? data.transaksi.find((t) => t.id === editId) ?? null : null;

  // Data dari Stuney lama (stuney.founderku.com) dikirim lewat alamat:
  // /tools/stuney#impor=<data>. Bagian setelah # tidak pernah dikirim ke server.
  useEffect(() => {
    const h = window.location.hash;
    if (!h.startsWith("#impor=") || h.length > 3_000_000) return;
    try {
      const mentah = JSON.parse(decodeURIComponent(h.slice(7))) as { nama?: string; data?: unknown };
      const hasil = dariVersiLama((mentah.data ?? {}) as Parameters<typeof dariVersiLama>[0], String(mentah.nama ?? ""));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (hasil.transaksi.length || hasil.target.length) setImpor(hasil);
    } catch {
      // alamat rusak: abaikan
    }
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  const ubahData = (fn: (d: DataStuney) => DataStuney) => setData((d) => ({ ...fn(d), contoh: false }));

  const simpanTx = (draf: Draf) => {
    const isi = {
      jenis: draf.jenis,
      jumlah: Math.round(draf.jumlah),
      kategori: draf.jenis === "pindah" ? "pindah" : draf.kategori,
      dompet: draf.dompet,
      keDompet: draf.jenis === "pindah" ? draf.keDompet : undefined,
      tanggal: draf.tanggal,
      catatan: draf.catatan.trim(),
    };
    if (editId) {
      ubahData((d) => ({ ...d, transaksi: d.transaksi.map((t) => (t.id === editId ? { ...t, ...isi } : t)) }));
      setEditId(null);
    } else {
      ubahData((d) => ({ ...d, transaksi: [...d.transaksi, { ...isi, id: buatId(), dibuat: Date.now() }] }));
    }
  };

  const hapusTx = (t: Transaksi) => {
    if (!window.confirm(`Hapus transaksi ${cariKategori(t.jenis, t.kategori).nama} ${rp(t.jumlah)}?`)) return;
    if (editId === t.id) setEditId(null);
    ubahData((d) => ({ ...d, transaksi: d.transaksi.filter((x) => x.id !== t.id) }));
  };

  const mulaiUbah = (t: Transaksi) => {
    setTab("transaksi");
    setEditId(t.id);
    requestAnimationFrame(() => document.getElementById("form-transaksi")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const pindahTab = (t: Tab) => {
    setTab(t);
    setEditId(null);
    atasRef.current?.scrollIntoView({ block: "nearest" });
  };

  // ----- Daftar transaksi (tab Transaksi) -----
  const daftarBulan = useMemo(() => Array.from(new Set(urut.map((t) => bulanDari(t.tanggal)))), [urut]);
  const tersaring = urut.filter(
    (t) =>
      (filterJenis === "semua" || t.jenis === filterJenis) &&
      (filterDompet === "semua" || t.dompet === filterDompet || t.keDompet === filterDompet) &&
      (filterBulan === "semua" || bulanDari(t.tanggal) === filterBulan),
  );
  const perTanggal: { tanggal: string; isi: Transaksi[] }[] = [];
  for (const t of tersaring) {
    const akhir = perTanggal[perTanggal.length - 1];
    if (akhir && akhir.tanggal === t.tanggal) akhir.isi.push(t);
    else perTanggal.push({ tanggal: t.tanggal, isi: [t] });
  }

  // ----- Kartu ringkas yang dipakai di beberapa tab -----
  const kartuKas = (
    <div className={`${st.kas} ${tot.kas < 0 ? st.kasMinus : ""}`}>
      <span className={st.kasLabel}>Total di Kas</span>
      <span className={st.kasValue}>{rp(tot.kas)}</span>
      <span className={st.kasSub}>Jumlah uang di semua dompet saat ini</span>
    </div>
  );

  const kartuDompet = (
    <Card title="Dompet" hint="Pisahkan uang per dompet supaya jatah kebutuhan tidak terpakai untuk keinginan." right={<Button small variant="ghost" onClick={() => pindahTab("profil")}>Atur</Button>}>
      <div className={st.list}>
        {data.dompet.map((d) => (
          <div key={d.id} className={st.wallet}>
            <span className={st.wName}>
              {d.nama}
              <span className={st.tag}>{labelPeruntukan(d.peruntukan)}</span>
            </span>
            <span className={`${st.wAmt} ${(saldo[d.id] ?? 0) < 0 ? st.neg : ""}`}>{rp(saldo[d.id] ?? 0)}</span>
          </div>
        ))}
        {saldo[TANPA_DOMPET] !== undefined && (
          <div className={st.wallet}>
            <span className={st.wName}>Tanpa dompet</span>
            <span className={st.wAmt}>{rp(saldo[TANPA_DOMPET])}</span>
          </div>
        )}
      </div>
    </Card>
  );

  const kartuAnggaran = (
    <Card title="Anggaran bulan ini" hint={namaBulan(bulanIni)}>
      {ag.batas > 0 ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8, fontSize: 14 }}>
            <span>
              Terpakai <b>{rp(ag.terpakai)}</b>
            </span>
            <Badge tone={ag.persen >= 100 ? "bad" : ag.persen >= 80 ? "warn" : "good"} text={`${nf(ag.persen)}%`} />
          </div>
          <Meter value={ag.persen} label="Anggaran terpakai" />
          <p className={st.small}>
            {ag.persen >= 100 ? `Lewat ${rp(ag.terpakai - ag.batas)} dari batas ${rp(ag.batas)}.` : `Sisa ${rp(ag.sisa)} dari batas ${rp(ag.batas)}.`}
          </p>
        </>
      ) : (
        <>
          <p className={st.small} style={{ marginTop: 0 }}>
            Belum ada batas pengeluaran per bulan.
          </p>
          <div style={{ marginTop: 10 }}>
            <Button small onClick={() => pindahTab("profil")}>
              Atur anggaran
            </Button>
          </div>
        </>
      )}
    </Card>
  );

  const goalAktif = data.target.find((g) => g.terkumpul < g.target) ?? data.target[0];

  const kartuGoal = (g: Target, lengkap: boolean) => {
    const p = g.target > 0 ? (g.terkumpul / g.target) * 100 : 0;
    const selesai = g.target > 0 && g.terkumpul >= g.target;
    const sisaHari = g.tenggat ? Math.ceil((new Date(g.tenggat + "T00:00:00").getTime() - new Date(hari + "T00:00:00").getTime()) / 86400000) : null;
    const sisaBulan = sisaHari !== null && sisaHari > 0 ? Math.max(1, Math.ceil(sisaHari / 30)) : null;
    const perBulan = sisaBulan ? Math.ceil((g.target - g.terkumpul) / sisaBulan) : null;
    return (
      <Card key={g.id} title={lengkap ? undefined : "Target tabungan"} right={lengkap ? undefined : <Button small variant="ghost" onClick={() => pindahTab("tabungan")}>Lihat</Button>}>
        <div className={st.goalTop}>
          <div>
            <div className={st.goalName}>🎯 {g.nama}</div>
            <div className={st.small} style={{ marginTop: 2 }}>
              {selesai
                ? "Target tercapai 🎉"
                : sisaHari === null
                  ? "Tanpa tenggat"
                  : sisaHari > 0
                    ? `${sisaHari} hari lagi · ${tglPendek(g.tenggat)}`
                    : `Lewat tenggat · ${tglPendek(g.tenggat)}`}
            </div>
          </div>
          <Badge tone={selesai ? "good" : "neutral"} text={`${nf(Math.min(100, p))}%`} />
        </div>
        <Meter value={p} label={`Progres ${g.nama}`} />
        <div className={st.goalNums}>
          <span>
            <b>{rp(g.terkumpul)}</b> dari {rp(g.target)}
          </span>
          {!selesai && <span>Kurang {rp(g.target - g.terkumpul)}</span>}
        </div>
        {lengkap && !selesai && perBulan !== null && (
          <p className={st.small} style={{ marginTop: -4, marginBottom: 12 }}>
            Sisihkan sekitar {rp(perBulan)} per bulan supaya tercapai tepat waktu.
          </p>
        )}
        {lengkap && (
          <div className={`${st.goalAdd} no-print`}>
            {!selesai ? (
              <>
                <NumInput money label={`Tambah dana ke ${g.nama}`} value={setor[g.id] ?? 0} onChange={(n) => setSetor((x) => ({ ...x, [g.id]: n }))} />
                <Button
                  onClick={() => {
                    const n = Math.round(setor[g.id] ?? 0);
                    if (n <= 0) return;
                    ubahData((d) => ({ ...d, target: d.target.map((x) => (x.id === g.id ? { ...x, terkumpul: x.terkumpul + n } : x)) }));
                    setSetor((x) => ({ ...x, [g.id]: 0 }));
                  }}
                >
                  Tambah
                </Button>
              </>
            ) : (
              <span />
            )}
            <RemoveBtn
              label={`Hapus target ${g.nama}`}
              onClick={() => {
                if (window.confirm(`Hapus target ${g.nama}?`)) ubahData((d) => ({ ...d, target: d.target.filter((x) => x.id !== g.id) }));
              }}
            />
          </div>
        )}
      </Card>
    );
  };

  // ----- Isi tiap tab -----
  let isi: React.ReactNode = null;

  if (tab === "beranda") {
    isi = (
      <>
        <div className={st.top3}>
          {kartuKas}
          <div className={k.stat}>
            <span className={k.statLabel}>Masuk bulan ini</span>
            <span className={`${k.statValue} ${st.statNum} ${st.pos}`}>{rp(bln.masuk)}</span>
          </div>
          <div className={k.stat}>
            <span className={k.statLabel}>Keluar bulan ini</span>
            <span className={`${k.statValue} ${st.statNum} ${st.neg}`}>{rp(bln.keluar)}</span>
          </div>
        </div>
        <Split
          aside={
            <div className={st.stack}>
              {kartuAnggaran}
              {kartuDompet}
              {goalAktif && kartuGoal(goalAktif, false)}
            </div>
          }
        >
          <FormTransaksi data={data} edit={null} onSimpan={simpanTx} />
          <Card title="Transaksi terbaru" right={urut.length > 6 ? <Button small variant="ghost" onClick={() => pindahTab("transaksi")}>Lihat semua</Button> : undefined}>
            {urut.length === 0 ? (
              <div className={st.empty}>Belum ada transaksi. Catat pengeluaran atau uang saku pertamamu di atas, atau tekan Isi contoh untuk melihat cara kerjanya.</div>
            ) : (
              <div className={st.list}>
                {urut.slice(0, 6).map((t) => (
                  <BarisTx key={t.id} t={t} data={data} onUbah={() => mulaiUbah(t)} />
                ))}
              </div>
            )}
          </Card>
        </Split>
      </>
    );
  } else if (tab === "transaksi") {
    isi = (
      <Split
        aside={<FormTransaksi data={data} edit={editTx} onSimpan={simpanTx} onBatal={() => setEditId(null)} />}
      >
        <Card title="Semua transaksi" hint={`${tersaring.length} transaksi, terbaru di atas`}>
          <div className={`${st.filters} no-print`}>
            <Select<"semua" | Jenis>
              label="Jenis"
              value={filterJenis}
              onChange={setFilterJenis}
              options={[
                { v: "semua", label: "Semua jenis" },
                { v: "keluar", label: "Pengeluaran" },
                { v: "masuk", label: "Pemasukan" },
                { v: "pindah", label: "Pindah dana" },
              ]}
            />
            <Select<string> label="Dompet" value={filterDompet} options={[{ v: "semua", label: "Semua dompet" }, ...data.dompet.map((d) => ({ v: d.id, label: d.nama }))]} onChange={setFilterDompet} />
            <Select<string> label="Bulan" value={filterBulan} options={[{ v: "semua", label: "Semua bulan" }, ...daftarBulan.map((b) => ({ v: b, label: namaBulan(b) }))]} onChange={setFilterBulan} />
          </div>
          {perTanggal.length === 0 ? (
            <div className={st.empty}>{data.transaksi.length ? "Tidak ada transaksi yang cocok dengan pilihan ini." : "Belum ada transaksi."}</div>
          ) : (
            perTanggal.map((g) => (
              <div key={g.tanggal}>
                <div className={st.day}>{tglPanjang(g.tanggal)}</div>
                <div className={st.list}>
                  {g.isi.map((t) => (
                    <BarisTx key={t.id} t={t} data={data} onUbah={() => mulaiUbah(t)} onHapus={() => hapusTx(t)} />
                  ))}
                </div>
              </div>
            ))
          )}
        </Card>
      </Split>
    );
  } else if (tab === "tabungan") {
    isi = (
      <Split
        aside={
          <Card title="Target baru" hint="Misalnya laptop, study tour, atau dana darurat.">
            <div className={st.stack}>
              <TextInput label="Nama target" placeholder="Contoh: Laptop baru" value={goalBaru.nama} maxLength={40} onChange={(v) => setGoalBaru((x) => ({ ...x, nama: v }))} />
              <NumInput money label="Nominal target" value={goalBaru.target} onChange={(n) => setGoalBaru((x) => ({ ...x, target: n }))} />
              <DateInput label="Tenggat (opsional)" value={goalBaru.tenggat} onChange={(v) => setGoalBaru((x) => ({ ...x, tenggat: v }))} />
              {goalGalat && (
                <p className={st.err} role="alert">
                  {goalGalat}
                </p>
              )}
              <div className={st.formBtns}>
                <Button
                  variant="solid"
                  onClick={() => {
                    if (!goalBaru.nama.trim()) return setGoalGalat("Isi nama targetnya dulu.");
                    if (!(goalBaru.target > 0)) return setGoalGalat("Isi nominal target, lebih dari Rp 0.");
                    setGoalGalat("");
                    ubahData((d) => ({ ...d, target: [...d.target, { id: buatId(), nama: goalBaru.nama.trim(), target: Math.round(goalBaru.target), terkumpul: 0, tenggat: goalBaru.tenggat }] }));
                    setGoalBaru({ nama: "", target: 0, tenggat: "" });
                  }}
                >
                  Buat target
                </Button>
              </div>
            </div>
          </Card>
        }
      >
        {data.target.length === 0 ? (
          <Card>
            <div className={st.empty}>Belum ada target tabungan. Buat target pertamamu di samping.</div>
          </Card>
        ) : (
          data.target.map((g) => kartuGoal(g, true))
        )}
        <Note>Dana target dicatat terpisah dari Total di Kas. Kalau uangnya kamu pindahkan ke rekening tabungan, catat juga sebagai Pindah dana.</Note>
      </Split>
    );
  } else if (tab === "laporan") {
    const utama = lap.kategori.slice(0, 5);
    const sisa = lap.kategori.slice(5).reduce((a, b) => a + b.jumlah, 0);
    const itemDonat = [
      ...utama.map((c, i) => ({ nama: c.kat.nama, jumlah: c.jumlah, slot: SLOT[i], ikon: c.kat.ikon, persen: c.persen })),
      ...(sisa > 0 ? [{ nama: "Kategori lain", jumlah: sisa, slot: "var(--faint)", ikon: "📦", persen: (sisa / lap.keluar) * 100 }] : []),
    ];
    const judulPeriode = periode === "mingguan" ? `${tglPendek(lap.mulai)} sampai ${tglPendek(lap.akhir)}` : namaBulan(bulanIni);
    isi = (
      <>
        <div className={st.tabsWrap}>
          <Tabs<Periode>
            value={periode}
            onChange={setPeriode}
            items={[
              { id: "mingguan", label: "7 hari terakhir" },
              { id: "bulanan", label: "Bulan ini" },
            ]}
          />
        </div>
        <div className={st.top3}>
          {kartuKas}
          <div className={k.stat}>
            <span className={k.statLabel}>Pemasukan</span>
            <span className={`${k.statValue} ${st.statNum} ${st.pos}`}>{rp(lap.masuk)}</span>
            <span className={k.statSub}>{judulPeriode}</span>
          </div>
          <div className={k.stat}>
            <span className={k.statLabel}>Pengeluaran</span>
            <span className={`${k.statValue} ${st.statNum} ${st.neg}`}>{rp(lap.keluar)}</span>
            <span className={k.statSub}>{judulPeriode}</span>
          </div>
        </div>
        <Split
          aside={
            <div className={st.stack}>
              <Card title="Keluar per dompet" hint={judulPeriode}>
                {Object.keys(lap.perDompet).length === 0 ? (
                  <div className={st.empty}>Belum ada pengeluaran.</div>
                ) : (
                  <div className={st.list}>
                    {Object.entries(lap.perDompet)
                      .sort((a, b) => b[1] - a[1])
                      .map(([id, n]) => (
                        <div key={id} className={st.wallet}>
                          <span className={st.wName}>{namaDompet(data, id)}</span>
                          <span className={st.wAmt}>{rp(n)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
              <Card title="Uang per peruntukan" hint="Saldo dompet dikelompokkan sesuai tujuannya.">
                <div className={st.list}>
                  {PERUNTUKAN.filter((p) => perPeruntukan[p.v] !== 0 || data.dompet.some((d) => d.peruntukan === p.v)).map((p) => (
                    <div key={p.v} className={st.wallet}>
                      <span className={st.wName}>{p.label}</span>
                      <span className={`${st.wAmt} ${perPeruntukan[p.v] < 0 ? st.neg : ""}`}>{rp(perPeruntukan[p.v])}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          }
        >
          <Card title="Pengeluaran per kategori" hint={judulPeriode}>
            {lap.keluar === 0 ? (
              <div className={st.empty}>Belum ada pengeluaran di periode ini.</div>
            ) : (
              <>
                <Donat items={itemDonat} total={lap.keluar} />
                <div className={`${k.viz} ${st.legend}`}>
                  {itemDonat.map((it) => (
                    <FragmentLegend key={it.nama} ikon={it.ikon} nama={it.nama} slot={it.slot} persen={it.persen} jumlah={it.jumlah} />
                  ))}
                </div>
                {lap.perubahan !== null && (
                  <p className={st.delta}>
                    <Badge
                      tone={lap.perubahan > 0 ? "warn" : "good"}
                      text={`${lap.perubahan > 0 ? "Naik" : "Turun"} ${nf(Math.abs(lap.perubahan))}%`}
                    />{" "}
                    dibanding {periode === "mingguan" ? "7 hari sebelumnya" : "bulan lalu"} ({rp(lap.keluarLalu)}).
                  </p>
                )}
              </>
            )}
          </Card>
          {lap.masuk > 0 && (
            <Verdict tone={lap.selisih >= 0 ? "good" : "bad"} title={lap.selisih >= 0 ? "Pemasukan lebih besar" : "Pengeluaran lebih besar"}>
              <p>
                {lap.selisih >= 0
                  ? `Di periode ini kamu masih sisa ${rp(lap.selisih)}. Pertimbangkan pindahkan sebagian ke dompet tabungan.`
                  : `Pengeluaran melebihi pemasukan ${rp(-lap.selisih)}. Cek kategori terbesar di atas.`}
              </p>
            </Verdict>
          )}
        </Split>
      </>
    );
  } else {
    const opsiSiap = DOMPET_SIAP.filter((n) => !data.dompet.some((d) => d.nama.toLowerCase() === n.toLowerCase()));
    isi = (
      <Split
        aside={
          <div className={st.stack}>
            <Card title="Profil">
              <div className={st.stack}>
                <TextInput label="Nama panggilan" placeholder="Contoh: Adinda" value={data.nama} maxLength={30} onChange={(v) => setData((d) => ({ ...d, nama: v }))} />
                <NumInput money label="Batas pengeluaran per bulan" hint="Kosongkan kalau belum mau pakai anggaran." value={data.anggaran} onChange={(n) => ubahData((d) => ({ ...d, anggaran: Math.round(n) }))} />
              </div>
            </Card>
            <Card title="Kelola dompet" hint="Tidak terhubung ke aplikasi aslinya. Hanya untuk memisahkan catatan uangmu.">
              <div className={st.stack}>
                {data.dompet.map((d) => (
                  <div key={d.id} className={st.walletEdit}>
                    <TextInput
                      label={`Nama dompet ${d.nama}`}
                      hideLabel
                      value={d.nama}
                      maxLength={24}
                      onChange={(v) => ubahData((x) => ({ ...x, dompet: x.dompet.map((y) => (y.id === d.id ? { ...y, nama: v } : y)) }))}
                    />
                    <Select<Peruntukan>
                      label={`Peruntukan ${d.nama}`}
                      hideLabel
                      value={d.peruntukan}
                      options={PERUNTUKAN.map((p) => ({ v: p.v, label: p.label }))}
                      onChange={(v) => ubahData((x) => ({ ...x, dompet: x.dompet.map((y) => (y.id === d.id ? { ...y, peruntukan: v } : y)) }))}
                    />
                    <RemoveBtn
                      label={`Hapus dompet ${d.nama}`}
                      onClick={() => {
                        const dipakai = data.transaksi.some((t) => t.dompet === d.id || t.keDompet === d.id);
                        if (data.dompet.length <= 1) return window.alert("Minimal harus ada satu dompet.");
                        if (window.confirm(dipakai ? `Hapus dompet ${d.nama}? Transaksinya tetap ada dan masuk ke "Tanpa dompet".` : `Hapus dompet ${d.nama}?`))
                          ubahData((x) => ({ ...x, dompet: x.dompet.filter((y) => y.id !== d.id) }));
                      }}
                    />
                  </div>
                ))}
                {data.dompet.length < 12 && (
                  <div className={`${st.addRow} no-print`}>
                    <Select<string>
                      label="Tambah dompet"
                      value={opsiSiap.includes(dompetBaru) ? dompetBaru : opsiSiap[0] ?? "Dompet baru"}
                      options={[...opsiSiap.map((n) => ({ v: n, label: n })), { v: "Dompet baru", label: "Nama lain" }]}
                      onChange={setDompetBaru}
                    />
                    <Button
                      onClick={() => {
                        const nama = opsiSiap.includes(dompetBaru) ? dompetBaru : opsiSiap[0] ?? "Dompet baru";
                        const baru: Dompet = { id: buatId(), nama, peruntukan: "campur" };
                        ubahData((x) => ({ ...x, dompet: [...x.dompet, baru] }));
                      }}
                    >
                      + Tambah
                    </Button>
                  </div>
                )}
              </div>
            </Card>
            <p className={st.credit}>
              Stuney awalnya dibuat oleh Adinda Enklly Tri Fauziah sebagai proyek Founterns 2026, lalu jadi bagian dari Founderku Tools.
            </p>
          </div>
        }
      >
        <Card>
          <div className={k.statLabel}>Financial Level</div>
          <div className={st.level}>{lvl.nama}</div>
          <p className={st.levelKet}>{lvl.ket}</p>
          <Meter value={lvl.progres * 100} label="Progres level" />
          <p className={st.small}>{lvl.berikut ? `${lvl.dapat} dari ${lvl.berikut.min} lencana menuju ${lvl.berikut.nama}` : "Level tertinggi tercapai 🎉"}</p>
        </Card>
        <Card title={`🔥 Saving streak: ${stk.jumlah} hari`} hint="Catat minimal satu transaksi setiap hari supaya streak tidak putus.">
          <div className={st.days}>
            {stk.tujuh.map((d) => {
              const [y, m, dd] = d.tanggal.split("-").map(Number);
              const lbl = new Date(y, m - 1, dd).toLocaleDateString("id-ID", { weekday: "short" });
              return (
                <div key={d.tanggal} className={`${st.dayDot} ${d.isi ? st.dayHit : ""}`}>
                  <i aria-hidden="true">{d.isi ? "✓" : ""}</i>
                  <span>
                    {lbl}
                    <span className={k.srOnly}>{d.isi ? " ada catatan" : " belum ada catatan"}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Lencana" hint={`${bdg.filter((b) => b.dapat).length} dari ${bdg.length} terbuka`}>
          <div className={st.badges}>
            {bdg.map((b) => (
              <div key={b.id} className={`${st.bdg} ${b.dapat ? "" : st.bdgOff}`}>
                <span aria-hidden="true">{b.ikon}</span>
                <b>{b.judul}</b>
                <small>{b.ket}</small>
                <span className={st.bdgState}>{b.dapat ? "✓ Terbuka" : "Terkunci"}</span>
              </div>
            ))}
          </div>
        </Card>
      </Split>
    );
  }

  return (
    <ToolShell
      eyebrow="Founderku Tools · Keuangan Pribadi"
      title="Stuney"
      desc="Catat uang saku dan pengeluaran, pisahkan uang per dompet (tunai, GoPay, OVO, bank), dan kejar target tabungan. Dibuat untuk pelajar dan mahasiswa."
      actions={<StdActions onContoh={() => reset(contoh())} onReset={() => { setEditId(null); reset(); }} />}
    >
      <div ref={atasRef} />
      {impor && (
        <div style={{ marginBottom: 16 }}>
          <Verdict tone="neutral" title="Data dari Stuney versi lama ditemukan">
            <p>
              {impor.transaksi.length} transaksi dan {impor.target.length} target tabungan dari stuney.founderku.com. Semua transaksi lama masuk ke dompet
              Tunai, nanti bisa kamu ubah satu per satu.
            </p>
            <div className={st.formBtns} style={{ marginTop: 10 }}>
              <Button variant="ghost" onClick={() => setImpor(null)}>
                Abaikan
              </Button>
              <Button
                variant="solid"
                onClick={() => {
                  setData((d) => {
                    const kosongSaja = d.contoh || (d.transaksi.length === 0 && d.target.length === 0);
                    if (kosongSaja) return { ...impor, contoh: false };
                    const ada = new Set(d.dompet.map((x) => x.id));
                    return {
                      ...d,
                      nama: d.nama || impor.nama,
                      anggaran: d.anggaran || impor.anggaran,
                      dompet: ada.has("tunai") ? d.dompet : [...d.dompet, { id: "tunai", nama: "Tunai", peruntukan: "kebutuhan" }],
                      transaksi: [...d.transaksi, ...impor.transaksi],
                      target: [...d.target, ...impor.target],
                      contoh: false,
                    };
                  });
                  setImpor(null);
                }}
              >
                Impor ke sini
              </Button>
            </div>
          </Verdict>
        </div>
      )}
      {data.contoh && (
        <div className={`${st.banner} no-print`}>
          <span>Ini data contoh supaya kamu bisa lihat cara kerjanya.</span>
          <Button small onClick={() => { setEditId(null); reset(); }}>
            Mulai kosong
          </Button>
        </div>
      )}
      <div className={st.hello}>
        <div className={st.hi}>
          Halo,
          <b>{data.nama.trim() || "kamu"} 👋</b>
        </div>
        <div className={st.chips}>
          <span className={st.chip} title="Hari berturut-turut mencatat">
            🔥 {stk.jumlah} hari
          </span>
          <span className={st.chip}>🏅 {lvl.nama}</span>
        </div>
      </div>
      <div className={`${st.tabsWrap} ${st.mainTabs} no-print`}>
        <Tabs<Tab> value={tab} onChange={pindahTab} items={TABS} />
      </div>
      {isi}
    </ToolShell>
  );
}

function FragmentLegend({ ikon, nama, slot, persen, jumlah }: { ikon: string; nama: string; slot: string; persen: number; jumlah: number }) {
  return (
    <>
      <span className={st.dotC} style={{ background: slot }} aria-hidden="true" />
      <span>
        {ikon} {nama}
      </span>
      <span className={st.pct}>{nf(persen)}%</span>
      <span className={st.wAmt}>{rp(jumlah)}</span>
    </>
  );
}
