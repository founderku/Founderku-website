'use client';

import { useEffect, useState } from 'react';
import { DraftKontrak, PihakInfo } from '@/lib/tools/kontrakin/document';
import {
  muatPihakPertama,
  simpanPihakPertama,
  muatDraft,
  simpanDraft,
  hapusDraftSaja,
  hapusSemuaData,
} from '@/lib/tools/kontrakin/storage';
import InfoUmumForm from './InfoUmumForm';
import PihakSection from './PihakSection';
import RuangLingkupForm from './RuangLingkupForm';
import JangkaWaktuForm from './JangkaWaktuForm';
import PasalTambahanForm from './PasalTambahanForm';
import DocumentPreview from './DocumentPreview';
import styles from './Kontrakin.module.css';

const PIHAK_KOSONG: PihakInfo = { nama: '', alamat: '', jabatan: '', nomorIdentitas: '' };

function draftBaru(pihakPertama: PihakInfo): DraftKontrak {
  return {
    judul: 'Surat Perjanjian Kerjasama',
    nomor: '',
    tanggal: '',
    kota: '',
    pihakPertama,
    pihakKedua: PIHAK_KOSONG,
    ruangLingkup: '',
    kewajibanPihakPertama: '',
    kewajibanPihakKedua: '',
    jangkaWaktuMulai: '',
    jangkaWaktuSelesai: '',
    pasalTambahan: [],
  };
}

export default function Kontrakin() {
  const [sudahDimuat, setSudahDimuat] = useState(false);
  const [draft, setDraft] = useState<DraftKontrak>(draftBaru(PIHAK_KOSONG));

  useEffect(() => {
    const pihakPertamaTersimpan = muatPihakPertama();
    const draftTersimpan = muatDraft();

    if (draftTersimpan) {
      // Data localStorage baru bisa dibaca setelah halaman tampil di browser
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(draftTersimpan);
    } else if (pihakPertamaTersimpan) {
      setDraft(draftBaru(pihakPertamaTersimpan));
    }
    setSudahDimuat(true);
  }, []);

  useEffect(() => {
    if (!sudahDimuat) return;
    simpanDraft(draft);
    simpanPihakPertama(draft.pihakPertama);
  }, [sudahDimuat, draft]);

  function kontrakBaru() {
    const yakin = window.confirm(
      'Mulai kontrak baru? Data yang sedang diisi (pihak kedua, ruang lingkup, dst) akan dikosongkan. Info Pihak Pertama tetap tersimpan.'
    );
    if (!yakin) return;
    hapusDraftSaja();
    setDraft(draftBaru(draft.pihakPertama));
  }

  function resetSemua() {
    const yakin = window.confirm(
      'Hapus SEMUA data termasuk info Pihak Pertama? Tindakan ini tidak bisa dibatalkan.'
    );
    if (!yakin) return;
    hapusSemuaData();
    setDraft(draftBaru(PIHAK_KOSONG));
  }

  return (
    <div className={styles.page}>
      <header className={`${styles.header} no-print`}>
        <div className={styles.headerText}>
          <h1>Kontrakin</h1>
          <p className={styles.headerTagline}>
            Bikin surat perjanjian kerjasama/MOU dalam hitungan menit. Tanpa akun, data
            tersimpan di browser ini saja.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.actionBtn} onClick={kontrakBaru}>
            Kontrak baru
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
          <InfoUmumForm
            judul={draft.judul}
            nomor={draft.nomor}
            tanggal={draft.tanggal}
            kota={draft.kota}
            onUbahJudul={(v) => setDraft((d) => ({ ...d, judul: v }))}
            onUbahNomor={(v) => setDraft((d) => ({ ...d, nomor: v }))}
            onUbahTanggal={(v) => setDraft((d) => ({ ...d, tanggal: v }))}
            onUbahKota={(v) => setDraft((d) => ({ ...d, kota: v }))}
          />

          <PihakSection
            pihakPertama={draft.pihakPertama}
            pihakKedua={draft.pihakKedua}
            onUbahPihakPertama={(info) => setDraft((d) => ({ ...d, pihakPertama: info }))}
            onUbahPihakKedua={(info) => setDraft((d) => ({ ...d, pihakKedua: info }))}
          />

          <RuangLingkupForm
            ruangLingkup={draft.ruangLingkup}
            kewajibanPihakPertama={draft.kewajibanPihakPertama}
            kewajibanPihakKedua={draft.kewajibanPihakKedua}
            onUbahRuangLingkup={(v) => setDraft((d) => ({ ...d, ruangLingkup: v }))}
            onUbahKewajibanPertama={(v) => setDraft((d) => ({ ...d, kewajibanPihakPertama: v }))}
            onUbahKewajibanKedua={(v) => setDraft((d) => ({ ...d, kewajibanPihakKedua: v }))}
          />

          <JangkaWaktuForm
            jangkaWaktuMulai={draft.jangkaWaktuMulai}
            jangkaWaktuSelesai={draft.jangkaWaktuSelesai}
            onUbahMulai={(v) => setDraft((d) => ({ ...d, jangkaWaktuMulai: v }))}
            onUbahSelesai={(v) => setDraft((d) => ({ ...d, jangkaWaktuSelesai: v }))}
          />

          <PasalTambahanForm
            pasalTambahan={draft.pasalTambahan}
            onUbah={(pasal) => setDraft((d) => ({ ...d, pasalTambahan: pasal }))}
          />
        </div>

        <div className={styles.resultColumn}>
          <DocumentPreview draft={draft} />
        </div>
      </main>
    </div>
  );
}
