import { toWhatsAppLink } from "./validators";

// Cara pembeli menghubungi penjual di halaman Pajangin: WhatsApp atau
// email (untuk penjual yang tidak mau nomornya tampil publik).
// Kalau keduanya terisi, WhatsApp yang dipakai.

export type JalurKontak = "wa" | "email";

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Harus sama dengan constraint pages_contact_email_ok (migration 019)
export function isValidEmail(email: string): boolean {
  const e = email.trim();
  return e.length <= 120 && EMAIL_PATTERN.test(e);
}

export function jalurKontak(wa: string | null | undefined, email: string | null | undefined): JalurKontak | null {
  if (wa && wa.trim()) return "wa";
  if (email && email.trim()) return "email";
  return null;
}

export function linkKontak(
  wa: string | null | undefined,
  email: string | null | undefined,
  pesan: string,
  subjek: string,
): string | null {
  const jalur = jalurKontak(wa, email);
  if (jalur === "wa") return toWhatsAppLink(wa!, pesan);
  if (jalur === "email")
    return `mailto:${email!.trim()}?subject=${encodeURIComponent(subjek)}&body=${encodeURIComponent(pesan)}`;
  return null;
}
