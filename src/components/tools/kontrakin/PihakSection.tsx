'use client';

import { PihakInfo } from '@/lib/tools/kontrakin/document';
import PihakForm from './PihakForm';
import styles from './FormFields.module.css';

interface Props {
  pihakPertama: PihakInfo;
  pihakKedua: PihakInfo;
  onUbahPihakPertama: (info: PihakInfo) => void;
  onUbahPihakKedua: (info: PihakInfo) => void;
}

export default function PihakSection({
  pihakPertama,
  pihakKedua,
  onUbahPihakPertama,
  onUbahPihakKedua,
}: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>2. Para Pihak</h2>
      <p className={styles.sectionHint}>
        Pihak Pertama biasanya usaha/kamu sendiri, otomatis kesimpen buat kontrak berikutnya.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <PihakForm
          title="Pihak Pertama"
          info={pihakPertama}
          onUbah={onUbahPihakPertama}
          idPrefix="p1"
        />
        <PihakForm title="Pihak Kedua" info={pihakKedua} onUbah={onUbahPihakKedua} idPrefix="p2" />
      </div>
    </div>
  );
}
