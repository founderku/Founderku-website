'use client';

import styles from './FormFields.module.css';

interface Props {
  judul: string;
  nomor: string;
  tanggal: string;
  kota: string;
  onUbahJudul: (v: string) => void;
  onUbahNomor: (v: string) => void;
  onUbahTanggal: (v: string) => void;
  onUbahKota: (v: string) => void;
}

export default function InfoUmumForm({
  judul,
  nomor,
  tanggal,
  kota,
  onUbahJudul,
  onUbahNomor,
  onUbahTanggal,
  onUbahKota,
}: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>1. Info Umum</h2>
      <div className={styles.fieldGrid}>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="judul">
            Judul perjanjian
          </label>
          <input
            id="judul"
            className={styles.textInput}
            type="text"
            value={judul}
            onChange={(e) => onUbahJudul(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="nomor">
            Nomor (opsional)
          </label>
          <input
            id="nomor"
            className={styles.textInput}
            type="text"
            placeholder="misal: 001/SPK/IX/2026"
            value={nomor}
            onChange={(e) => onUbahNomor(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tanggal">
            Tanggal
          </label>
          <input
            id="tanggal"
            className={styles.textInput}
            type="text"
            placeholder="misal: 15 September 2026"
            value={tanggal}
            onChange={(e) => onUbahTanggal(e.target.value)}
          />
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="kota">
            Kota (tempat perjanjian dibuat & yurisdiksi kalau ada sengketa)
          </label>
          <input
            id="kota"
            className={styles.textInput}
            type="text"
            value={kota}
            onChange={(e) => onUbahKota(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
