'use client';

import { InfoPenjual } from '@/lib/tools/notain/storage';
import styles from './FormFields.module.css';

interface Props {
  info: InfoPenjual;
  onUbah: (info: InfoPenjual) => void;
}

export default function InfoPenjualForm({ info, onUbah }: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>1. Info Usaha Kamu</h2>
      <div className={styles.fieldGrid}>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="nama-usaha">
            Nama usaha
          </label>
          <input
            id="nama-usaha"
            className={styles.textInput}
            type="text"
            placeholder="misal: Kedai Kue Bu Sari"
            value={info.namaUsaha}
            onChange={(e) => onUbah({ ...info, namaUsaha: e.target.value })}
          />
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="alamat-usaha">
            Alamat (opsional)
          </label>
          <input
            id="alamat-usaha"
            className={styles.textInput}
            type="text"
            placeholder="misal: Jl. Merdeka No. 10, Istanbul"
            value={info.alamat}
            onChange={(e) => onUbah({ ...info, alamat: e.target.value })}
          />
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="telepon-usaha">
            No. telepon / WhatsApp (opsional)
          </label>
          <input
            id="telepon-usaha"
            className={styles.textInput}
            type="text"
            placeholder="misal: 0812-3456-7890"
            value={info.telepon}
            onChange={(e) => onUbah({ ...info, telepon: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
