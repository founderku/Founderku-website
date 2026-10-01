# Template tools baru Founderku

Semua tool baru memakai template ini supaya tampilan, mode gelap, tampilan
HP, simpan ke akun, dan cetak PDF-nya seragam. Contoh lengkap: Runwayin
(`src/components/tools/runwayin/Runwayin.tsx`).

## Langkah menambah tool

1. **Daftarkan id** di `src/lib/tools/registry.ts` (huruf kecil/angka,
   3 sampai 24 karakter, diawali huruf). Database tidak perlu diubah:
   tabel `tool_data` menerima kunci `<idtool>-<nama>` apa pun, dibatasi
   300 simpanan dan 10 MB per akun.
2. **Rumus** di `src/lib/tools/<id>/calc.ts`: fungsi murni (tanpa React),
   supaya bisa dites dengan angka contoh sebelum ada tampilannya.
3. **Tampilan** di `src/components/tools/<id>/<Nama>.tsx`:
   - Simpan isian pakai `useToolState("<id>", "draft-v1", AWAL)`. Otomatis
     tersimpan di browser dan ikut ke akun kalau user Pro/trial.
   - Susun pakai `ToolShell`, `Split` (isian kiri, hasil kanan), `Card`,
     `NumInput` (angka/Rupiah), `TextInput`, `TextArea`, `Stat`,
     `Verdict`, `Badge`, `Meter`, `Scale`, `Tabs`, `Toggle`.
   - Tombol kanan atas: `StdActions` (Isi contoh, Kosongkan, Cetak / PDF).
   - Grafik: `LineChart` dan `StackedBars` dari `Charts.tsx` (warna
     `--s1` sampai `--s6`, sudah dicek aman untuk buta warna).
   - Status selalu ikon + teks (`Badge`/`Verdict`), jangan warna saja.
4. **Halaman** di `src/app/(tools)/tools/<id>/page.tsx`: bungkus dengan
   `<ToolFrame toolId="<id>" toolName="<Nama>">` dan isi `metadata`.
5. **Daftarkan di situs** lewat admin (tab Tools) atau
   `public/data/tools.json`: link `/tools/<id>`, kategori, status,
   unggulan, deskripsi singkat. Halaman akun otomatis membuka link
   `/tools/...` di dalam aplikasi.
6. **Ikon akun** (opsional) di `src/components/ToolIcon.tsx`. Tanpa ikon,
   dipakai huruf depan nama tool.

## Aturan

- Tanpa em dash atau en dash di teks mana pun.
- Nominal harga Founderku hanya dari `public/data/pricing.json`.
- Semua angka hasil hitungan harus dites dengan contoh angka yang bisa
  dihitung manual sebelum tayang.
