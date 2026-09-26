'use client';

import { DraftKontrak, susunPasal } from '@/lib/tools/kontrakin/document';
import styles from './DocumentPreview.module.css';

interface Props {
  draft: DraftKontrak;
}

export default function DocumentPreview({ draft }: Props) {
  const pasal = susunPasal(draft);
  const adaIsi =
    draft.pihakPertama.nama || draft.pihakKedua.nama || draft.ruangLingkup.trim();

  return (
    <div className={styles.panel} id="document-preview">
      <div className={styles.docTitle}>
        <div className={styles.docTitleMain}>{draft.judul || 'Surat Perjanjian Kerjasama'}</div>
      </div>
      {draft.nomor && <div className={styles.docNomor}>Nomor: {draft.nomor}</div>}

      {!adaIsi ? (
        <div className={styles.emptyPreview}>
          Isi form di sebelah kiri, dokumennya bakal muncul di sini.
        </div>
      ) : (
        <>
          <p className={styles.pembukaan}>
            Pada hari ini, {draft.tanggal || '[tanggal belum diisi]'}, bertempat di{' '}
            {draft.kota || '[kota belum diisi]'}, kami yang bertanda tangan di bawah ini:
          </p>

          <div className={styles.pihakBlock}>
            <div className={styles.pihakBlockLabel}>
              1. {draft.pihakPertama.nama || '[Nama Pihak Pertama]'}
            </div>
            <div className={styles.pihakBlockDetail}>
              {draft.pihakPertama.jabatan && <>{draft.pihakPertama.jabatan}, </>}
              beralamat di {draft.pihakPertama.alamat || '[alamat belum diisi]'}
              {draft.pihakPertama.nomorIdentitas &&
                `, dengan No. KTP/NPWP ${draft.pihakPertama.nomorIdentitas}`}
              . Selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
            </div>
          </div>

          <div className={styles.pihakBlock}>
            <div className={styles.pihakBlockLabel}>
              2. {draft.pihakKedua.nama || '[Nama Pihak Kedua]'}
            </div>
            <div className={styles.pihakBlockDetail}>
              {draft.pihakKedua.jabatan && <>{draft.pihakKedua.jabatan}, </>}
              beralamat di {draft.pihakKedua.alamat || '[alamat belum diisi]'}
              {draft.pihakKedua.nomorIdentitas &&
                `, dengan No. KTP/NPWP ${draft.pihakKedua.nomorIdentitas}`}
              . Selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
            </div>
          </div>

          <p className={styles.penutupPembukaan}>
            PIHAK PERTAMA dan PIHAK KEDUA selanjutnya secara bersama-sama disebut sebagai{' '}
            <strong>PARA PIHAK</strong>, dengan ini sepakat untuk mengadakan perjanjian
            kerjasama dengan ketentuan-ketentuan sebagai berikut:
          </p>

          {pasal.map((p) => (
            <div className={styles.pasal} key={p.nomor}>
              <div className={styles.pasalJudul}>Pasal {p.nomor}</div>
              <div className={styles.pasalNomor}>{p.judul}</div>
              <div className={styles.pasalIsi}>{p.isi}</div>
            </div>
          ))}

          <p className={styles.penutup}>
            Demikian perjanjian ini dibuat dalam rangkap 2 (dua), bermaterai cukup, masing-masing
            mempunyai kekuatan hukum yang sama, dan ditandatangani oleh PARA PIHAK dalam keadaan
            sadar tanpa paksaan dari pihak manapun.
          </p>

          <div className={styles.tandaTangan}>
            <div className={styles.ttdBlock}>
              <div className={styles.ttdLabel}>PIHAK PERTAMA</div>
              <div className={styles.ttdNama}>
                {draft.pihakPertama.nama || '[Nama Pihak Pertama]'}
              </div>
            </div>
            <div className={styles.ttdBlock}>
              <div className={styles.ttdLabel}>PIHAK KEDUA</div>
              <div className={styles.ttdNama}>
                {draft.pihakKedua.nama || '[Nama Pihak Kedua]'}
              </div>
            </div>
          </div>

          <p className={styles.disclaimer}>
            Dokumen ini dihasilkan otomatis sebagai template umum dan belum tentu sesuai untuk
            semua situasi hukum. Untuk perjanjian bernilai besar, jangka panjang, atau yang
            berisiko tinggi, sebaiknya konsultasikan ke notaris atau konsultan hukum sebelum
            ditandatangani.
          </p>
        </>
      )}

      <button
        type="button"
        className={`${styles.printBtn} no-print`}
        onClick={() => window.print()}
      >
        Cetak / Simpan sebagai PDF
      </button>
    </div>
  );
}
