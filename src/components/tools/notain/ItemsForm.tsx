'use client';

import { ItemInvoice, hitungSubtotalItem, formatRupiah, buatId } from '@/lib/tools/notain/calculations';
import styles from './FormFields.module.css';

interface Props {
  items: ItemInvoice[];
  onUbah: (items: ItemInvoice[]) => void;
}

export default function ItemsForm({ items, onUbah }: Props) {
  function tambah() {
    onUbah([...items, { id: buatId(), nama: '', qty: 1, hargaSatuan: 0 }]);
  }

  function ubahBaris(id: string, patch: Partial<ItemInvoice>) {
    onUbah(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function hapus(id: string) {
    onUbah(items.filter((item) => item.id !== id));
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>3. Daftar Barang / Jasa</h2>

      {items.length === 0 ? (
        <div className={styles.emptyRow}>Belum ada barang/jasa. Tambah baris di bawah.</div>
      ) : (
        items.map((item) => (
          <div className={styles.itemCard} key={item.id}>
            <div className={styles.itemTop}>
              <input
                className={styles.itemNameInput}
                type="text"
                placeholder="Nama barang/jasa"
                value={item.nama}
                onChange={(e) => ubahBaris(item.id, { nama: e.target.value })}
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => hapus(item.id)}
                aria-label={`Hapus ${item.nama || 'item ini'}`}
              >
                ×
              </button>
            </div>
            <div className={styles.itemRow}>
              <span>Qty</span>
              <input
                className={styles.qtyInput}
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={item.qty === 0 ? '' : item.qty}
                placeholder="1"
                onChange={(e) => ubahBaris(item.id, { qty: Number(e.target.value) || 0 })}
              />
              <span>×</span>
              <span>Rp</span>
              <input
                className={styles.hargaInput}
                type="number"
                min="0"
                inputMode="decimal"
                value={item.hargaSatuan === 0 ? '' : item.hargaSatuan}
                placeholder="0"
                onChange={(e) =>
                  ubahBaris(item.id, { hargaSatuan: Number(e.target.value) || 0 })
                }
              />
              <span className={styles.itemSubtotal}>
                {formatRupiah(hitungSubtotalItem(item))}
              </span>
            </div>
          </div>
        ))
      )}

      <button type="button" className={styles.addBtn} onClick={tambah}>
        + Tambah barang/jasa
      </button>
    </div>
  );
}
