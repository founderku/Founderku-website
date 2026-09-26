'use client';

import styles from './FormFields.module.css';

interface Props {
  ruangLingkup: string;
  kewajibanPihakPertama: string;
  kewajibanPihakKedua: string;
  onUbahRuangLingkup: (v: string) => void;
  onUbahKewajibanPertama: (v: string) => void;
  onUbahKewajibanKedua: (v: string) => void;
}

export default function RuangLingkupForm({
  ruangLingkup,
  kewajibanPihakPertama,
  kewajibanPihakKedua,
  onUbahRuangLingkup,
  onUbahKewajibanPertama,
  onUbahKewajibanKedua,
}: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>3. Ruang Lingkup & Kewajiban</h2>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="ruang-lingkup">
          Ruang lingkup kerjasama
        </label>
        <textarea
          id="ruang-lingkup"
          className={styles.textarea}
          placeholder="misal: Pihak Pertama dan Pihak Kedua sepakat bekerjasama dalam produksi dan penjualan kue kering dengan merek..."
          value={ruangLingkup}
          onChange={(e) => onUbahRuangLingkup(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="kewajiban-1">
          Hak dan kewajiban Pihak Pertama
        </label>
        <textarea
          id="kewajiban-1"
          className={styles.textarea}
          placeholder="misal: Menyediakan modal usaha sebesar Rp..., menyediakan tempat produksi..."
          value={kewajibanPihakPertama}
          onChange={(e) => onUbahKewajibanPertama(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="kewajiban-2">
          Hak dan kewajiban Pihak Kedua
        </label>
        <textarea
          id="kewajiban-2"
          className={styles.textarea}
          placeholder="misal: Menyediakan tenaga kerja dan keahlian produksi, bertanggung jawab atas kualitas produk..."
          value={kewajibanPihakKedua}
          onChange={(e) => onUbahKewajibanKedua(e.target.value)}
        />
      </div>
    </div>
  );
}
