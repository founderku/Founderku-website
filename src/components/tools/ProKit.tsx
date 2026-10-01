"use client";

// Fitur Pro yang dipakai bersama semua tools:
// - Hasil cetak / PDF: akun Free (dan tamu) dapat catatan kecil "Dibuat
//   dengan Founderku" di bawah setiap halaman. Akun Pro bersih, dan bisa
//   memasang logo usaha di kepala dokumen.
// - Logo usaha disimpan sekali (kunci "brand-logo-v1"), dipakai di semua
//   tools, dan ikut tersimpan ke akun lewat cloud.ts.

import { useCallback, useEffect, useRef, useState } from "react";
import { catatPerubahan, dengarPaket, type Paket } from "@/lib/tools/cloud";
import {
  PROYEK_FREE,
  PROYEK_MAKS,
  buatProyek,
  daftarProyek,
  dengarProyek,
  gantiNamaProyek,
  hapusProyek,
  pilihProyek,
  proyekAktif,
} from "@/lib/tools/proyek";
import type { ToolId } from "@/lib/tools/registry";
import plans from "@public/data/plans.json";
import { PRICING } from "@/lib/pricing";
import styles from "./ToolFrame.module.css";

export const LOGO_KEY = "brand-logo-v1";
const EVENT_LOGO = "fk:logo";
// Logo diperkecil supaya ringan disimpan (maks lebar/tinggi 360 px)
const LOGO_MAKS = 360;

// Jendela kecil tertutup saat klik di luar atau tekan Esc
function useTutupLuar(buka: boolean, tutup: () => void) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!buka) return;
    const klik = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) tutup();
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutup();
    };
    document.addEventListener("mousedown", klik);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", klik);
      document.removeEventListener("keydown", esc);
    };
  }, [buka, tutup]);
  return ref;
}

export function usePaket(): Paket {
  const [p, setP] = useState<Paket>("memuat");
  useEffect(() => dengarPaket(setP), []);
  return p;
}

function bacaLogo(): string | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(LOGO_KEY) || "null");
    return typeof v === "string" && v.startsWith("data:image/") ? v : null;
  } catch {
    return null;
  }
}

export function useLogo(): string | null {
  const [logo, setLogo] = useState<string | null>(null);
  useEffect(() => {
    const muat = () => setLogo(bacaLogo());
    muat();
    window.addEventListener(EVENT_LOGO, muat);
    return () => window.removeEventListener(EVENT_LOGO, muat);
  }, []);
  return logo;
}

function simpanLogo(dataUrl: string | null) {
  try {
    if (dataUrl) window.localStorage.setItem(LOGO_KEY, JSON.stringify(dataUrl));
    else window.localStorage.removeItem(LOGO_KEY);
    catatPerubahan(LOGO_KEY);
  } catch {
    // penyimpanan penuh: logo hanya berlaku selama halaman terbuka
  }
  window.dispatchEvent(new Event(EVENT_LOGO));
}

// Gambar dari HP/laptop diperkecil lewat canvas, hasilnya PNG data URL
function kecilkan(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return reject(new Error("format"));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const skala = Math.min(1, LOGO_MAKS / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * skala));
      c.height = Math.max(1, Math.round(img.height * skala));
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("rusak"));
    };
    img.src = url;
  });
}

// Tanda di hasil cetak (tidak terlihat di layar). Dipasang sekali di ToolFrame.
export function TandaCetak() {
  const paket = usePaket();
  const logo = useLogo();
  const pro = paket === "pro";
  return (
    <>
      {pro && logo && (
        <div className={styles.cetakLogo} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" />
        </div>
      )}
      {!pro && (
        <div className={styles.cetakKaki} aria-hidden="true">
          Dibuat dengan Founderku · founderku.com
        </div>
      )}
    </>
  );
}

// Tombol "Logo usaha" di samping tombol cetak. Pro: unggah / ganti / hapus.
// Selain Pro: menjelaskan bahwa ini fitur Pro.
export function TombolLogo({ className }: { className?: string }) {
  const paket = usePaket();
  const logo = useLogo();
  const input = useRef<HTMLInputElement>(null);
  const [buka, setBuka] = useState(false);
  const tutup = useCallback(() => setBuka(false), []);
  const luar = useTutupLuar(buka, tutup);
  const [pesan, setPesan] = useState("");
  const pro = paket === "pro";

  async function pilih(f: File | undefined) {
    if (!f) return;
    setPesan("");
    try {
      simpanLogo(await kecilkan(f));
      setPesan("Logo terpasang. Akan muncul di hasil cetak / PDF.");
    } catch {
      setPesan("Pakai gambar PNG, JPG, atau WEBP.");
    }
  }

  return (
    <span className={styles.logoWrap} ref={luar}>
      <button type="button" className={className} onClick={() => setBuka((v) => !v)} aria-expanded={buka}>
        {pro ? (logo ? "Logo usaha ✓" : "Logo usaha") : "Logo usaha · Pro"}
      </button>
      {buka && (
        <span className={styles.logoPop} role="dialog" aria-label="Logo usaha">
          {pro ? (
            <>
              <b>Logo di hasil PDF</b>
              <small>Logo dipakai di semua tools dan tersimpan di akunmu.</small>
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Logo usaha saat ini" className={styles.logoPrev} />
              )}
              <input
                ref={input}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(e) => {
                  void pilih(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <span className={styles.logoAksi}>
                <button type="button" onClick={() => input.current?.click()}>
                  {logo ? "Ganti logo" : "Unggah logo"}
                </button>
                {logo && (
                  <button type="button" onClick={() => simpanLogo(null)}>
                    Hapus
                  </button>
                )}
              </span>
              {pesan && <small>{pesan}</small>}
            </>
          ) : (
            <>
              <b>Fitur Founderku Pro</b>
              <small>
                Dengan Pro, hasil PDF bersih tanpa catatan Founderku dan bisa memakai logo usahamu sendiri.
              </small>
              <a href="/harga">Lihat harga</a>
            </>
          )}
        </span>
      )}
    </span>
  );
}

// Pemilih proyek di bar atas tool (tools template kit)
export function PilihProyek({ toolId }: { toolId: ToolId }) {
  const paket = usePaket();
  const [buka, setBuka] = useState(false);
  const tutup = useCallback(() => setBuka(false), []);
  const luar = useTutupLuar(buka, tutup);
  const [, segarkan] = useState(0);
  const [kunciPro, setKunciPro] = useState(false);
  useEffect(() => dengarProyek(toolId, () => segarkan((n) => n + 1)), [toolId]);

  // Dibaca setiap render (localStorage), aman karena bar baru tampil setelah sinkron
  const list = typeof window === "undefined" ? [] : daftarProyek(toolId);
  const aktif = typeof window === "undefined" ? "1" : proyekAktif(toolId);
  const sekarang = list.find((p) => p.id === aktif) ?? list[0];
  const bolehBaru = paket === "pro" ? list.length < PROYEK_MAKS : list.length < PROYEK_FREE;

  if (!sekarang) return null;
  return (
    <span className={styles.logoWrap} ref={luar}>
      <button type="button" className={styles.proyekBtn} onClick={() => setBuka((v) => !v)} aria-expanded={buka}>
        <span className={styles.proyekNama}>{sekarang.nama}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {buka && (
        <span className={`${styles.logoPop} ${styles.proyekPop}`} role="dialog" aria-label="Proyek">
          <b>Proyek di tool ini</b>
          <span className={styles.proyekList}>
            {list.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-current={p.id === aktif ? "true" : undefined}
                onClick={() => {
                  pilihProyek(toolId, p.id);
                  setBuka(false);
                }}
              >
                {p.nama}
              </button>
            ))}
          </span>
          {bolehBaru ? (
            <button
              type="button"
              className={styles.proyekBaru}
              onClick={() => {
                const n = window.prompt("Nama proyek baru", `Proyek ${list.length + 1}`);
                if (n === null) return;
                buatProyek(toolId, n);
                setBuka(false);
              }}
            >
              + Proyek baru
            </button>
          ) : (
            <button type="button" className={styles.proyekBaru} onClick={() => setKunciPro((v) => !v)}>
              + Proyek baru · Pro
            </button>
          )}
          {kunciPro && !bolehBaru && (
            <small>
              {paket === "pro"
                ? `Maksimal ${PROYEK_MAKS} proyek per tool.`
                : "Akun gratis punya 1 proyek per tool. Dengan Founderku Pro, buat proyek sebanyak yang kamu butuh dan semuanya tersimpan di akun."}
              {paket !== "pro" && (
                <>
                  {" "}
                  <a href="/harga">Lihat harga</a>
                </>
              )}
            </small>
          )}
          <span className={styles.logoAksi}>
            <button
              type="button"
              onClick={() => {
                const n = window.prompt("Ganti nama proyek", sekarang.nama);
                if (n) gantiNamaProyek(toolId, sekarang.id, n);
              }}
            >
              Ganti nama
            </button>
            {sekarang.id !== "1" && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Hapus "${sekarang.nama}" beserta isinya?`)) {
                    hapusProyek(toolId, sekarang.id);
                    setBuka(false);
                  }
                }}
              >
                Hapus
              </button>
            )}
          </span>
        </span>
      )}
    </span>
  );
}

// Tombol "Isi dengan AI" (Pro). Hasil dari server sudah diperiksa bentuknya;
// tool sendiri yang memutuskan cara memasukkan (onIsi), biasanya hanya ke
// kolom yang masih kosong supaya tulisan user tidak tertimpa.
export function TombolAI({
  toolId,
  className,
  contohIde,
  konteks,
  onIsi,
}: {
  toolId: ToolId;
  className?: string;
  contohIde: string;
  konteks?: Record<string, string>;
  onIsi: (isi: Record<string, unknown>) => void;
}) {
  const paket = usePaket();
  const [buka, setBuka] = useState(false);
  const tutup = useCallback(() => setBuka(false), []);
  const luar = useTutupLuar(buka, tutup);
  const [ide, setIde] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");

  async function kirim() {
    setSibuk(true);
    setPesan("");
    try {
      const res = await fetch("/api/ai/isi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool: toolId, ide, konteks }),
      });
      const j = (await res.json().catch(() => ({}))) as { isi?: Record<string, unknown>; error?: string; remaining?: number };
      if (res.ok && j.isi) {
        onIsi(j.isi);
        setPesan(`Draf terisi di kolom yang masih kosong. Cek dan sesuaikan ya. Sisa jatah AI hari ini: ${j.remaining ?? 0}.`);
        return;
      }
      setPesan(
        j.error === "jatah_habis"
          ? "Jatah AI hari ini sudah habis. Coba lagi besok."
          : j.error === "khusus_pro"
            ? "Fitur ini khusus Founderku Pro."
            : j.error === "belum_login"
              ? "Masuk dulu untuk memakai AI."
              : j.error === "isi_tidak_sah"
                ? "Ceritakan idemu minimal satu kalimat."
                : "AI sedang sibuk. Coba lagi sebentar lagi.",
      );
    } catch {
      setPesan("Koneksi bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <span className={styles.logoWrap} ref={luar}>
      <button type="button" className={className} onClick={() => setBuka((v) => !v)} aria-expanded={buka}>
        {paket === "pro" ? "Isi dengan AI" : "Isi dengan AI · Pro"}
      </button>
      {buka && (
        <span className={`${styles.logoPop} ${styles.aiPop}`} role="dialog" aria-label="Isi dengan AI">
          {paket === "pro" ? (
            <>
              <b>Isi draf dengan AI</b>
              <small>Ceritakan idemu dalam 2 sampai 3 kalimat. AI hanya mengisi kolom yang masih kosong.</small>
              <textarea
                className={styles.aiInput}
                value={ide}
                maxLength={600}
                rows={4}
                placeholder={contohIde}
                onChange={(e) => setIde(e.target.value)}
              />
              <span className={styles.logoAksi}>
                <button type="button" disabled={sibuk || ide.trim().length < 10} onClick={() => void kirim()}>
                  {sibuk ? "Menyusun draf..." : "Buat draf"}
                </button>
              </span>
              {pesan && <small role="status">{pesan}</small>}
            </>
          ) : paket === "tamu" ? (
            <>
              <b>Fitur Founderku Pro</b>
              <small>AI menyusun draf awal dari ide singkatmu. Masuk dulu, lalu coba gratis selama masa trial.</small>
              <a href={`/masuk?next=${encodeURIComponent(`/tools/${toolId}`)}`}>Masuk</a>
            </>
          ) : (
            <>
              <b>Fitur Founderku Pro</b>
              <small>Dengan Pro, AI menyusun draf awal tool ini dari ide singkatmu, jadi kamu tinggal merapikan.</small>
              <a href="/harga">Lihat harga</a>
            </>
          )}
        </span>
      )}
    </span>
  );
}

// Bantu tools: isi hanya kolom teks yang masih kosong
export function isiYangKosong(lama: Record<string, string>, baru: unknown): Record<string, string> {
  const hasil = { ...lama };
  if (baru && typeof baru === "object") {
    for (const [k, v] of Object.entries(baru as Record<string, unknown>)) {
      if (typeof v === "string" && v && !(hasil[k] ?? "").trim()) hasil[k] = v;
    }
  }
  return hasil;
}

// ---- Penjelasan Gratis vs Pro di tiap tool (sumber: public/data/plans.json) ----

type Baris = { id: string };
export function fiturPaket(toolId: string) {
  const b = plans.baris as unknown as Record<string, Record<string, Baris>>;
  const ada = (list: string[]) => list.includes(toolId);
  const gratis = [b.inti.free.id, b.simpan.free.id];
  const pro = [b.simpan.pro.id];
  const pendek = [plans.pendek.simpan];
  if (ada(plans.proyekTools)) {
    gratis.push(b.proyek.free.id);
    pro.push(b.proyek.pro.id);
    pendek.push(plans.pendek.proyek);
  }
  if (ada(plans.pdfTools)) {
    gratis.push(b.pdf.free.id);
    pro.push(b.pdf.pro.id);
    pendek.push(plans.pendek.pdf);
  }
  if (ada(plans.aiTools)) {
    pro.push(b.ai.pro.id);
    pendek.push(plans.pendek.ai);
  }
  pro.push(plans.asisten.pro.id.replace("{n}", String(plans.aiLimit.pro)));
  // Ringkasan satu baris: fitur Pro paling menonjol dulu
  return { gratis, pro, ringkas: pendek.reverse().slice(0, 3).join(", ") };
}

export function pakaiProyek(toolId: string) {
  return plans.proyekTools.includes(toolId);
}

export function PaketTool({ toolId, toolName }: { toolId: ToolId; toolName: string }) {
  const paket = usePaket();
  const [buka, setBuka] = useState(false);
  const { gratis, pro, ringkas } = fiturPaket(toolId);
  return (
    <div className={`${styles.paket} no-print`}>
      <button type="button" className={styles.paketRingkas} onClick={() => setBuka((v) => !v)} aria-expanded={buka}>
        {paket === "pro" ? (
          <span>
            <b className={styles.paketPro}>Pro aktif</b> Semua fitur {toolName} terbuka
          </span>
        ) : (
          <span>
            <b>Gratis</b> semua fitur inti · <b className={styles.paketPro}>Pro</b> {ringkas}
          </span>
        )}
        <span aria-hidden="true">{buka ? "▴" : "▾"}</span>
      </button>
      {buka && (
        <div className={styles.paketIsi}>
          <div>
            <b>Gratis</b>
            <ul>
              {gratis.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
          <div className={styles.paketKolomPro}>
            <b>Founderku Pro</b>
            <ul>
              {pro.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            {paket === "tamu" ? (
              <a href={`/daftar?next=${encodeURIComponent(`/tools/${toolId}`)}`}>Daftar, coba Pro gratis {PRICING.trialDays} hari</a>
            ) : paket !== "pro" ? (
              <a href="/harga">Lihat harga</a>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
