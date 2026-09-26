'use client';

import { useEffect, useState } from 'react';
import { DIMENSI, Jawaban } from '@/lib/tools/sehatin/health';
import { muatJawaban, simpanJawaban, hapusJawaban } from '@/lib/tools/sehatin/storage';
import QuestionGroup from './QuestionGroup';
import ResultPanel from './ResultPanel';
import styles from './Sehatin.module.css';

export default function Sehatin() {
  const [sudahDimuat, setSudahDimuat] = useState(false);
  const [jawaban, setJawaban] = useState<Jawaban>({});

  useEffect(() => {
    // Data localStorage baru bisa dibaca setelah halaman tampil di browser
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJawaban(muatJawaban());
    setSudahDimuat(true);
  }, []);

  useEffect(() => {
    if (!sudahDimuat) return;
    simpanJawaban(jawaban);
  }, [sudahDimuat, jawaban]);

  function jawabPertanyaan(pertanyaanId: string, nilai: number) {
    setJawaban((prev) => ({ ...prev, [pertanyaanId]: nilai }));
  }

  function resetSemua() {
    const yakin = window.confirm('Hapus semua jawaban? Tindakan ini tidak bisa dibatalkan.');
    if (!yakin) return;
    hapusJawaban();
    setJawaban({});
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.headerTop}>
            <svg className={styles.headerIcon} width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 15L9 9L13 12L20 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 4H20V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 19H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <h1>Sehatin</h1>
          </div>
          <p className={styles.headerTagline}>
            Cek kesehatan usaha kamu di 5 aspek: keuangan, legalitas, pemasaran, operasional,
            dan tim. Tanpa akun, jawaban tersimpan di browser ini saja.
          </p>
        </div>
        <button type="button" className={styles.resetBtn} onClick={resetSemua}>
          Reset jawaban
        </button>
      </header>

      <main className={styles.body}>
        <div>
          {DIMENSI.map((dimensi) => (
            <QuestionGroup
              key={dimensi.id}
              dimensi={dimensi}
              jawaban={jawaban}
              onJawab={jawabPertanyaan}
            />
          ))}
        </div>

        <div className={styles.resultColumn}>
          <ResultPanel jawaban={jawaban} />
        </div>
      </main>
    </div>
  );
}
