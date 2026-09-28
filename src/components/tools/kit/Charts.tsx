"use client";

// Grafik sederhana untuk tools (SVG, tanpa library). Warna seri pakai
// slot palet --s1..--s6 dari kit.module.css (urutan tetap, aman buta
// warna). Tiap grafik punya legenda + info saat disentuh/diarahkan.

import { useEffect, useRef, useState } from "react";
import s from "./kit.module.css";

export type Seri = { name: string; slot: 1 | 2 | 3 | 4 | 5 | 6; values: number[] };

function langkahRapi(maks: number): number {
  if (maks <= 0) return 1;
  const kasar = maks / 4;
  const p = Math.pow(10, Math.floor(Math.log10(kasar)));
  const n = kasar / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

// Grafik garis: sumbu x = bulan (0..n-1), sumbu y = nilai (bisa minus)
export function LineChart({
  series,
  xLabel,
  yFormat,
  height = 260,
  ariaLabel,
  yMin,
}: {
  series: Seri[];
  xLabel: (i: number) => string;
  yFormat: (n: number) => string;
  height?: number;
  ariaLabel: string;
  yMin?: number; // batas bawah sumbu y (bawaan 0), misal 2 untuk grafik IPK
}) {
  // Lebar grafik mengikuti lebar kotaknya, supaya tulisan tetap terbaca di HP
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(560);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(260, Math.round(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 420 ? Math.round(height * 0.8) : height;
  const pad = { l: 62, r: 10, t: 12, b: 28 };
  const n = Math.max(...series.map((x) => x.values.length), 2);
  const semua = series.flatMap((x) => x.values);
  const maxV = Math.max(0, ...semua);
  const minV = Math.min(yMin ?? 0, ...semua);
  const step = langkahRapi(Math.max(maxV - minV, 1));
  const top = Math.ceil(maxV / step) * step || step;
  const bot = Math.floor(minV / step) * step;
  const x = (i: number) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((top - v) / (top - bot)) * (H - pad.t - pad.b);
  const ticks: number[] = [];
  for (let v = bot; v <= top + step / 2; v += step) ticks.push(v);
  const xTick = Math.max(1, Math.ceil(n / (W < 420 ? 4 : 7)));

  const [hover, setHover] = useState<number | null>(null);
  const saatGerak = (clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div className={s.viz}>
      {series.length > 1 && (
        <div className={s.legend}>
          {series.map((sr) => (
            <span key={sr.name}>
              <i style={{ background: `var(--s${sr.slot})` }} />
              {sr.name}
            </span>
          ))}
        </div>
      )}
      <div
        ref={box}
        style={{ position: "relative" }}
        onMouseMove={(e) => saatGerak(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => saatGerak(e.touches[0].clientX)}
        onTouchMove={(e) => saatGerak(e.touches[0].clientX)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--grid)" strokeWidth={v === 0 ? 1.5 : 1} />
              <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className={s.vizText}>
                {yFormat(v)}
              </text>
            </g>
          ))}
          {Array.from({ length: n }, (_, i) => i)
            .filter((i) => i % xTick === 0)
            .map((i) => (
              <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className={s.vizText}>
                {xLabel(i)}
              </text>
            ))}
          {series.map((sr) => (
            <polyline
              key={sr.name}
              fill="none"
              stroke={`var(--s${sr.slot})`}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={sr.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
            />
          ))}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--axis)" strokeDasharray="3 4" />
              {series.map((sr) =>
                sr.values[hover] === undefined ? null : (
                  <circle
                    key={sr.name}
                    cx={x(hover)}
                    cy={y(sr.values[hover])}
                    r={5}
                    fill={`var(--s${sr.slot})`}
                    stroke="var(--card)"
                    strokeWidth={2}
                  />
                ),
              )}
            </g>
          )}
        </svg>
        {hover !== null && (
          <div
            className={s.tip}
            style={{
              left: `${(x(hover) / W) * 100}%`,
              top: `${(Math.min(...series.map((sr) => y(sr.values[hover] ?? 0))) / H) * 100}%`,
            }}
          >
            <b>{xLabel(hover)}</b>
            {series.map((sr) =>
              sr.values[hover] === undefined ? null : (
                <span key={sr.name}>
                  <i style={{ background: `var(--s${sr.slot})` }} />
                  {series.length > 1 ? `${sr.name}: ` : ""}
                  {yFormat(sr.values[hover])}
                </span>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Batang 100% bertumpuk (misal komposisi saham per putaran pendanaan)
export function StackedBars({
  rows,
  keys,
  format,
}: {
  rows: { label: string; values: Record<string, number> }[];
  keys: { key: string; name: string; slot: 1 | 2 | 3 | 4 | 5 | 6 }[];
  format: (n: number) => string;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; name: string; slot: number; v: string; row: string } | null>(
    null,
  );
  const box = useRef<HTMLDivElement>(null);
  return (
    <div className={s.viz} ref={box} onMouseLeave={() => setTip(null)}>
      <div className={s.legend}>
        {keys.map((k) => (
          <span key={k.key}>
            <i style={{ background: `var(--s${k.slot})` }} />
            {k.name}
          </span>
        ))}
      </div>
      {rows.map((r, ri) => {
        const total = keys.reduce((a, k) => a + (r.values[k.key] || 0), 0) || 1;
        return (
          <div className={s.barRow} key={ri}>
            <span>{r.label}</span>
            <div className={s.barTrack}>
              {keys
                .filter((k) => (r.values[k.key] || 0) > 0)
                .map((k) => {
                  const v = r.values[k.key] || 0;
                  return (
                    <div
                      key={k.key}
                      className={s.barSeg}
                      style={{ width: `${(v / total) * 100}%`, background: `var(--s${k.slot})` }}
                      onMouseMove={(e) => {
                        const b = box.current?.getBoundingClientRect();
                        if (b) setTip({ x: e.clientX - b.left, y: e.clientY - b.top, name: k.name, slot: k.slot, v: format(v), row: r.label });
                      }}
                      onTouchStart={(e) => {
                        const b = box.current?.getBoundingClientRect();
                        const t = e.touches[0];
                        if (b) setTip({ x: t.clientX - b.left, y: t.clientY - b.top, name: k.name, slot: k.slot, v: format(v), row: r.label });
                      }}
                    />
                  );
                })}
            </div>
          </div>
        );
      })}
      {tip && (
        <div className={s.tip} style={{ left: tip.x, top: tip.y }}>
          <b>{tip.row}</b>
          <span>
            <i style={{ background: `var(--s${tip.slot})` }} />
            {tip.name}: {tip.v}
          </span>
        </div>
      )}
    </div>
  );
}
