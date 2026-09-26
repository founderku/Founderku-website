import type { Metadata } from "next";

// Layout khusus 5 tools (Notain, Pajakin, Kontrakin, Jalanin, Sehatin).
// Sengaja terpisah dari layout situs (tanpa Tailwind), karena tiap tool
// punya gaya sendiri yang dibawa dari aplikasi aslinya. Gaya tiap tool
// dikurung di class .tool-<id> (lihat tools/<id>/tool.css).
export const metadata: Metadata = {
  title: "Tools · Founderku",
};

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/images/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
        {supabaseUrl && <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />}
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
