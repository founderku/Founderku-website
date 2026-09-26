'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  hitungPajakUMKM,
  formatRupiah,
  BATAS_BEBAS_PAJAK,
  BATAS_MAKSIMAL_OMZET,
} from '@/lib/tools/pajakin/calculations';
import { muatDraft, simpanDraft } from '@/lib/tools/pajakin/storage';
import styles from './PajakCalculator.module.css';

export default function PajakCalculator() {
  const [sudahDimuat, setSudahDimuat] = useState(false);
  const [omzetSebelumBulanIni, setOmzetSebelumBulanIni] = useState(0);
  const [omzetBulanIni, setOmzetBulanIni] = useState(0);

  useEffect(() => {
    const draft = muatDraft();
    if (draft) {
      // Data localStorage baru bisa dibaca setelah halaman tampil di browser
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOmzetSebelumBulanIni(draft.omzetSebelumBulanIni ?? 0);
      setOmzetBulanIni(draft.omzetBulanIni ?? 0);
    }
    setSudahDimuat(true);
  }, []);

  useEffect(() => {
    if (!sudahDimuat) return;
    simpanDraft({ omzetSebelumBulanIni, omzetBulanIni });
  }, [sudahDimuat, omzetSebelumBulanIni, omzetBulanIni]);

  const hasil = useMemo(
    () => hitungPajakUMKM(omzetSebelumBulanIni, omzetBulanIni),
    [omzetSebelumBulanIni, omzetBulanIni]
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Pajakin</h1>
        <p className={styles.headerTagline}>
          Hitung PPh Final UMKM (0,5%) bulan ini, termasuk jatah bebas pajak Rp500 juta
          pertama per tahun. Tanpa akun, data tersimpan di browser ini saja.
        </p>
      </header>

      <main className={styles.body}>
        <div className={styles.inputCard}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="omzet-sebelum">
              Omzet kumulatif tahun ini, SEBELUM bulan ini
              <span className={styles.labelHint}>
                Total omzet dari Januari sampai bulan lalu. Isi 0 kalau ini bulan pertama usaha
                kamu tahun ini.
              </span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.rpPrefix}>Rp</span>
              <input
                id="omzet-sebelum"
                className={styles.numberInput}
                type="number"
                min="0"
                inputMode="numeric"
                value={omzetSebelumBulanIni === 0 ? '' : omzetSebelumBulanIni}
                placeholder="0"
                onChange={(e) => setOmzetSebelumBulanIni(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="omzet-bulan-ini">
              Omzet bulan ini
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.rpPrefix}>Rp</span>
              <input
                id="omzet-bulan-ini"
                className={styles.numberInput}
                type="number"
                min="0"
                inputMode="numeric"
                value={omzetBulanIni === 0 ? '' : omzetBulanIni}
                placeholder="0"
                onChange={(e) => setOmzetBulanIni(Number(e.target.value) || 0)}
              />
            </div>

            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${hasil.persenTerpakaiBatasBebas}%` }}
                />
              </div>
              <div className={styles.progressLabel}>
                Jatah bebas pajak Rp500 juta terpakai {hasil.persenTerpakaiBatasBebas.toFixed(0)}%
                (kumulatif sampai bulan ini: {formatRupiah(hasil.omzetSetelahBulanIni)})
              </div>
            </div>
          </div>
        </div>

        <div className={styles.resultCard}>
          <h2 className={styles.resultTitle}>Hasil Bulan Ini</h2>

          <div className={styles.row}>
            <span className={styles.rowLabel}>Bagian bebas pajak</span>
            <span className={styles.rowValue}>{formatRupiah(hasil.bagianBebasPajak)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Bagian kena pajak (0,5%)</span>
            <span className={styles.rowValue}>{formatRupiah(hasil.bagianKenaPajak)}</span>
          </div>

          <div
            className={`${styles.pajakBox} ${
              hasil.pajakTerutang === 0 ? styles.pajakBoxNol : styles.pajakBoxAdaPajak
            }`}
          >
            <div className={styles.pajakBoxLabel}>PPh Final yang harus disetor bulan ini</div>
            <div className={styles.pajakBoxValue}>{formatRupiah(hasil.pajakTerutang)}</div>
            {hasil.pajakTerutang === 0 && (
              <div className={styles.pajakBoxNote}>
                Belum kena pajak, omzet kumulatif kamu masih di bawah Rp500 juta.
              </div>
            )}
          </div>

          {hasil.sudahLewatBatasMaksimal && (
            <div className={styles.warningBox}>
              <div className={styles.warningTitle}>Sudah lewat batas Rp4,8 miliar/tahun</div>
              <div>
                Omzet kumulatif kamu tahun ini udah lewat batas maksimal skema PPh Final UMKM.
                Sebaiknya konsultasi ke konsultan pajak atau kantor pajak terdekat soal
                kewajiban pajak normal (non-final) yang berlaku buat kamu selanjutnya.
              </div>
            </div>
          )}

          <p className={styles.footnote}>
            Berdasarkan PP 20/2026 (berlaku sejak 22 April 2026). Tarif 0,5% dan batas omzet
            bebas pajak Rp{formatRupiah(BATAS_BEBAS_PAJAK).replace('Rp ', '')} berlaku buat WP
            Orang Pribadi, PT Perorangan, dan koperasi dengan omzet setahun sampai{' '}
            {formatRupiah(BATAS_MAKSIMAL_OMZET)}. Kalkulator ini cuma simulasi, bukan pengganti
            konsultasi pajak resmi - kondisi tiap usaha bisa beda.
          </p>
        </div>
      </main>
    </div>
  );
}
