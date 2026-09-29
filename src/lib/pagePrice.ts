// Teks harga halaman Pajangin. Harga boleh kosong ("Tanya harga") dan
// boleh punya satuan (misalnya "/jam" atau "/proyek") untuk jasa.
export function pagePriceText(price: number | null | undefined, unit?: string | null): string {
  if (price === null || price === undefined || Number.isNaN(Number(price))) return "Tanya harga";
  return "Rp " + Number(price).toLocaleString("id-ID") + (unit ? " " + unit : "");
}

export function pageWaMessage(name: string, price: number | null | undefined, unit?: string | null): string {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return `Halo! Saya tertarik dengan ${name} dari web. Boleh tanya harga dan detailnya?`;
  }
  return `Halo! Saya mau pesan ${name} (${pagePriceText(price, unit)}) dari web. Apakah masih tersedia?`;
}
