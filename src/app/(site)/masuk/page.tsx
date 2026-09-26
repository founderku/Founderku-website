"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/validators";
import { OtpVerify } from "@/components/OtpVerify";
import { Pill } from "@/components/ui/Pill";
import { AuthLayout } from "@/components/shell/AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needVerify, setNeedVerify] = useState(false);
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
      // Sudah daftar tapi belum verifikasi: kirim kode baru, lalu minta
      // user isi kodenya di sini juga.
      if (error.code === "email_not_confirmed") {
        await supabase.auth.resend({ type: "signup", email });
        setLoading(false);
        setNeedVerify(true);
        return;
      }
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
    <AuthLayout
      eyebrow="Masuk"
      title="Masuk ke Founderku."
      sub="Satu akun buat semua tools Founderku. Lanjutkan dari tempat terakhir kamu berhenti."
      points={["Pajangin, Notain, Pajakin, dan tools lain dalam satu akun", "Data tools tersimpan dan bisa dibuka dari HP mana pun"]}
    >
        {needVerify ? (
          <OtpVerify email={email} nextPath={safeNextPath(new URLSearchParams(window.location.search).get("next"))} />
        ) : (
        <>
        <h2 className="font-manrope font-extrabold text-2xl tracking-tight mb-6">
          Masuk
        </h2>

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
        </>
        )}
    </AuthLayout>
  );
}
