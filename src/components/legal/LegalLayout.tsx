import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnimatedBackdrop } from "@/components/AnimatedBackdrop";
import { SiteHeader } from "@/components/SiteHeader";

// Layout dipakai bareng oleh halaman /privasi dan /syarat - biar dua-duanya
// konsisten (header, lebar konten, gaya heading/paragraf) tanpa duplikasi.
// Ikut tema terang/gelap situs (class fk-app).
export async function LegalLayout({
  title,
  updatedAt,
  active,
  children,
}: {
  title: string;
  updatedAt: string;
  active: "syarat" | "privasi";
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tab = (href: string, label: string, isActive: boolean) => (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={
        "px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-colors " +
        (isActive ? "glass-amber text-ink" : "text-text-soft hover:text-ink")
      }
    >
      {label}
    </Link>
  );

  return (
    <div className="fk-app">
      <AnimatedBackdrop />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <SiteHeader isLoggedIn={!!user} />

        <nav className="fk-rise flex flex-wrap gap-2 mb-6" aria-label="Dokumen legal">
          {tab("/syarat", "Syarat & Ketentuan", active === "syarat")}
          {tab("/privasi", "Kebijakan Privasi", active === "privasi")}
        </nav>

        <p className="fk-rise font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-2">
          Terakhir diperbarui: {updatedAt}
        </p>
        <h1 className="fk-rise font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight mb-8">
          {title}
        </h1>
        <div className="fk-rise fk-app-card legal-content space-y-8 p-6 sm:p-9">{children}</div>
      </div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-manrope font-extrabold text-lg mb-3">{title}</h2>
      <div className="text-sm text-text-soft leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

// Link di dalam teks legal (kebaca di tema terang maupun gelap)
export const legalLinkClass = "font-semibold text-ink underline decoration-amber decoration-2 underline-offset-2";

export function LegalContact() {
  return (
    <>
      email{" "}
      <a href="mailto:founderku@gmail.com" className={legalLinkClass}>
        founderku@gmail.com
      </a>{" "}
      atau WhatsApp{" "}
      <a
        href="https://wa.me/6285710477257"
        target="_blank"
        rel="noopener noreferrer"
        className={legalLinkClass}
      >
        +62 857-1047-7257
      </a>
    </>
  );
}
