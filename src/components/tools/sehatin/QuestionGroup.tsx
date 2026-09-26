'use client';

import { Dimensi, Jawaban, OPSI_JAWABAN, hitungSkorDimensi } from '@/lib/tools/sehatin/health';
import styles from './QuestionGroup.module.css';

interface Props {
  dimensi: Dimensi;
  jawaban: Jawaban;
  onJawab: (pertanyaanId: string, nilai: number) => void;
}

export default function QuestionGroup({ dimensi, jawaban, onJawab }: Props) {
  const skor = hitungSkorDimensi(dimensi, jawaban);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.judul}>{dimensi.judul}</h2>
        <span className={styles.miniScore}>{skor}%</span>
      </div>
      <p className={styles.deskripsi}>{dimensi.deskripsi}</p>

      {dimensi.pertanyaan.map((p) => (
        <div className={styles.pertanyaan} key={p.id}>
          <div className={styles.pertanyaanTeks}>{p.teks}</div>
          <div className={styles.opsiRow}>
            {OPSI_JAWABAN.map((opsi) => (
              <button
                key={opsi.nilai}
                type="button"
                className={`${styles.opsiBtn} ${
                  jawaban[p.id] === opsi.nilai ? styles.opsiBtnActive : ''
                }`}
                onClick={() => onJawab(p.id, opsi.nilai)}
              >
                {opsi.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
