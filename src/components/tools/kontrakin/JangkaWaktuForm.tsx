'use client';

import styles from './FormFields.module.css';

interface Props {
  jangkaWaktuMulai: string;
  jangkaWaktuSelesai: string;
  onUbahMulai: (v: string) => void;
  onUbahSelesai: (v: string) => void;
}

export default function JangkaWaktuForm({
  jangkaWaktuMulai,
  jangkaWaktuSelesai,
  onUbahMulai,
  onUbahSelesai,
}: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>4. Jangka Waktu</h2>
      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="mulai">
            Mulai berlaku
          </label>
          <input
            id="mulai"
            className={styles.textInput}
            type="text"
            placeholder="misal: 1 Oktober 2026"
            value={jangkaWaktuMulai}
            onChange={(e) => onUbahMulai(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="selesai">
            Sampai dengan (opsional)
          </label>
          <input
            id="selesai"
            className={styles.textInput}
            type="text"
            placeholder="kosongkan kalau tidak ditentukan"
            value={jangkaWaktuSelesai}
            onChange={(e) => onUbahSelesai(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
