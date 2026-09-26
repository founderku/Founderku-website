'use client';

import { PengaturanPotongan } from '@/lib/tools/notain/calculations';
import styles from './FormFields.module.css';

interface Props {
  potongan: PengaturanPotongan;
  onUbah: (potongan: PengaturanPotongan) => void;
}

export default function PotonganForm({ potongan, onUbah }: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>4. Diskon & Pajak (opsional)</h2>

      <div className={styles.toggleRow}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${potongan.diskonMode === 'persen' ? styles.toggleBtnActive : ''}`}
          onClick={() => onUbah({ ...potongan, diskonMode: 'persen' })}
        >
          Diskon persen
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${potongan.diskonMode === 'nominal' ? styles.toggleBtnActive : ''}`}
          onClick={() => onUbah({ ...potongan, diskonMode: 'nominal' })}
        >
          Diskon nominal
        </button>
      </div>

      {potongan.diskonMode === 'persen' ? (
        <div className={styles.inlineField}>
          <span className={styles.inlineLabel}>Diskon</span>
          <div className={styles.inlineInputWrap}>
            <input
              className={styles.smallInput}
              type="number"
              min="0"
              max="100"
              inputMode="decimal"
              value={potongan.diskonPersen === 0 ? '' : potongan.diskonPersen}
              placeholder="0"
              onChange={(e) =>
                onUbah({ ...potongan, diskonPersen: Number(e.target.value) || 0 })
              }
            />
            <span className={styles.unitSuffix}>%</span>
          </div>
        </div>
      ) : (
        <div className={styles.inlineField}>
          <span className={styles.inlineLabel}>Diskon</span>
          <div className={styles.inlineInputWrap}>
            <span className={styles.unitSuffix}>Rp</span>
            <input
              className={styles.smallInput}
              type="number"
              min="0"
              inputMode="decimal"
              value={potongan.diskonNominal === 0 ? '' : potongan.diskonNominal}
              placeholder="0"
              onChange={(e) =>
                onUbah({ ...potongan, diskonNominal: Number(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      )}

      <div className={styles.inlineField}>
        <span className={styles.inlineLabel}>Pajak (misal PPN)</span>
        <div className={styles.inlineInputWrap}>
          <input
            className={styles.smallInput}
            type="number"
            min="0"
            inputMode="decimal"
            value={potongan.pajakPersen === 0 ? '' : potongan.pajakPersen}
            placeholder="0"
            onChange={(e) => onUbah({ ...potongan, pajakPersen: Number(e.target.value) || 0 })}
          />
          <span className={styles.unitSuffix}>%</span>
        </div>
      </div>
    </div>
  );
}
