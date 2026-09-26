import Link from "next/link";
import { FkShell } from "@/components/shell/FkShell";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StyleSelector } from "@/components/StyleSelector";
import type { Profile } from "@/lib/types";

export default async function StylePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/masuk");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return (
    <FkShell>
      <div className="max-w-5xl mx-auto">

      <div className="mb-6">
        <Link href="/pajangin" className="inline-flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pajangin-assets/logo.jpeg"
            alt="Pajangin"
            className="w-8 h-8 rounded-xl transition-transform group-hover:-translate-y-0.5"
          />
          <span className="font-manrope font-extrabold text-sm">Pajangin</span>
        </Link>
      </div>

      <Link
        href="/pajangin/dashboard"
        className="block text-xs font-manrope font-bold text-text-soft mb-3"
      >
        ← Kembali ke dashboard
      </Link>
      <h1 className="font-manrope font-extrabold text-3xl tracking-tight mb-1">
        Edit Style Tokomu
      </h1>
      <p className="text-sm text-text-soft mb-8">
        Pilih 1 gaya visual. Semua halaman produk kamu (termasuk halaman
        toko) otomatis ikut gaya yang kamu pilih di sini.
      </p>

      <StyleSelector
        userId={user.id}
        currentStyle={profile?.store_style ?? "klasik"}
      />
      </div>
    </FkShell>
  );
}
