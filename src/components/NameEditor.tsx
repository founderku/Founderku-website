"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Ganti nama panggilan (dipakai buat sapaan "Hai, ..." di beranda dan
// halaman akun). Disimpan di data akun Supabase (user_metadata.full_name),
// tempat yang sama dengan nama dari form Daftar / akun Google. Nama ini
// cuma buat sapaan, gak dipakai buat hak akses apa pun.
export function NameEditor({ currentName }: { currentName: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const name = value.trim().replace(/\s+/g, " ");
    if (!name) {
      setError("Nama nggak boleh kosong.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (error) {
      setSaving(false);
      setError("Gagal menyimpan: " + error.message);
      return;
    }
    // Muat ulang supaya sapaan di halaman ini langsung pakai nama baru
    window.location.reload();
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setValue(currentName);
          setEditing(true);
        }}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-manrope font-bold text-text-soft hover:text-ink transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
        Ubah nama
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="mt-3 flex flex-wrap items-center gap-2 max-w-sm">
      <input
        type="text"
        autoFocus
        required
        maxLength={60}
        autoComplete="given-name"
        aria-label="Nama panggilan"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-w-0 flex-1 border border-border rounded-xl px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={saving}
        className="flex-shrink-0 glass-amber text-ink font-manrope font-bold text-xs px-4 py-2.5 rounded-xl disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
      <button
        type="button"
        onClick={() => {
          setEditing(false);
          setError(null);
        }}
        aria-label="Batal ubah nama"
        title="Batal"
        className="flex-shrink-0 w-9 h-9 rounded-xl border border-border text-text-soft hover:text-ink flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      {error && <p className="w-full text-xs text-coral">{error}</p>}
    </form>
  );
}
