"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/validators";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      setError("Email atau kata sandi salah. Coba lagi.");
      return;
    }
    router.push(safeNextPath(new URLSearchParams(window.location.search).get("next")));
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath(new URLSearchParams(window.location.search).get("next")))}`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-indigo/25 blur-[110px]" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-coral/20 blur-[110px]" />

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
        <span className="inline-block font-manrope font-bold text-[11px] uppercase tracking-widest text-indigo bg-indigo/10 px-3 py-1 rounded-full mb-4">
          Masuk
        </span>
        <h1 className="font-manrope font-extrabold text-3xl tracking-tight mb-1">
          Masuk ke Founderku
        </h1>
        <p className="text-sm text-text-soft mb-6">
          Satu akun buat semua tools Founderku.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>

          {error && <p className="text-xs text-coral">{error}</p>}

          <Pill
            type="submit"
            variant="solid-amber"
            disabled={loading}
            className="w-full justify-center"
          >
            {loading ? "Memproses..." : "Masuk"}
          </Pill>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-text-faint">atau</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <Pill
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full justify-center"
        >
          Masuk dengan Google
        </Pill>

        <p className="text-sm text-text-soft mt-6 text-center">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold text-ink underline">
            Daftar
          </Link>
        </p>
      </Card>

      {/* Elemen kepercayaan: badan hukum yang jelas + tautan kebijakan
          resmi, biar user (terutama yang masih ragu soal keamanan data)
          lihat ini bukan aplikasi abal-abal. */}
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
    </div>
  );
}
