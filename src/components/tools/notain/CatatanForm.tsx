'use client';

import styles from './FormFields.module.css';

interface Props {
  catatan: string;
  onUbah: (v: string) => void;
}

export default function CatatanForm({ catatan, onUbah }: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>5. Catatan / Info Pembayaran</h2>
      <div className={styles.field}>
        <textarea
          className={styles.textarea}
          placeholder="misal: Transfer ke BCA 1234567890 a.n. Kedai Kue Bu Sari. Pembayaran diterima paling lambat 7 hari setelah invoice diterbitkan."
          value={catatan}
          onChange={(e) => onUbah(e.target.value)}
        />
      </div>
    </div>
  );
}
