'use client';

import {
  DIMENSI,
  Jawaban,
  hitungSkorDimensi,
  hitungSkorTotal,
  labelSkor,
  jumlahPertanyaanTerjawab,
  jumlahPertanyaanTotal,
} from '@/lib/tools/sehatin/health';
import RadarChart from './RadarChart';
import styles from './ResultPanel.module.css';

const AMBANG_REKOMENDASI = 65; // dimensi dengan skor di bawah ini dapat rekomendasi

export default function ResultPanel({ jawaban }: { jawaban: Jawaban }) {
  const terjawab = jumlahPertanyaanTerjawab(DIMENSI, jawaban);
  const totalPertanyaan = jumlahPertanyaanTotal(DIMENSI);
  const skorTotal = hitungSkorTotal(DIMENSI, jawaban);
  const skorPerDimensi = DIMENSI.map((d) => hitungSkorDimensi(d, jawaban));

  const dimensiLemah = DIMENSI.filter(
    (d) => hitungSkorDimensi(d, jawaban) < AMBANG_REKOMENDASI
  );

  const belumMulai = terjawab === 0;

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Hasil Cek Kesehatan Bisnis</h2>
      <p className={styles.panelSubtitle}>
        {terjawab}/{totalPertanyaan} pertanyaan terjawab
      </p>

      {belumMulai ? (
        <div className={styles.emptyState}>
          Jawab pertanyaan di sebelah kiri, hasilnya bakal muncul di sini secara langsung.
        </div>
      ) : (
        <>
          <div className={styles.scoreHeadline}>
            <div className={styles.scoreNumber}>{skorTotal}</div>
            <div className={styles.scoreLabel}>{labelSkor(skorTotal)}</div>
          </div>

          <div className={styles.chartWrap}>
            <RadarChart dimensiList={DIMENSI} skorPerDimensi={skorPerDimensi} />
          </div>

          <div className={styles.breakdownList}>
            {DIMENSI.map((d, i) => (
              <div className={styles.breakdownRow} key={d.id}>
                <span className={styles.breakdownLabel}>{d.judul}</span>
                <div className={styles.breakdownBar}>
                  <div
                    className={styles.breakdownFill}
                    style={{ width: `${skorPerDimensi[i]}%` }}
                  />
                </div>
                <span className={styles.breakdownValue}>{skorPerDimensi[i]}%</span>
              </div>
            ))}
          </div>

          {dimensiLemah.length > 0 && (
            <div className={styles.rekomendasiBlock}>
              <div className={styles.rekomendasiTitle}>Rekomendasi buat kamu</div>
              {dimensiLemah.map((d) => (
                <div className={styles.rekomendasiItem} key={d.id}>
                  <span>💡</span>
                  <span>
                    <span className={styles.rekomendasiDimensi}>{d.judul}: </span>
                    {d.rekomendasi}
                  </span>
                </div>
              ))}
            </div>
          )}

          {terjawab < totalPertanyaan && (
            <p className={styles.progressNote}>
              Jawab semua pertanyaan buat hasil yang lebih akurat.
            </p>
          )}
        </>
      )}
    </div>
  );
}
