"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/validators";
import { PRICING } from "@/lib/pricing";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { OtpVerify } from "@/components/OtpVerify";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const nextPath = () =>
    safeNextPath(new URLSearchParams(window.location.search).get("next"));
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    setAlreadyRegistered(false);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Nama disimpan di data akun, dipakai buat sapaan "Hai, ...".
        data: { full_name: fullName.trim() },
        // Cadangan kalau template email masih pakai link, bukan kode.
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`,
      },
    });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // Email sudah terdaftar: Supabase sengaja tetap bilang "berhasil" tapi
    // tidak kirim email apa pun (tandanya: identities kosong). Kasih tahu
    // user supaya masuk, bukan nunggu email yang tidak akan datang.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setLoading(false);
      setAlreadyRegistered(true);
      return;
    }
    // Kalau verifikasi email dimatikan di Supabase, sesi langsung aktif.
    if (data.session) {
      window.location.assign(nextPath());
      return;
    }
    setLoading(false);
    setDone(true);
  }

  async function handleGoogleRegister() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath(new URLSearchParams(window.location.search).get("next")))}`,
      },
    });
  }

  const trustFooter = (
    <div className="relative z-10 w-full max-w-sm mt-6 text-center">
      <p className="text-xs text-ink-faint leading-relaxed">
        Data kamu aman & terenkripsi. Dikelola oleh{" "}
        <span className="text-ink-soft font-medium">
          PT Talenthra Karya Nusantara
        </span>
        .
      </p>
      <div className="flex items-center justify-center gap-3 mt-2 text-xs">
        <Link href="/privasi" className="text-ink-faint hover:text-white underline">
          Kebijakan Privasi
        </Link>
        <span className="text-ink-faint">·</span>
        <Link href="/syarat" className="text-ink-faint hover:text-white underline">
          Syarat & Ketentuan
        </Link>
        <span className="text-ink-faint">·</span>
        <a
          href="https://www.instagram.com/founderku?igsh=MW11ZW00dXI4YXltZQ%3D%3D&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-faint hover:text-white underline"
        >
          @founderku
        </a>
      </div>
    </div>
  );

  if (done) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-coral/25 blur-[110px]" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-amber/20 blur-[110px]" />
        <a
          href="/"
          className="relative z-10 flex items-center gap-2.5 mb-8 group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/favicon.svg"
            alt="Founderku"
            className="w-9 h-9 rounded-xl transition-transform group-hover:-translate-y-0.5"
          />
          <span className="font-manrope font-extrabold text-lg text-white">
            Founderku
          </span>
        </a>
        <Card className="relative z-10 w-full max-w-sm bg-white">
          <OtpVerify email={email} nextPath={nextPath()} />
        </Card>
        {trustFooter}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-coral/25 blur-[110px]" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-amber/20 blur-[110px]" />

      <a
        href="/"
        className="relative z-10 flex items-center gap-2.5 mb-8 group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/favicon.svg"
          alt="Founderku"
          className="w-9 h-9 rounded-xl transition-transform group-hover:-translate-y-0.5"
        />
        <span className="font-manrope font-extrabold text-lg text-white">
          Founderku
        </span>
      </a>

      <Card className="relative z-10 w-full max-w-sm bg-white">
        <span className="inline-block font-manrope font-bold text-[11px] uppercase tracking-widest text-coral bg-coral/10 px-3 py-1 rounded-full mb-4">
          Daftar
        </span>
        <h1 className="font-manrope font-extrabold text-3xl tracking-tight mb-1">
          Buat Akun Founderku
        </h1>
        <p className="text-sm text-text-soft mb-6">
          Gratis daftar, langsung dapat trial Founderku Pro {PRICING.trialDays} hari. Tanpa kartu, tanpa bayar di awal.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-manrope font-bold uppercase tracking-wide text-text-soft mb-1.5">
              Nama
            </label>
            <input
              type="text"
              required
              maxLength={60}
              autoComplete="given-name"
              placeholder="Nama panggilan kamu"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-manrope font-bold uppercase tracking-wide text-text-soft mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-manrope font-bold uppercase tracking-wide text-text-soft mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
            />
            <p className="text-[11px] text-text-faint mt-1">Minimal 8 karakter.</p>
          </div>

          {error && <p className="text-xs text-coral">{error}</p>}
          {alreadyRegistered && (
            <p className="text-xs text-coral">
              Email ini sudah terdaftar.{" "}
              <Link href="/masuk" className="font-bold underline">
                Masuk di sini
              </Link>
              . Kalau dulu daftar pakai Google, pilih &quot;Masuk dengan
              Google&quot;.
            </p>
          )}

          <Pill
            type="submit"
            variant="solid-amber"
            disabled={loading}
            className="w-full justify-center"
          >
            {loading ? "Memproses..." : "Daftar"}
          </Pill>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-text-faint">atau</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <Pill
          variant="outline"
          onClick={handleGoogleRegister}
          className="w-full justify-center"
        >
          Daftar dengan Google
        </Pill>

        <p className="text-sm text-text-soft mt-6 text-center">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-semibold text-ink underline">
            Masuk
          </Link>
        </p>
      </Card>

      {trustFooter}
    </div>
  );
}
