'use client';

import { useEffect, useState } from 'react';
import { ItemInvoice, PengaturanPotongan, buatNomorInvoiceDefault } from '@/lib/tools/notain/calculations';
import {
  InfoPenjual,
  DraftInvoice,
  muatInfoPenjual,
  simpanInfoPenjual,
  muatDraft,
  simpanDraft,
  ambilDanNaikkanCounter,
  hapusSemuaData,
  hapusDraftSaja,
} from '@/lib/tools/notain/storage';
import InfoPenjualForm from './InfoPenjualForm';
import InfoInvoiceForm from './InfoInvoiceForm';
import ItemsForm from './ItemsForm';
import PotonganForm from './PotonganForm';
import CatatanForm from './CatatanForm';
import InvoicePreview from './InvoicePreview';
import styles from './Notain.module.css';

const INFO_PENJUAL_AWAL: InfoPenjual = { namaUsaha: '', alamat: '', telepon: '' };

const POTONGAN_AWAL: PengaturanPotongan = {
  diskonMode: 'persen',
  diskonPersen: 0,
  diskonNominal: 0,
  pajakPersen: 0,
};

function tanggalHariIni(): string {
  return new Date().toISOString().slice(0, 10);
}

function buatDraftBaru(): DraftInvoice {
  const nomorUrut = ambilDanNaikkanCounter();
  return {
    nomorInvoice: buatNomorInvoiceDefault(nomorUrut),
    tanggal: tanggalHariIni(),
    namaPembeli: '',
    alamatPembeli: '',
    items: [],
    potongan: POTONGAN_AWAL,
    catatan: '',
  };
}

export default function Notain() {
  const [sudahDimuat, setSudahDimuat] = useState(false);
  const [infoPenjual, setInfoPenjual] = useState<InfoPenjual>(INFO_PENJUAL_AWAL);
  const [draft, setDraft] = useState<DraftInvoice>({
    nomorInvoice: '',
    tanggal: tanggalHariIni(),
    namaPembeli: '',
    alamatPembeli: '',
    items: [],
    potongan: POTONGAN_AWAL,
    catatan: '',
  });

  useEffect(() => {
    const penjualTersimpan = muatInfoPenjual();
    // Data localStorage baru bisa dibaca setelah halaman tampil di browser
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (penjualTersimpan) setInfoPenjual(penjualTersimpan);

    const draftTersimpan = muatDraft();
    if (draftTersimpan) {
      setDraft(draftTersimpan);
    } else {
      setDraft(buatDraftBaru());
    }
    setSudahDimuat(true);
  }, []);

  useEffect(() => {
    if (!sudahDimuat) return;
    simpanInfoPenjual(infoPenjual);
  }, [sudahDimuat, infoPenjual]);

  useEffect(() => {
    if (!sudahDimuat) return;
    simpanDraft(draft);
  }, [sudahDimuat, draft]);

  function ubahItems(items: ItemInvoice[]) {
    setDraft((d) => ({ ...d, items }));
  }

  function invoiceBaru() {
    const yakin = window.confirm(
      'Mulai invoice baru? Data invoice yang sedang diisi (pembeli, barang, catatan) akan dikosongkan. Info usaha kamu tetap tersimpan.'
    );
    if (!yakin) return;
    hapusDraftSaja();
    setDraft(buatDraftBaru());
  }

  function resetSemua() {
    const yakin = window.confirm(
      'Hapus SEMUA data termasuk info usaha kamu? Tindakan ini tidak bisa dibatalkan.'
    );
    if (!yakin) return;
    hapusSemuaData();
    setInfoPenjual(INFO_PENJUAL_AWAL);
    setDraft(buatDraftBaru());
  }

  return (
    <div className={styles.page}>
      <header className={`${styles.header} no-print`}>
        <div className={styles.headerText}>
          <h1>Notain</h1>
          <p className={styles.headerTagline}>
            Bikin invoice profesional dalam hitungan menit. Tanpa akun, data tersimpan di browser
            ini saja.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.actionBtn} onClick={invoiceBaru}>
            Invoice baru
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.dangerBtn}`}
            onClick={resetSemua}
          >
            Reset semua data
          </button>
        </div>
      </header>

      <main className={styles.body}>
        <div className="no-print">
          <InfoPenjualForm info={infoPenjual} onUbah={setInfoPenjual} />

          <InfoInvoiceForm
            nomorInvoice={draft.nomorInvoice}
            tanggal={draft.tanggal}
            namaPembeli={draft.namaPembeli}
            alamatPembeli={draft.alamatPembeli}
            onUbahNomor={(v) => setDraft((d) => ({ ...d, nomorInvoice: v }))}
            onUbahTanggal={(v) => setDraft((d) => ({ ...d, tanggal: v }))}
            onUbahNamaPembeli={(v) => setDraft((d) => ({ ...d, namaPembeli: v }))}
            onUbahAlamatPembeli={(v) => setDraft((d) => ({ ...d, alamatPembeli: v }))}
          />

          <ItemsForm items={draft.items} onUbah={ubahItems} />

          <PotonganForm
            potongan={draft.potongan}
            onUbah={(p) => setDraft((d) => ({ ...d, potongan: p }))}
          />

          <CatatanForm catatan={draft.catatan} onUbah={(v) => setDraft((d) => ({ ...d, catatan: v }))} />
        </div>

        <div className={styles.resultColumn}>
          <InvoicePreview
            infoPenjual={infoPenjual}
            nomorInvoice={draft.nomorInvoice}
            tanggal={draft.tanggal}
            namaPembeli={draft.namaPembeli}
            alamatPembeli={draft.alamatPembeli}
            items={draft.items}
            potongan={draft.potongan}
            catatan={draft.catatan}
          />
        </div>
      </main>
    </div>
  );
}
