// "Simpan ke akun" buat 5 tools (Notain, Pajakin, Kontrakin, Jalanin,
// Sehatin).
//
// Cara kerjanya:
// - Tools tetap menyimpan ke localStorage browser seperti biasa (jadi
//   tetap jalan tanpa login).
// - Setiap kali tool menulis/menghapus data, storage.ts memanggil
//   catatPerubahan(key). Kalau user login dengan trial/Pro aktif, data
//   itu dikirim ke tabel tool_data di Supabase (ditunda sebentar supaya
//   gak kirim tiap ketikan).
// - Waktu halaman tool dibuka, siapkanSinkron() mengambil data dari akun
//   dan menaruhnya di localStorage SEBELUM tool tampil.
//
// Catatan sinkron (localStorage "fk-sync-meta"):
// - owner: id akun pemilik data tools di browser ini. Kalau yang login
//   akun lain, data tools lama dihapus dulu dari browser supaya gak
//   kebawa ke akun yang salah.
// - dirty: kunci yang berubah di browser tapi belum berhasil terkirim.
//   Kunci ini menang saat sinkron berikutnya (dikirim ulang).
// - synced: kunci yang terakhir kali sama persis dengan data di akun.

import { createClient } from "@/lib/supabase/client";

export const TOOL_IDS = ["notain", "pajakin", "kontrakin", "jalanin", "sehatin"] as const;
export type ToolId = (typeof TOOL_IDS)[number];

const META_KEY = "fk-sync-meta";
const TUNDA_MS = 1200;

// hapus: kunci yang pernah DIHAPUS user (tombol reset) dan belum dihapus
// juga di akun. Tools biasanya langsung menyimpan isian kosong sesudah
// reset, jadi niat "hapus" ini perlu diingat terpisah.
type Meta = { owner: string | null; dirty: string[]; synced: string[]; hapus: string[] };

export type StatusSinkron =
  | "memuat"
  | "tamu" // belum login
  | "free" // login tapi trial/Pro habis
  | "tersimpan"
  | "menyimpan"
  | "gagal";

function kunciTool(key: string): boolean {
  return TOOL_IDS.some((t) => key.startsWith(t + "-"));
}

function bacaMeta(): Meta {
  try {
    const m = JSON.parse(window.localStorage.getItem(META_KEY) || "null");
    if (m && typeof m === "object") {
      return {
        owner: typeof m.owner === "string" ? m.owner : null,
        dirty: Array.isArray(m.dirty) ? m.dirty.filter(kunciTool) : [],
        synced: Array.isArray(m.synced) ? m.synced.filter(kunciTool) : [],
        hapus: Array.isArray(m.hapus) ? m.hapus.filter(kunciTool) : [],
      };
    }
  } catch {
    // abaikan, pakai data kosong
  }
  return { owner: null, dirty: [], synced: [], hapus: [] };
}

function tulisMeta(m: Meta) {
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(m));
  } catch {
    // penyimpanan penuh / diblokir: sinkron tetap jalan selama halaman terbuka
  }
}

function tambah(list: string[], key: string) {
  return list.includes(key) ? list : [...list, key];
}

function buang(list: string[], key: string) {
  return list.filter((k) => k !== key);
}

// Semua kunci localStorage milik 5 tools
function semuaKunciToolLokal(): string[] {
  const hasil: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && kunciTool(k)) hasil.push(k);
  }
  return hasil;
}

// Hapus semua data tools dari browser ini (dipakai saat logout atau saat
// akun lain login di browser yang sama).
export function hapusDataToolLokal() {
  if (typeof window === "undefined") return;
  try {
    for (const k of semuaKunciToolLokal()) window.localStorage.removeItem(k);
    window.localStorage.removeItem(META_KEY);
    isiAkun.clear();
  } catch {
    // abaikan
  }
}

// Dipanggil sebelum logout: kalau data tools di browser ini milik akun
// (pernah disinkron), bersihkan supaya orang berikutnya gak lihat.
export function bersihkanSaatLogout() {
  if (typeof window === "undefined") return;
  if (bacaMeta().owner) hapusDataToolLokal();
}

// ---- Status yang ditampilkan di bar atas tool ----

let status: StatusSinkron = "memuat";
const pendengar = new Set<(s: StatusSinkron) => void>();

function setStatus(s: StatusSinkron) {
  status = s;
  pendengar.forEach((f) => f(s));
}

export function dengarStatus(f: (s: StatusSinkron) => void) {
  pendengar.add(f);
  f(status);
  return () => {
    pendengar.delete(f);
  };
}

// ---- Isi terakhir yang sama dengan di akun ----
// Dipakai supaya tool yang cuma "menulis ulang" data yang sama (misal
// waktu baru dibuka) gak dianggap perubahan dan gak dikirim ulang.
// Urutan kunci JSON diabaikan (database bisa mengurutkan ulang).

const isiAkun = new Map<string, string | null>();

function kanonik(nilai: unknown): string {
  if (Array.isArray(nilai)) return "[" + nilai.map(kanonik).join(",") + "]";
  if (nilai && typeof nilai === "object") {
    const o = nilai as Record<string, unknown>;
    return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + kanonik(o[k])).join(",") + "}";
  }
  return JSON.stringify(nilai) ?? "null";
}

function kanonikMentah(mentah: string | null): string | null {
  if (mentah === null) return null;
  try {
    return kanonik(JSON.parse(mentah));
  } catch {
    return mentah;
  }
}

// ---- Kirim perubahan ----

// Akun yang sedang aktif sinkron (null = tamu / belum siap).
// bolehSimpan false = trial/Pro habis: cuma PENGHAPUSAN yang dikirim
// (data lama di akun tetap bisa dihapus user kapan pun).
let aktif: { userId: string; bolehSimpan: boolean } | null = null;

function statusDiam(): StatusSinkron {
  return aktif?.bolehSimpan === false ? "free" : "tersimpan";
}
let timer: ReturnType<typeof setTimeout> | null = null;
let sedangKirim = false;

export function catatPerubahan(key: string) {
  if (typeof window === "undefined" || !kunciTool(key)) return;
  const m = bacaMeta();
  // Selama belum ada akun yang punya data ini (tamu), gak perlu dicatat.
  // Nanti saat login, semua kunci lokal dianggap perlu dikirim.
  if (!m.owner) return;
  if (window.localStorage.getItem(key) === null && !m.hapus.includes(key)) {
    m.hapus = [...m.hapus, key];
    tulisMeta(m);
  }
  if (isiAkun.has(key) && kanonikMentah(window.localStorage.getItem(key)) === isiAkun.get(key)) {
    // Isinya sama persis dengan yang sudah ada di akun
    if (m.dirty.includes(key)) tulisMeta({ ...m, dirty: buang(m.dirty, key) });
    if (aktif && !aktif.bolehSimpan && m.hapus.length) jadwalkanKirim();
    return;
  }
  tulisMeta({ ...m, dirty: tambah(m.dirty, key) });
  if (aktif) jadwalkanKirim();
}

function jadwalkanKirim() {
  if (timer) clearTimeout(timer);
  if (aktif?.bolehSimpan !== false) setStatus("menyimpan");
  timer = setTimeout(() => {
    timer = null;
    void kirimSekarang();
  }, TUNDA_MS);
}

export async function kirimSekarang(): Promise<void> {
  if (!aktif) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (sedangKirim) {
    // Ada kiriman yang masih jalan: coba lagi sesudahnya
    jadwalkanKirim();
    return;
  }
  const { userId, bolehSimpan } = aktif;
  const m = bacaMeta();
  if (m.owner !== userId || (m.dirty.length === 0 && m.hapus.length === 0)) {
    setStatus(statusDiam());
    return;
  }
  sedangKirim = true;
  if (bolehSimpan) setStatus("menyimpan");
  const supabase = createClient();
  const kunci = [...m.dirty];
  const naik: { user_id: string; key: string; value: unknown }[] = [];
  // Pro habis: kunci yang pernah di-reset tetap dihapus di akun walau
  // sekarang sudah terisi lagi (isian baru belum boleh dikirim).
  const hapus: string[] = bolehSimpan ? [] : [...m.hapus];
  const dilewati = new Set<string>();
  for (const key of kunci) {
    const mentah = window.localStorage.getItem(key);
    if (mentah === null) {
      if (!hapus.includes(key)) hapus.push(key);
      continue;
    }
    if (!bolehSimpan) {
      // Pro habis: perubahan disimpan di browser dulu, dikirim nanti
      // kalau Pro aktif lagi
      dilewati.add(key);
      continue;
    }
    try {
      naik.push({ user_id: userId, key, value: JSON.parse(mentah) });
    } catch {
      // bukan JSON (gak mungkin dari tools ini): lewati
    }
  }
  let berhasil = true;
  if (naik.length) {
    const { error } = await supabase.from("tool_data").upsert(naik, { onConflict: "user_id,key" });
    if (error) berhasil = false;
  }
  if (berhasil && hapus.length) {
    const { error } = await supabase.from("tool_data").delete().eq("user_id", userId).in("key", hapus);
    if (error) berhasil = false;
  }
  sedangKirim = false;
  if (!berhasil) {
    if (bolehSimpan) setStatus("gagal");
    // Coba lagi sebentar lagi (misal sinyal sempat putus)
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        void kirimSekarang();
      }, 15000);
    }
    return;
  }
  // Tandai beres, KECUALI kunci yang berubah lagi selama kiriman jalan
  // (isinya sekarang beda dari yang barusan dikirim).
  const sesudah = bacaMeta();
  let dirty = sesudah.dirty;
  let synced = sesudah.synced;
  for (const item of naik) {
    isiAkun.set(item.key, kanonik(item.value));
    if (window.localStorage.getItem(item.key) === JSON.stringify(item.value)) {
      dirty = buang(dirty, item.key);
      synced = tambah(synced, item.key);
    }
  }
  for (const key of hapus) {
    isiAkun.set(key, null);
    if (window.localStorage.getItem(key) === null) {
      dirty = buang(dirty, key);
      synced = buang(synced, key);
    }
  }
  // Niat hapus sudah terwujud: baris dihapus, atau (Pro) ditimpa isi terbaru
  const beres = new Set([...hapus, ...naik.map((i) => i.key)]);
  tulisMeta({ ...sesudah, dirty, synced, hapus: sesudah.hapus.filter((k) => !beres.has(k)) });
  const sisaHapus = sesudah.hapus.filter((k) => !beres.has(k));
  if (aktif && (dirty.some((k) => !dilewati.has(k)) || (!bolehSimpan && sisaHapus.length))) jadwalkanKirim();
  else setStatus(statusDiam());
}

// ---- Ambil data dari akun waktu tool dibuka ----

// masihDitunggu(): false kalau tool sudah keburu tampil (kelamaan nunggu).
// Dalam kasus itu data dari akun TIDAK ditimpa ke browser, supaya isi
// yang sedang dilihat user gak berubah diam-diam.
export async function siapkanSinkron(toolId: ToolId, masihDitunggu: () => boolean): Promise<void> {
  aktif = null;
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    setStatus("tamu");
    return;
  }
  const userId = session.user.id;

  const [proRes, dataRes] = await Promise.all([
    supabase.rpc("current_user_has_pro"),
    supabase.from("tool_data").select("key, value").like("key", `${toolId}-%`),
  ]);
  if (proRes.error || dataRes.error || !masihDitunggu()) {
    // Gagal cek akun (misal offline): tool tetap jalan pakai data browser
    setStatus("gagal");
    return;
  }
  const isPro = proRes.data === true;
  const rows = (dataRes.data ?? []) as { key: string; value: unknown }[];

  let m = bacaMeta();
  if (m.owner && m.owner !== userId) {
    // Data di browser ini milik akun lain: buang dulu
    hapusDataToolLokal();
    m = { owner: null, dirty: [], synced: [], hapus: [] };
  }

  // Belum ada pemilik: data tamu di browser ini dianggap milik akun ini
  // kalau akun ini boleh simpan (Pro) atau sudah punya data di akun.
  if (!m.owner) {
    if (!isPro && rows.length === 0) {
      setStatus("free");
      return;
    }
    const dirtyAwal = semuaKunciToolLokal().filter((k) => !rows.some((r) => r.key === k));
    m = { owner: userId, dirty: dirtyAwal, synced: [], hapus: [] };
  }

  const dariAkun = new Map(rows.map((r) => [r.key, r.value]));
  let { dirty, synced } = m;
  // Kunci tool ini: yang ada di akun, atau yang pernah disinkron
  const kunciTerkait = new Set<string>([
    ...dariAkun.keys(),
    ...synced.filter((k) => k.startsWith(toolId + "-")),
  ]);
  for (const key of kunciTerkait) {
    if (dirty.includes(key)) continue; // perubahan lokal yang belum terkirim menang
    if (dariAkun.has(key)) {
      window.localStorage.setItem(key, JSON.stringify(dariAkun.get(key)));
      isiAkun.set(key, kanonik(dariAkun.get(key)));
      synced = tambah(synced, key);
    } else {
      // Pernah disinkron tapi sudah dihapus dari akun (misal di HP lain)
      window.localStorage.removeItem(key);
      isiAkun.set(key, null);
      synced = buang(synced, key);
    }
  }
  // Kunci lokal tool ini yang belum pernah ada di akun: perlu dikirim
  for (const key of semuaKunciToolLokal()) {
    if (key.startsWith(toolId + "-") && !dariAkun.has(key) && !synced.includes(key)) {
      dirty = tambah(dirty, key);
    }
  }
  tulisMeta({ owner: userId, dirty, synced, hapus: m.hapus });

  aktif = { userId, bolehSimpan: isPro };
  if (dirty.length || m.hapus.length) await kirimSekarang();
  else setStatus(statusDiam());
}

// Dipanggil saat user pindah tab / tutup halaman: kirim yang tertunda
export function kirimSebelumPergi() {
  const m = bacaMeta();
  if (aktif && (timer || m.dirty.length || m.hapus.length)) void kirimSekarang();
}
