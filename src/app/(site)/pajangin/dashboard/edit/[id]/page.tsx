"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Pill } from "@/components/ui/Pill";
import { ProductCard } from "@/components/ProductCard";
import { isValidWhatsAppNumber } from "@/lib/validators";
import { MAX_PHOTO_SIZE_MB, ALLOWED_PHOTO_TYPES } from "@/lib/constants";
import { compressImage } from "@/lib/compressImage";
import { PageBackdrop } from "@/components/PageBackdrop";
import type { StoreStyleId, PageRow } from "@/lib/types";

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const pageId = params.id;

  const [loadState, setLoadState] = useState<
    "loading" | "ready" | "not-found"
  >("loading");

  const [productName, setProductName] = useState("");
  const [tagline, setTagline] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [highlights, setHighlights] = useState(["", "", ""]);
  const [whatsapp, setWhatsapp] = useState("");
  const [slug, setSlug] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [storeStyle, setStoreStyle] = useState<StoreStyleId>("klasik");

  // Ambil data halaman yang mau diedit + style toko user, pastikan
  // halaman ini beneran punya user yang lagi login (jangan sampai
  // orang lain bisa edit halaman produk orang lain lewat URL id).
  useEffect(() => {
    async function loadPage() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/masuk");
        return;
      }

      const [{ data: page }, { data: profile }] = await Promise.all([
        supabase
          .from("pages")
          .select("*")
          .eq("id", pageId)
          .eq("user_id", user.id)
          .maybeSingle<PageRow>(),
        supabase
          .from("profiles")
          .select("store_style")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      if (!page) {
        setLoadState("not-found");
        return;
      }

      setProductName(page.product_name);
      setTagline(page.tagline ?? "");
      setOriginalPrice(
        page.original_price ? String(page.original_price) : ""
      );
      setPromoPrice(page.promo_price ? String(page.promo_price) : "");
      const h = page.highlights ?? [];
      setHighlights([h[0] ?? "", h[1] ?? "", h[2] ?? ""]);
      setWhatsapp(page.whatsapp_number);
      setSlug(page.slug);
      setExistingImageUrl(page.image_url);
      if (profile?.store_style) setStoreStyle(profile.store_style);
      setLoadState("ready");
    }
    loadPage();
  }, [pageId, router]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Format foto harus JPG atau PNG.");
      return;
    }

    setPhotoProcessing(true);
    let finalFile = file;
    if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      try {
        finalFile = await compressImage(file);
      } catch {
        setPhotoProcessing(false);
        setPhotoError("Gagal memproses foto. Coba pilih foto lain.");
        return;
      }
    }

    if (finalFile.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      setPhotoProcessing(false);
      setPhotoError("Foto masih terlalu besar, coba pilih foto lain.");
      return;
    }

    setPhotoProcessing(false);
    setPhotoFile(finalFile);
    setPhotoPreviewUrl(URL.createObjectURL(finalFile));
  }

  async function handleSave() {
    setFormError(null);

    if (!productName.trim()) return setFormError("Nama produk wajib diisi.");
    if (!promoPrice) return setFormError("Harga promo wajib diisi.");
    if (!isValidWhatsAppNumber(whatsapp))
      return setFormError("Format nomor WhatsApp tidak valid.");

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      router.push("/masuk");
      return;
    }

    // Kalau user pilih foto baru, upload dulu ke bucket "product-photos"
    // dan pakai URL publiknya. Kalau tidak pilih foto baru, foto lama
    // tetap dipakai (kolom image_url tidak disentuh sama sekali).
    let imageUrl: string | undefined = undefined;
    if (photoFile) {
      // Nama file acak (bukan nama produk/waktu) supaya alamat foto gak
      // bisa ditebak. Folder = id akun (diwajibkan aturan storage).
      const ext = photoFile.type === "image/png" ? "png" : "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-photos")
        .upload(path, photoFile);

      if (uploadError) {
        setSubmitting(false);
        setFormError("Gagal unggah foto: " + uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-photos").getPublicUrl(path);
      imageUrl = publicUrl;
    }

    const { error } = await supabase
      .from("pages")
      .update({
        product_name: productName,
        tagline,
        original_price: originalPrice ? Number(originalPrice) : null,
        promo_price: Number(promoPrice),
        highlights: highlights.filter((h) => h.trim().length > 0),
        whatsapp_number: whatsapp,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      })
      .eq("id", pageId)
      .eq("user_id", user.id);

    if (error) {
      setSubmitting(false);
      setFormError("Gagal menyimpan perubahan: " + error.message);
      return;
    }

    router.push("/pajangin/dashboard");
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Yakin mau hapus halaman ini? Link-nya bakal langsung mati dan tidak bisa dibalikin."
    );
    if (!confirmed) return;

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      router.push("/masuk");
      return;
    }

    const { error } = await supabase
      .from("pages")
      .delete()
      .eq("id", pageId)
      .eq("user_id", user.id);

    if (error) {
      setSubmitting(false);
      setFormError("Gagal menghapus halaman: " + error.message);
      return;
    }

    router.push("/pajangin/dashboard");
  }

  if (loadState === "loading") {
    return (
      <div className="fk-app">
        <PageBackdrop variant="form" />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-sm text-text-soft">Memuat data halaman...</p>
        </div>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <div className="fk-app">
        <PageBackdrop variant="form" />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-sm text-text-soft mb-4">
            Halaman yang kamu cari tidak ditemukan, atau bukan milikmu.
          </p>
          <Link
            href="/pajangin/dashboard"
            className="text-sm font-bold text-ink border-b-2 border-amber"
          >
            ← Kembali ke Halaman Saya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fk-app">
      <PageBackdrop variant="form" />
      <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/pajangin" className="inline-flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pajangin-assets/logo.jpeg"
            alt="Pajangin"
            className="w-8 h-8 rounded-xl transition-transform group-hover:-translate-y-0.5"
          />
          <span className="font-manrope font-extrabold text-sm">Pajangin</span>
        </Link>
      </div>

      <Link
        href="/pajangin/dashboard"
        className="block text-xs font-manrope font-bold text-text-soft mb-3"
      >
        ← Kembali ke Halaman Saya
      </Link>

      <p className="font-manrope text-xs font-bold uppercase tracking-wide text-text-faint mb-1">
        Ubah detail halaman
      </p>
      <h1 className="font-manrope font-extrabold text-3xl tracking-tight mb-1">
        Edit Halaman
      </h1>
      <p className="text-sm text-text-soft mb-8">
        founderku.com/l/{slug}
      </p>

      <div className="grid md:grid-cols-2 gap-9">
        <div className="space-y-4">
          <Field label="Nama Produk">
            <input
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </Field>

          <Field label="Tagline Singkat">
            <input
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </Field>

          <div className="flex gap-3">
            <Field label="Harga Normal (Rp)" className="flex-1">
              <input
                type="number"
                className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />
            </Field>
            <Field label="Harga Promo (Rp)" className="flex-1">
              <input
                type="number"
                className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
              />
            </Field>
          </div>

          {highlights.map((h, i) => (
            <Field label={`Keunggulan ${i + 1}`} key={i}>
              <input
                className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
                value={h}
                onChange={(e) => {
                  const next = [...highlights];
                  next[i] = e.target.value;
                  setHighlights(next);
                }}
              />
            </Field>
          ))}

          <Field label="Foto Produk (boleh dilewati)">
            <label className="block border border-dashed border-border rounded-2xl p-5 text-center text-sm text-text-soft cursor-pointer">
              {photoProcessing
                ? "Memproses foto..."
                : photoFile
                  ? photoFile.name
                  : "Klik untuk ganti foto dari HP"}
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                disabled={photoProcessing}
                onChange={handlePhotoChange}
              />
            </label>
            <p className="text-[11px] text-text-faint mt-1">
              Foto besar dari kamera HP otomatis dikecilin sendiri.
            </p>
            {photoError && <p className="text-xs text-coral mt-1">{photoError}</p>}
          </Field>

          <Field label="Nomor WhatsApp">
            <input
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm"
              placeholder="0812xxxxxxxx"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </Field>

          {formError && <p className="text-sm text-coral">{formError}</p>}

          <Pill
            variant="solid-amber"
            className="w-full justify-center"
            disabled={submitting}
            onClick={handleSave}
          >
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Pill>

          <button
            onClick={handleDelete}
            disabled={submitting}
            className="w-full text-center text-xs font-bold text-coral py-2"
          >
            Hapus Halaman Ini
          </button>
        </div>

        <div className="md:sticky md:top-6 self-start">
          <p className="font-manrope font-semibold text-xs text-text-soft mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-700 animate-pulse" />
            Preview langsung (Golden Template)
          </p>
          <ProductCard
            style={storeStyle}
            data={{
              productName,
              tagline,
              originalPrice: originalPrice ? Number(originalPrice) : null,
              promoPrice: promoPrice ? Number(promoPrice) : null,
              highlights,
              imageUrl: photoPreviewUrl ?? existingImageUrl,
              whatsappNumber: whatsapp,
              showWatermark: true,
            }}
          />
          <p className="text-[11px] text-text-faint text-center mt-3">
            founderku.com/l/{slug}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-manrope font-bold uppercase tracking-wide text-text-soft mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
