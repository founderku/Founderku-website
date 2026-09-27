// Daftar id tools yang datanya bisa "disimpan ke akun" (tabel tool_data).
// Tool baru cukup ditambahkan di sini: database menerima kunci berformat
// "<idtool>-<nama>" apa pun (dibatasi 100 simpanan / 5 MB per akun), jadi
// tidak perlu ubah database lagi.
// Id harus huruf kecil/angka, 3-24 karakter, diawali huruf.
export const TOOL_IDS = [
  "notain",
  "pajakin",
  "kontrakin",
  "jalanin",
  "sehatin",
  "validasiin",
  "runwayin",
  "unitin",
  "sahamin",
  "pitchin",
] as const;

export type ToolId = (typeof TOOL_IDS)[number];
