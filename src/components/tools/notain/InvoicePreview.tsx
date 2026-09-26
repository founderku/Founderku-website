'use client';

import {
  ItemInvoice,
  PengaturanPotongan,
  hitungInvoice,
  hitungSubtotalItem,
  formatRupiah,
  formatTanggalIndonesia,
} from '@/lib/tools/notain/calculations';
import { InfoPenjual } from '@/lib/tools/notain/storage';
import styles from './InvoicePreview.module.css';

interface Props {
  infoPenjual: InfoPenjual;
  nomorInvoice: string;
  tanggal: string;
  namaPembeli: string;
  alamatPembeli: string;
  items: ItemInvoice[];
  potongan: PengaturanPotongan;
  catatan: string;
}

export default function InvoicePreview({
  infoPenjual,
  nomorInvoice,
  tanggal,
  namaPembeli,
  alamatPembeli,
  items,
  potongan,
  catatan,
}: Props) {
  const hasil = hitungInvoice(items, potongan);

  return (
    <div className={styles.panel} id="invoice-preview">
      <div className={styles.letterhead}>
        <div>
          <h2 className={styles.businessName}>{infoPenjual.namaUsaha || 'Nama Usaha Kamu'}</h2>
          <div className={styles.businessDetail}>
            {infoPenjual.alamat && <div>{infoPenjual.alamat}</div>}
            {infoPenjual.telepon && <div>{infoPenjual.telepon}</div>}
          </div>
        </div>
        <div className={styles.invoiceLabel}>
          <div className={styles.invoiceLabelTitle}>INVOICE</div>
          <div className={styles.invoiceMeta}>
            <div>{nomorInvoice}</div>
            <div>{formatTanggalIndonesia(tanggal)}</div>
          </div>
        </div>
      </div>

      <div className={styles.billTo}>
        <div className={styles.billToLabel}>Ditagihkan kepada</div>
        <div className={styles.billToName}>{namaPembeli || 'Nama Pembeli'}</div>
        {alamatPembeli && <div className={styles.billToAddress}>{alamatPembeli}</div>}
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyPreview}>Belum ada barang/jasa ditambahkan.</div>
      ) : (
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Barang / Jasa</th>
              <th className={styles.num}>Qty</th>
              <th className={styles.num}>Harga</th>
              <th className={styles.num}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.nama || '-'}</td>
                <td className={styles.num}>{item.qty}</td>
                <td className={styles.num}>{formatRupiah(item.hargaSatuan)}</td>
                <td className={styles.num}>{formatRupiah(hitungSubtotalItem(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatRupiah(hasil.subtotal)}</span>
        </div>
        {hasil.jumlahDiskon > 0 && (
          <div className={styles.summaryRow}>
            <span>Diskon</span>
            <span>-{formatRupiah(hasil.jumlahDiskon)}</span>
          </div>
        )}
        {potongan.pajakPersen > 0 && (
          <div className={styles.summaryRow}>
            <span>Pajak ({potongan.pajakPersen}%)</span>
            <span>{formatRupiah(hasil.jumlahPajak)}</span>
          </div>
        )}
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <span>{formatRupiah(hasil.total)}</span>
        </div>
      </div>

      {catatan && <div className={styles.catatanBlock}>{catatan}</div>}

      <button type="button" className={`${styles.printBtn} no-print`} onClick={() => window.print()}>
        Cetak / Simpan sebagai PDF
      </button>
    </div>
  );
}
