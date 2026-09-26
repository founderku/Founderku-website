"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pill } from "@/components/ui/Pill";

// Kotak isi kode verifikasi email (6 angka) setelah daftar. Kodenya
// dikirim Supabase lewat template email "Confirm signup" yang memakai
// {{ .Token }}. Setelah kode benar, sesi login langsung aktif di browser,
// lalu diarahkan ke `nextPath` (default /akun, tempat trial dimulai).
const RESEND_COOLDOWN = 60;

export function OtpVerify({ email, nextPath }: { email: string; nextPath: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length < 6) {
      setError("Kodenya 6 angka. Cek lagi email kamu.");
      return;
    }
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
    if (error) {
      setLoading(false);
      setError(
        /expired|invalid/i.test(error.message)
          ? "Kode salah atau sudah kedaluwarsa. Coba lagi, atau minta kode baru."
          : "Gagal verifikasi: " + error.message
      );
      return;
    }
    // Reload penuh supaya server langsung baca sesi baru (dan mulai trial).
    window.location.assign(nextPath);
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setError("Gagal kirim ulang: " + error.message);
      return;
    }
    setInfo("Kode baru sudah dikirim.");
    setCooldown(RESEND_COOLDOWN);
  }

  return (
    <div>
      <h1 className="font-manrope font-extrabold text-2xl tracking-tight mb-1">
        Masukkan kode verifikasi
      </h1>
      <p className="text-sm text-text-soft mb-6">
        Kami sudah kirim kode ke <b className="break-all">{email}</b>. Cek juga
        folder spam kalau belum ada di inbox.
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          aria-label="Kode verifikasi"
          className="w-full border border-border rounded-xl px-3.5 py-3 text-center font-manrope font-extrabold text-2xl tracking-[0.4em]"
        />

        {error && <p className="text-xs text-coral">{error}</p>}
        {info && <p className="text-xs text-text-soft">{info}</p>}

        <Pill
          type="submit"
          variant="solid-amber"
          disabled={loading}
          className="w-full justify-center"
        >
          {loading ? "Memeriksa..." : "Verifikasi"}
        </Pill>
      </form>

      <p className="text-sm text-text-soft mt-5 text-center">
        Belum dapat kode?{" "}
        {cooldown > 0 ? (
          <span className="text-text-faint">Kirim ulang dalam {cooldown} detik</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-ink underline"
          >
            Kirim ulang
          </button>
        )}
      </p>
    </div>
  );
}
