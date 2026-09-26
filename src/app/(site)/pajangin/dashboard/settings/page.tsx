import { redirect } from "next/navigation";

// Pengaturan akun sekarang ada di halaman akun Founderku.
export default function SettingsPage() {
  redirect("/akun");
}
