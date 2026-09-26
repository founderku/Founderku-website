import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { TakedownControls } from "@/components/admin/TakedownControls";
import type { Profile } from "@/lib/types";

interface AdminPageRow {
  id: string;
  slug: string;
  product_name: string;
  status: "active" | "locked" | "taken_down";
  created_at: string;
  user_id: string;
  profiles: { email: string; store_slug: string | null } | null;
}

export default async function AdminPage() {
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

  // Bukan admin? Lempar balik ke dashboard biasa - jangan kasih tau
  // detail apa pun soal admin panel ke user biasa.
  if (!profile?.is_admin) redirect("/pajangin/dashboard");

  // Embedded select: ambil data pages SEKALIAN data profiles pemiliknya
  // (email, store_slug) lewat relasi foreign key user_id -> profiles.id,
  // biar gak perlu query terpisah per halaman.
  const { data: pages } = await supabase
    .from("pages")
    .select("id, slug, product_name, status, created_at, user_id, profiles(email, store_slug)")
    .order("created_at", { ascending: false })
    .returns<AdminPageRow[]>();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/pajangin" className="inline-flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pajangin-assets/logo.jpeg"
            alt="Pajangin"
            className="w-8 h-8 rounded-xl transition-transform group-hover:-translate-y-0.5"
          />
          <span className="font-manrope font-extrabold text-sm">Pajangin</span>
        </Link>
        <Link
          href="/pajangin/dashboard"
          className="text-xs font-manrope font-bold text-text-soft"
        >
          ← Ke Dashboard
        </Link>
      </div>

      <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-1">
        Admin
      </p>
      <h1 className="font-manrope font-extrabold text-3xl tracking-tight mb-1">
        Moderasi Halaman
      </h1>
      <p className="text-sm text-text-soft mb-8">
        Semua halaman produk dari semua user. {pages?.length ?? 0} halaman
        total.
      </p>

      {!pages || pages.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-text-soft">Belum ada halaman sama sekali.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {pages.map((page) => (
            <Card
              key={page.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="font-manrope font-bold text-sm truncate">
                  {page.product_name}
                </div>
                <div className="text-xs text-text-soft truncate">
                  founderku.com/l/{page.slug} · pemilik:{" "}
                  {page.profiles?.email ?? "tidak diketahui"}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={page.status} />
                <TakedownControls pageId={page.id} status={page.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
