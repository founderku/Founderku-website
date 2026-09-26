import type { ReactNode } from "react";
import Link from "next/link";
import { FkShell } from "./FkShell";

// Tata letak halaman masuk & daftar: judul di kiri (gaya beranda),
// kartu formulir di kanan. Di HP tersusun atas-bawah.
export function AuthLayout({
  eyebrow,
  title,
  sub,
  points = [],
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  points?: string[];
  children: ReactNode;
}) {
  const dotted = title.endsWith(".");
  return (
    <FkShell>
      <div className="auth-grid">
        <div className="auth-intro">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="h1">
            {dotted ? title.slice(0, -1) : title}
            {dotted && <span className="o">.</span>}
          </h1>
          <p className="auth-sub">{sub}</p>
          {points.length > 0 && (
            <ul className="auth-points">
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          <div className="auth-trust">
            <p>
              Data kamu aman dan terenkripsi. Dikelola oleh{" "}
              <b>PT Talenthra Karya Nusantara</b>.
            </p>
            <p>
              <Link href="/privasi">Kebijakan Privasi</Link>
              <span aria-hidden="true"> · </span>
              <Link href="/syarat">Syarat &amp; Ketentuan</Link>
              <span aria-hidden="true"> · </span>
              <a
                href="https://www.instagram.com/founderku?igsh=MW11ZW00dXI4YXltZQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
              >
                @founderku
              </a>
            </p>
          </div>
        </div>
        <div className="auth-card">{children}</div>
      </div>
    </FkShell>
  );
}
