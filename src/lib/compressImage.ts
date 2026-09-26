// Kecilin foto otomatis di browser sebelum diupload - biar user (apalagi
// yang gak terbiasa sama HP/komputer) gak pernah perlu tau soal
// "compress foto" sama sekali. Foto dari kamera HP zaman sekarang
// biasanya 3-8MB, jauh di atas batas upload kita (2MB) - daripada
// nyuruh user compress manual (yang buat sebagian orang itu istilah
// asing/ribet), kita yang urus otomatis.
export async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.8
): Promise<File> {
  // Kalau filenya udah kecil, gak usah diapa-apain lagi (buang-buang
  // waktu proses buat sesuatu yang udah oke).
  if (file.size <= 400 * 1024) return file;

  const bitmap = await createImageBitmap(file);

  let { width, height } = bitmap;
  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) return file;

  // Nama file diseragamin ke .jpg karena hasil compress selalu JPEG,
  // gak peduli aslinya PNG/JPEG - biar konsisten di storage.
  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
