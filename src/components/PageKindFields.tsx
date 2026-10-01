"use client";

// Isian tambahan editor Pajangin: jenis halaman (produk, jasa, lainnya)
// dan pilihan tampil di Etalase Social Space.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail, type JalurKontak } from "@/lib/kontak";
import { isValidWhatsAppNumber } from "@/lib/validators";

export type PageKind = "produk" | "jasa" | "lainnya";

export const KIND_LABEL: Record<PageKind, string> = { produk: "Produk", jasa: "Jasa", lainnya: "Lainnya" };

export function PageKindSelect({ value, onChange }: { value: PageKind; onChange: (v: PageKind) => void }) {
  return (
    <div>
      <label className="block text-xs font-manrope font-bold uppercase tracking-wide text-text-soft mb-1.5">
        Jenis halaman
      </label>
      <div className="flex gap-2" role="group" aria-label="Jenis halaman">
        {(Object.keys(KIND_LABEL) as PageKind[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={value === k}
            onClick={() => onChange(k)}
            className={`flex-1 border rounded-xl px-3 py-2.5 text-sm font-manrope font-bold transition-colors ${
              value === k ? "bg-ink text-white border-transparent" : "border-border text-text-soft"
            }`}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-text-faint mt-1">
        Jasa cocok untuk desain, les, foto, servis, dan sejenisnya. Lainnya untuk kelas, sewa, atau yang lain.
      </p>
    </div>
  );
}

export function PriceExtras({
  askPrice,
  onAskPrice,
  unit,
  onUnit,
}: {
  askPrice: boolean;
  onAskPrice: (v: boolean) => void;
  unit: string;
  onUnit: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm text-text-soft">
        <input type="checkbox" checked={askPrice} onChange={(e) => onAskPrice(e.target.checked)} />
        Tanpa harga, tampilkan &quot;Tanya harga&quot;
      </label>
      {!askPrice && (
        <div>
          <label className="block text-xs font-manrope font-bold uppercase tracking-wide text-text-soft mb-1.5">
            Satuan harga (boleh dikosongkan)
          </label>
          <input
            className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
            placeholder="/jam, /proyek, /porsi"
            maxLength={20}
            value={unit}
            onChange={(e) => onUnit(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

// Status profil penjual di Social Space milik pengguna yang sedang login.
// Dicek ulang saat tab kembali aktif (misalnya setelah bikin profil di tab lain).
function useSellerProfile() {
  const [state, setState] = useState<{ handle: string; name: string; isPublic: boolean } | null | undefined>(undefined);
  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return setState(null);
      const { data } = await supabase
        .from("ss_profiles")
        .select("handle, name, is_public")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      setState(data ? { handle: data.handle, name: data.name, isPublic: data.is_public } : null);
    };
    load();
    const onFocus = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, []);
  return state;
}

export function SocialToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const seller = useSellerProfile();
  const ready = !!seller && seller.isPublic;
  return (
    <div
      className="rounded-[22px] p-[1.5px]"
      style={{ background: value ? "linear-gradient(135deg, #F2A93E, #E85F3D, #8A85B8)" : "var(--line-2, #e5e1ec)" }}
    >
      <div className="rounded-[21px] p-5 sm:p-6" style={{ background: "var(--app-card-strong, #fff)" }}>
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="shrink-0 w-12 h-12 rounded-2xl grid place-items-center text-white"
            style={{ background: "linear-gradient(135deg, #8A85B8, #E85F3D)" }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9.5 5.2 5h13.6L20 9.5M4 9.5V19h16V9.5M4 9.5c0 1.4 1.1 2.5 2.7 2.5s2.6-1.1 2.6-2.5c0 1.4 1.1 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1 2.5 2.6 2.5S20 10.9 20 9.5M10 19v-4h4v4" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="font-manrope font-bold text-lg leading-tight" id="ss-toggle-h">
                Tampilkan di Social Space
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={value}
                aria-labelledby="ss-toggle-h"
                onClick={() => onChange(!value)}
                className="relative shrink-0 w-14 h-8 rounded-full transition-colors"
                style={{ background: value ? "#35C46A" : "rgba(128,126,146,.45)" }}
              >
                <span
                  className="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all"
                  style={{ left: value ? 28 : 4 }}
                />
              </button>
            </div>
            <p className="text-sm text-text-soft mt-1.5">
              Jual lebih luas: halaman ini ikut tampil di <b>Etalase Social Space</b> dan bisa ditemukan semua pengguna Founderku.
            </p>
            <ul className="text-sm text-text-soft mt-3 space-y-1.5">
              <li>✓ Gratis, bisa dimatikan kapan saja</li>
              <li>✓ Pembeli menghubungimu langsung lewat WhatsApp</li>
              <li>✓ Namamu tampil dan tertaut ke profil penjualmu</li>
            </ul>
          </div>
        </div>

        {seller === undefined ? null : ready ? (
          <p className="mt-4 text-sm rounded-xl px-3.5 py-2.5" style={{ background: "rgba(53,196,106,.12)" }}>
            Tampil sebagai <b>{seller.name}</b> (@{seller.handle}).{" "}
            <a href={`/social-space/u/${seller.handle}`} target="_blank" rel="noopener noreferrer" className="underline">
              Lihat profil penjualmu
            </a>
          </p>
        ) : (
          <div className="mt-4 text-sm rounded-xl px-3.5 py-3" style={{ background: "rgba(242,169,62,.16)" }}>
            <b className="block">{seller ? "Profil penjualmu masih privat." : "Lengkapi profil penjual dulu."}</b>
            <span className="block mt-1 text-text-soft">
              Supaya pembeli percaya, Etalase hanya menampilkan halaman dari penjual yang punya profil publik: nama,
              pengalaman, dan portofolio. Halaman ini baru muncul di Etalase setelah profilmu siap.
            </span>
            <a
              href="/social-space/profil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2.5 font-manrope font-bold underline"
            >
              {seller ? "Buka pengaturan profil" : "Buat profil penjual"} ↗
            </a>
          </div>
        )}

        <p className="text-[11px] text-text-faint mt-3">Founderku tidak memproses pembayaran. Transaksi langsung antara kamu dan pembeli.</p>
      </div>
    </div>
  );
}

// Cara pembeli menghubungi: WhatsApp atau email (untuk penjual yang
// tidak mau nomor WhatsApp-nya tampil publik)
export function KontakFields({
  jalur,
  onJalur,
  whatsapp,
  onWhatsapp,
  email,
  onEmail,
}: {
  jalur: JalurKontak;
  onJalur: (v: JalurKontak) => void;
  whatsapp: string;
  onWhatsapp: (v: string) => void;
  email: string;
  onEmail: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-manrope font-bold uppercase tracking-wide text-text-soft mb-1.5">
        Pembeli menghubungi kamu lewat
      </label>
      <div className="flex gap-2 mb-2" role="group" aria-label="Cara pembeli menghubungi">
        {(
          [
            ["wa", "WhatsApp"],
            ["email", "Email"],
          ] as [JalurKontak, string][]
        ).map(([k, t]) => (
          <button
            key={k}
            type="button"
            aria-pressed={jalur === k}
            onClick={() => onJalur(k)}
            className={`flex-1 border rounded-xl px-3 py-2.5 text-sm font-manrope font-bold transition-colors ${
              jalur === k ? "bg-ink text-white border-transparent" : "border-border text-text-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {jalur === "wa" ? (
        <>
          <input
            className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
            placeholder="0812xxxxxxxx"
            inputMode="tel"
            aria-label="Nomor WhatsApp"
            value={whatsapp}
            onChange={(e) => onWhatsapp(e.target.value)}
          />
          <p className="text-[11px] text-text-faint mt-1">
            Nomor ini tampil di tombol pesan. Tidak mau nomormu terlihat publik? Pilih Email.
          </p>
        </>
      ) : (
        <>
          <input
            type="email"
            className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
            placeholder="nama@email.com"
            inputMode="email"
            autoComplete="email"
            aria-label="Email untuk pembeli"
            maxLength={120}
            value={email}
            onChange={(e) => onEmail(e.target.value)}
          />
          <p className="text-[11px] text-text-faint mt-1">
            Pembeli akan mengirim email ke alamat ini. Alamatnya terlihat di halamanmu, jadi pakai email khusus jualan
            kalau perlu.
          </p>
        </>
      )}
    </div>
  );
}

// Cek isian kontak sebelum simpan. Kembalikan pesan error atau null.
export function cekKontak(jalur: JalurKontak, whatsapp: string, email: string): string | null {
  if (jalur === "wa") return isValidWhatsAppNumber(whatsapp) ? null : "Format nomor WhatsApp tidak valid.";
  return isValidEmail(email) ? null : "Format email tidak valid. Contoh: nama@email.com";
}

// Isian kolom kontak untuk tabel pages: hanya jalur yang dipilih yang disimpan
export function kolomKontak(jalur: JalurKontak, whatsapp: string, email: string) {
  return jalur === "wa"
    ? { whatsapp_number: whatsapp.trim(), contact_email: "" }
    : { whatsapp_number: "", contact_email: email.trim() };
}
