import Link from "next/link";

// Layout dipakai bareng oleh halaman /privasi dan /syarat - biar dua-duanya
// konsisten (header, lebar konten, gaya heading/paragraf) tanpa duplikasi.
export function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link href="/pajangin" className="inline-flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pajangin-assets/logo.jpeg"
              alt="Pajangin"
              className="w-8 h-8 rounded-xl transition-transform group-hover:-translate-y-0.5"
            />
            <span className="font-manrope font-extrabold text-sm">Pajangin</span>
          </Link>
          <nav className="flex items-center gap-5 text-xs font-manrope font-bold text-text-soft">
            <Link href="/syarat" className="hover:text-ink transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="/privasi" className="hover:text-ink transition-colors">
              Kebijakan Privasi
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-2">
          Terakhir diperbarui: {updatedAt}
        </p>
        <h1 className="font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight mb-8">
          {title}
        </h1>
        <div className="legal-content space-y-8">{children}</div>
      </main>
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
