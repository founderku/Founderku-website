// Latar belakang bergerak halus buat halaman akun & harga.
// Gayanya ada di globals.css (.fk-backdrop, .fk-blob, .fk-dots).
export function AnimatedBackdrop() {
  return (
    <div className="fk-backdrop" aria-hidden="true">
      <div className="fk-blob fk-blob-a" />
      <div className="fk-blob fk-blob-b" />
      <div className="fk-blob fk-blob-c" />
      <div className="fk-dots" />
    </div>
  );
}
