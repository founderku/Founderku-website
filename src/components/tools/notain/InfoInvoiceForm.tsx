'use client';

import styles from './FormFields.module.css';

interface Props {
  nomorInvoice: string;
  tanggal: string;
  namaPembeli: string;
  alamatPembeli: string;
  onUbahNomor: (v: string) => void;
  onUbahTanggal: (v: string) => void;
  onUbahNamaPembeli: (v: string) => void;
  onUbahAlamatPembeli: (v: string) => void;
}

export default function InfoInvoiceForm({
  nomorInvoice,
  tanggal,
  namaPembeli,
  alamatPembeli,
  onUbahNomor,
  onUbahTanggal,
  onUbahNamaPembeli,
  onUbahAlamatPembeli,
}: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>2. Info Invoice & Pembeli</h2>
      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="nomor-invoice">
            Nomor invoice
          </label>
          <input
            id="nomor-invoice"
            className={styles.textInput}
            type="text"
            value={nomorInvoice}
            onChange={(e) => onUbahNomor(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tanggal-invoice">
            Tanggal
          </label>
          <input
            id="tanggal-invoice"
            className={styles.dateInput}
            type="date"
            value={tanggal}
            onChange={(e) => onUbahTanggal(e.target.value)}
          />
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="nama-pembeli">
            Nama pembeli
          </label>
          <input
            id="nama-pembeli"
            className={styles.textInput}
            type="text"
            placeholder="misal: Budi Santoso"
            value={namaPembeli}
            onChange={(e) => onUbahNamaPembeli(e.target.value)}
          />
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="alamat-pembeli">
            Alamat pembeli (opsional)
          </label>
          <input
            id="alamat-pembeli"
            className={styles.textInput}
            type="text"
            value={alamatPembeli}
            onChange={(e) => onUbahAlamatPembeli(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
