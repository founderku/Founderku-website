'use client';

import { useEffect, useState } from 'react';
import {
  TAHAPAN,
  hitungProgressTotal,
  hitungTotalSelesai,
  hitungTotalItem,
  cariTahapAktif,
} from '@/lib/tools/jalanin/roadmap';
import { muatProgress, simpanProgress, hapusProgress } from '@/lib/tools/jalanin/storage';
import TahapCard from './TahapCard';
import styles from './Jalanin.module.css';

export default function Jalanin() {
  const [sudahDimuat, setSudahDimuat] = useState(false);
  const [selesai, setSelesai] = useState<string[]>([]);
  const [tahapTerbuka, setTahapTerbuka] = useState<string>('');

  useEffect(() => {
    const progress = muatProgress();
    // Data localStorage baru bisa dibaca setelah halaman tampil di browser
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelesai(progress);
    setTahapTerbuka(cariTahapAktif(TAHAPAN, progress));
    setSudahDimuat(true);
  }, []);

  useEffect(() => {
    if (!sudahDimuat) return;
    simpanProgress(selesai);
  }, [sudahDimuat, selesai]);

  function toggleItem(itemId: string) {
    setSelesai((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }

  function toggleTahapTerbuka(tahapId: string) {
    setTahapTerbuka((prev) => (prev === tahapId ? '' : tahapId));
  }

  function resetProgress() {
    const yakin = window.confirm(
      'Hapus semua progress checklist? Tindakan ini tidak bisa dibatalkan.'
    );
    if (!yakin) return;
    hapusProgress();
    setSelesai([]);
    setTahapTerbuka(TAHAPAN[0]?.id ?? '');
  }

  const progressTotal = hitungProgressTotal(TAHAPAN, selesai);
  const totalSelesai = hitungTotalSelesai(TAHAPAN, selesai);
  const totalItem = hitungTotalItem(TAHAPAN);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <svg
            className={styles.headerIcon}
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4 20C4 20 6 14 12 14C18 14 20 8 20 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="4" cy="20" r="1.8" fill="currentColor" />
            <circle cx="20" cy="8" r="1.8" fill="currentColor" />
            <path d="M17 5L20 8L17 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1>Jalanin</h1>
        </div>
        <p className={styles.headerTagline}>
          Checklist tahap-tahap membangun usaha, dari validasi ide sampai scale up. Tanpa akun,
          progress tersimpan di browser ini saja.
        </p>
        <div className={styles.overallProgressRow}>
          <div className={styles.overallBar}>
            <div className={styles.overallFill} style={{ width: `${progressTotal}%` }} />
          </div>
          <div className={styles.overallLabel}>
            {totalSelesai}/{totalItem} langkah ({progressTotal}%)
          </div>
        </div>
      </header>

      <main className={styles.body}>
        {TAHAPAN.map((tahap) => (
          <TahapCard
            key={tahap.id}
            tahap={tahap}
            selesai={selesai}
            terbuka={tahapTerbuka === tahap.id}
            onToggleBuka={() => toggleTahapTerbuka(tahap.id)}
            onToggleItem={toggleItem}
          />
        ))}

        <button type="button" className={styles.resetBtn} onClick={resetProgress}>
          Reset progress
        </button>
      </main>
    </div>
  );
}
