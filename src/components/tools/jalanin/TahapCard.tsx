'use client';

import { RoadmapTahap, hitungProgressTahap, hitungJumlahSelesai } from '@/lib/tools/jalanin/roadmap';
import styles from './TahapCard.module.css';

interface Props {
  tahap: RoadmapTahap;
  selesai: string[];
  terbuka: boolean;
  onToggleBuka: () => void;
  onToggleItem: (itemId: string) => void;
}

export default function TahapCard({ tahap, selesai, terbuka, onToggleBuka, onToggleItem }: Props) {
  const progress = hitungProgressTahap(tahap, selesai);
  const jumlahSelesai = hitungJumlahSelesai(tahap, selesai);
  const semuaSelesai = progress === 100;

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.cardHeader}
        onClick={onToggleBuka}
        aria-expanded={terbuka}
      >
        <div className={`${styles.nomorBadge} ${semuaSelesai ? styles.nomorBadgeSelesai : ''}`}>
          {semuaSelesai ? '✓' : tahap.nomor}
        </div>
        <div className={styles.headerText}>
          <div className={styles.judul}>{tahap.judul}</div>
          <div className={styles.deskripsi}>{tahap.deskripsi}</div>
        </div>
        <div className={styles.progressCol}>
          <div className={styles.miniBar}>
            <div className={styles.miniFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.miniLabel}>
            {jumlahSelesai}/{tahap.items.length}
          </div>
        </div>
        <svg
          className={`${styles.chevron} ${terbuka ? styles.chevronOpen : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {terbuka && (
        <div className={styles.itemList}>
          {tahap.items.map((item) => {
            const sudahSelesai = selesai.includes(item.id);
            return (
              <div className={styles.item} key={item.id}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  id={item.id}
                  checked={sudahSelesai}
                  onChange={() => onToggleItem(item.id)}
                />
                <label htmlFor={item.id} style={{ flex: 1 }}>
                  <span className={`${styles.itemText} ${sudahSelesai ? styles.itemTextSelesai : ''}`}>
                    {item.teks}
                  </span>
                  {item.hint && <span className={styles.itemHint}>💡 {item.hint}</span>}
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
