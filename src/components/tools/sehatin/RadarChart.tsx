'use client';

import { Dimensi, hitungTitikRadar, buatPointsPolygon, buatPointsGrid } from '@/lib/tools/sehatin/health';

interface Props {
  dimensiList: Dimensi[];
  skorPerDimensi: number[];
}

const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS_MAKS = 110;
const LEVEL_GRID = [25, 50, 75, 100];

// Label dipersingkat khusus buat di chart, biar gak kepotong di pinggir SVG.
// Judul lengkapnya tetap dipakai di tempat lain (kartu pertanyaan, breakdown list).
const LABEL_SINGKAT: Record<string, string> = {
  keuangan: 'Keuangan',
  legalitas: 'Legalitas',
  pemasaran: 'Pemasaran',
  operasional: 'Operasional',
  tim: 'Tim',
};

export default function RadarChart({ dimensiList, skorPerDimensi }: Props) {
  const totalSumbu = dimensiList.length;
  const polygonSkor = buatPointsPolygon(skorPerDimensi, CENTER, CENTER, RADIUS_MAKS);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      style={{ height: "auto" }}
      role="img"
      aria-label="Radar chart skor kesehatan bisnis per dimensi"
    >
      {/* Grid cincin referensi */}
      {LEVEL_GRID.map((level) => (
        <polygon
          key={level}
          points={buatPointsGrid(level, totalSumbu, CENTER, CENTER, RADIUS_MAKS)}
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth="1"
        />
      ))}

      {/* Garis dari pusat ke tiap sumbu */}
      {dimensiList.map((_, i) => {
        const titikLuar = hitungTitikRadar(100, i, totalSumbu, CENTER, CENTER, RADIUS_MAKS);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={titikLuar.x}
            y2={titikLuar.y}
            stroke="var(--color-rule)"
            strokeWidth="1"
          />
        );
      })}

      {/* Area skor */}
      <polygon
        points={polygonSkor}
        fill="rgba(179, 120, 31, 0.28)"
        stroke="var(--color-gold)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Titik di tiap sumbu skor */}
      {skorPerDimensi.map((skor, i) => {
        const titik = hitungTitikRadar(skor, i, totalSumbu, CENTER, CENTER, RADIUS_MAKS);
        return <circle key={i} cx={titik.x} cy={titik.y} r="3.5" fill="var(--color-gold)" />;
      })}

      {/* Label tiap dimensi */}
      {dimensiList.map((d, i) => {
        const titikLabel = hitungTitikRadar(100, i, totalSumbu, CENTER, CENTER, RADIUS_MAKS + 26);
        return (
          <text
            key={d.id}
            x={titikLabel.x}
            y={titikLabel.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontFamily="var(--font-body)"
            fill="var(--color-ink-soft)"
          >
            {LABEL_SINGKAT[d.id] ?? d.judul}
          </text>
        );
      })}
    </svg>
  );
}
