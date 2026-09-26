'use client';

import { PasalTambahan, buatId } from '@/lib/tools/kontrakin/document';
import styles from './FormFields.module.css';

interface Props {
  pasalTambahan: PasalTambahan[];
  onUbah: (pasal: PasalTambahan[]) => void;
}

export default function PasalTambahanForm({ pasalTambahan, onUbah }: Props) {
  function tambah() {
    onUbah([...pasalTambahan, { id: buatId(), judul: '', isi: '' }]);
  }

  function ubahBaris(id: string, patch: Partial<PasalTambahan>) {
    onUbah(pasalTambahan.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function hapus(id: string) {
    onUbah(pasalTambahan.filter((p) => p.id !== id));
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>5. Pasal Tambahan (opsional)</h2>
      <p className={styles.sectionHint}>
        Tambah pasal sendiri kalau perlu, misal Kerahasiaan, Force Majeure, Pembagian Hasil,
        Sanksi, atau apapun yang relevan buat kerjasama kamu. Urutannya ikut urutan kamu
        nambahin di sini, dan otomatis masuk sebelum pasal Penyelesaian Perselisihan.
      </p>

      {pasalTambahan.length === 0 ? (
        <div className={styles.emptyRow}>Belum ada pasal tambahan.</div>
      ) : (
        pasalTambahan.map((p) => (
          <div className={styles.pasalCard} key={p.id}>
            <div className={styles.pasalCardTop}>
              <input
                className={styles.pasalTitleInput}
                type="text"
                placeholder="Judul pasal, misal: Kerahasiaan"
                value={p.judul}
                onChange={(e) => ubahBaris(p.id, { judul: e.target.value })}
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => hapus(p.id)}
                aria-label={`Hapus pasal ${p.judul || 'ini'}`}
              >
                ×
              </button>
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Isi pasalnya..."
              value={p.isi}
              onChange={(e) => ubahBaris(p.id, { isi: e.target.value })}
            />
          </div>
        ))
      )}

      <button type="button" className={styles.addBtn} onClick={tambah}>
        + Tambah pasal
      </button>
    </div>
  );
}
