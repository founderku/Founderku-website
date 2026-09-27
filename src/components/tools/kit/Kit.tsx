"use client";

// Komponen standar tools baru Founderku (template). Semua tool baru
// memakai bagian-bagian ini supaya tampilan, mode gelap, tampilan HP,
// dan hasil cetak PDF-nya seragam.
//
// Warna diambil dari token fk-nav.css (dimuat ToolFrame), jadi otomatis
// ikut tema terang/gelap situs.

import { useId, useState } from "react";
import { nf, parseAngka } from "@/lib/tools/format";
import s from "./kit.module.css";

type Anak = { children?: React.ReactNode };

export function ToolShell({
  eyebrow,
  title,
  desc,
  actions,
  children,
  printHead = true,
}: Anak & { eyebrow: string; title: string; desc: string; actions?: React.ReactNode; printHead?: boolean }) {
  return (
    <div className={s.page}>
      <div className={s.wrap}>
        <header className={`${s.head} ${printHead ? "" : "no-print"}`}>
          <div>
            <div className={s.eyebrow}>{eyebrow}</div>
            <h1 className={s.title}>
              {title}
              <span className={s.dot}>.</span>
            </h1>
            <p className={s.desc}>{desc}</p>
          </div>
          {actions && <div className={`${s.actions} no-print`}>{actions}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}

// Dua kolom: isian di kiri, hasil di kanan (menempel saat digulir).
// Di HP jadi satu kolom: isian dulu, lalu hasil.
export function Split({ aside, children }: Anak & { aside: React.ReactNode }) {
  return (
    <div className={s.split}>
      <div className={s.main}>{children}</div>
      <aside className={s.aside}>{aside}</aside>
    </div>
  );
}

export function Card({
  title,
  hint,
  right,
  children,
  tone,
}: Anak & { title?: string; hint?: string; right?: React.ReactNode; tone?: "soft" }) {
  return (
    <section className={`${s.card} ${tone === "soft" ? s.cardSoft : ""}`}>
      {(title || right) && (
        <div className={s.cardHead}>
          <div>
            {title && <h2 className={s.cardTitle}>{title}</h2>}
            {hint && <p className={s.cardHint}>{hint}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

// keep: tetap 2 kolom di HP (untuk kotak angka hasil / isian pendek).
// cols 3 + keep: di HP jadi 2 kolom, item pertama selebar penuh.
export function Grid({ children, cols = 2, keep }: Anak & { cols?: 2 | 3; keep?: boolean }) {
  const kelas = cols === 3 ? (keep ? `${s.grid3} ${s.grid3Keep}` : s.grid3) : keep ? `${s.grid2} ${s.grid2Keep}` : s.grid2;
  return <div className={kelas}>{children}</div>;
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
  hideLabel,
}: Anak & { label: string; hint?: string; htmlFor?: string; hideLabel?: boolean }) {
  return (
    <div className={s.field}>
      <label className={hideLabel ? s.srOnly : s.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <div className={s.hint}>{hint}</div>}
    </div>
  );
}

// Isian angka. Teks disimpan sementara supaya user bisa mengetik "2," dulu
// sebelum "2,5". money: tampil dengan titik ribuan dan awalan Rp.
export function NumInput({
  label,
  hint,
  value,
  onChange,
  money,
  suffix,
  digits = 1,
  min,
  max,
  hideLabel,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  money?: boolean;
  suffix?: string;
  digits?: number;
  min?: number;
  max?: number;
  hideLabel?: boolean;
}) {
  const id = useId();
  // Bilangan bulat (Rupiah / jumlah): titik = pemisah ribuan
  const bulat = money || digits === 0;
  const tampil = (n: number) => (n === 0 ? "" : nf(n, bulat ? 0 : digits));
  const [teks, setTeks] = useState(() => tampil(value));
  const [nilaiLalu, setNilaiLalu] = useState(value);
  if (value !== nilaiLalu) {
    // Nilai berubah dari luar (misal tombol Isi contoh / Kosongkan)
    setNilaiLalu(value);
    if (parseAngka(teks) !== value) setTeks(tampil(value));
  }
  return (
    <Field label={label} hint={hint} htmlFor={id} hideLabel={hideLabel}>
      <div className={s.inputBox}>
        {money && <span className={s.affix}>Rp</span>}
        <input
          id={id}
          className={s.input}
          inputMode={bulat ? "numeric" : "decimal"}
          value={teks}
          placeholder="0"
          onChange={(e) => {
            let raw = e.target.value;
            if (bulat) raw = raw.replace(/[^\d]/g, "");
            else raw = raw.replace(/[^\d,.-]/g, "").replace(".", ",");
            let n = parseAngka(raw);
            if (min !== undefined && n < min) n = min;
            if (max !== undefined && n > max) n = max;
            setTeks(bulat ? (raw ? nf(n) : "") : raw);
            onChange(n);
          }}
          onBlur={() => setTeks(tampil(value))}
        />
        {suffix && <span className={s.affix}>{suffix}</span>}
      </div>
    </Field>
  );
}

export function TextInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength = 200,
  hideLabel,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} hideLabel={hideLabel}>
      <input
        id={id}
        className={`${s.input} ${s.inputSolo}`}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength = 1500,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <textarea
        id={id}
        className={`${s.input} ${s.inputSolo} ${s.area}`}
        value={value}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function Button({
  children,
  onClick,
  variant = "line",
  small,
  type = "button",
  ariaLabel,
}: Anak & {
  onClick?: () => void;
  variant?: "solid" | "line" | "ghost";
  small?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={`${s.btn} ${s[variant]} ${small ? s.small : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Tombol standar di kanan atas: isi contoh, kosongkan, cetak PDF
export function StdActions({ onContoh, onReset }: { onContoh?: () => void; onReset?: () => void }) {
  return (
    <>
      {onContoh && (
        <Button small onClick={onContoh}>
          Isi contoh
        </Button>
      )}
      {onReset && (
        <Button
          small
          variant="ghost"
          onClick={() => {
            if (window.confirm("Kosongkan semua isian tool ini?")) onReset();
          }}
        >
          Kosongkan
        </Button>
      )}
      <Button small variant="solid" onClick={() => window.print()}>
        Cetak / PDF
      </Button>
    </>
  );
}

export type Tone = "good" | "warn" | "bad" | "neutral";
const TONE_LABEL: Record<Tone, string> = { good: "Sehat", warn: "Perlu dicek", bad: "Bahaya", neutral: "" };

export function Stat({
  label,
  value,
  sub,
  tone = "neutral",
  big,
  toneText,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  big?: boolean;
  toneText?: string; // ganti tulisan lencana (bawaan: Sehat / Perlu dicek / Bahaya)
}) {
  return (
    <div className={`${s.stat} ${big ? s.statBig : ""}`}>
      <div className={s.statLabel}>{label}</div>
      <div className={s.statValue}>{value}</div>
      {(sub || tone !== "neutral") && (
        <div className={s.statSub}>
          {tone !== "neutral" && <Badge tone={tone} text={toneText} />}
          {sub}
        </div>
      )}
    </div>
  );
}

// Status selalu ikon + teks, bukan warna saja
export function Badge({ tone, text }: { tone: Tone; text?: string }) {
  const ikon = tone === "good" ? "✓" : tone === "warn" ? "!" : tone === "bad" ? "×" : "i";
  return (
    <span className={`${s.badge} ${s["b_" + tone]}`}>
      <i aria-hidden="true">{ikon}</i>
      {text ?? TONE_LABEL[tone]}
    </span>
  );
}

export function Verdict({ tone, title, children }: Anak & { tone: Tone; title: string }) {
  return (
    <div className={`${s.verdict} ${s["v_" + tone]}`}>
      <Badge tone={tone} text={title} />
      <div className={s.verdictBody}>{children}</div>
    </div>
  );
}

export function Meter({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={s.meter} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)} aria-label={label}>
      <div className={s.meterFill} style={{ width: `${v}%` }} />
    </div>
  );
}

// Pilihan skor 1-5 (tombol bulat)
export function Scale({
  value,
  onChange,
  label,
  kiri,
  kanan,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  kiri?: string;
  kanan?: string;
}) {
  return (
    <div className={s.scale}>
      <div className={s.scaleLabel}>{label}</div>
      <div className={s.scaleRow} role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            className={`${s.scaleBtn} ${value === n ? s.scaleOn : ""}`}
            onClick={() => onChange(value === n ? 0 : n)}
          >
            {n}
          </button>
        ))}
      </div>
      {(kiri || kanan) && (
        <div className={s.scaleEnds} aria-hidden="true">
          <span>{kiri ? `1 = ${kiri}` : ""}</span>
          <span>{kanan ? `5 = ${kanan}` : ""}</span>
        </div>
      )}
    </div>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { id: T; label: string }[];
}) {
  return (
    <div className={`${s.tabs} no-print`} role="tablist">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={value === it.id}
          className={`${s.tab} ${value === it.id ? s.tabOn : ""}`}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Note({ children }: Anak) {
  return <p className={s.note}>{children}</p>;
}

// Ikon hapus kecil untuk baris daftar
export function RemoveBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className={`${s.remove} no-print`} onClick={onClick} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}

export function Select<T extends string | number>({
  label,
  hint,
  value,
  onChange,
  options,
  hideLabel,
}: {
  label: string;
  hint?: string;
  value: T;
  onChange: (v: T) => void;
  options: { v: T; label: string }[];
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} hideLabel={hideLabel}>
      <select
        id={id}
        className={`${s.input} ${s.inputSolo} ${s.select}`}
        value={String(value)}
        onChange={(e) => {
          const pilih = options.find((o) => String(o.v) === e.target.value);
          if (pilih) onChange(pilih.v);
        }}
      >
        {options.map((o) => (
          <option key={String(o.v)} value={String(o.v)}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function DateInput({
  label,
  value,
  onChange,
  hideLabel,
  type = "date",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hideLabel?: boolean;
  type?: "date" | "month";
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hideLabel={hideLabel}>
      <input id={id} type={type} className={`${s.input} ${s.inputSolo}`} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={s.toggle}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={s.switch} aria-hidden="true" />
      {label}
    </label>
  );
}

export { s as kitStyles };
