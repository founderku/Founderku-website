'use client';

import { PihakInfo } from '@/lib/tools/kontrakin/document';
import styles from './FormFields.module.css';

interface Props {
  title: string;
  info: PihakInfo;
  onUbah: (info: PihakInfo) => void;
  idPrefix: string;
}

export default function PihakForm({ title, info, onUbah, idPrefix }: Props) {
  return (
    <div className={styles.pihakCard}>
      <div className={styles.pihakCardTitle}>{title}</div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-nama`}>
          Nama lengkap
        </label>
        <input
          id={`${idPrefix}-nama`}
          className={styles.textInput}
          type="text"
          value={info.nama}
          onChange={(e) => onUbah({ ...info, nama: e.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-alamat`}>
          Alamat
        </label>
        <input
          id={`${idPrefix}-alamat`}
          className={styles.textInput}
          type="text"
          value={info.alamat}
          onChange={(e) => onUbah({ ...info, alamat: e.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-jabatan`}>
          Jabatan / mewakili (opsional)
        </label>
        <input
          id={`${idPrefix}-jabatan`}
          className={styles.textInput}
          type="text"
          placeholder="misal: Pemilik usaha, Direktur"
          value={info.jabatan}
          onChange={(e) => onUbah({ ...info, jabatan: e.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-identitas`}>
          No. KTP / NPWP (opsional)
        </label>
        <input
          id={`${idPrefix}-identitas`}
          className={styles.textInput}
          type="text"
          value={info.nomorIdentitas}
          onChange={(e) => onUbah({ ...info, nomorIdentitas: e.target.value })}
        />
      </div>
    </div>
  );
}
