"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Pill } from "@/components/ui/Pill";
import { ProductCard } from "@/components/ProductCard";
import {
  isValidSlugFormat,
  isSlugBlocked,
  isValidWhatsAppNumber,
  slugify,
  suggestSlugAlternative,
} from "@/lib/validators";
import { MAX_PHOTO_SIZE_MB, ALLOWED_PHOTO_TYPES } from "@/lib/constants";
import { compressImage } from "@/lib/compressImage";
import { PageBackdrop } from "@/components/PageBackdrop";
import type { StoreStyleId } from "@/lib/types";

export default function NewPagePage() {
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [tagline, setTagline] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [highlights, setHighlights] = useState(["", "", ""]);
  const [whatsapp, setWhatsapp] = useState("");
  const [slug, setSlug] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);

  const [slugStatus, setSlugStatus] = useState<
    "idle" | "resolving" | "ready" | "error"
  >("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [storeStyle, setStoreStyle] = useState<StoreStyleId>("klasik");
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    async function checkTip() {
      const dismissed = localStorage.getItem("pajangin_form_tip_dismissed");
      if (!dismissed) setShowTip(true);
    }
    checkTip();
  }, []);

  useEffect(() => {
    async function loadStyle() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("store_style")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.store_style) setStoreStyle(data.store_style);
    }
    loadStyle();
  }, []);

  // Alamat halaman (slug) dibikin otomatis dari nama produk - user nggak
  // perlu mikirin sendiri. Kalau bentrok sama yang sudah ada, sistem
  // otomatis coba "-2", "-3", dst sampai ketemu yang kosong.
  const resolveIdRef = useRef(0);
  const resolveSlug = useCallback(async (name: string) => {
    const thisResolveId = ++resolveIdRef.current;
    const base = slugify(name);

    if (base.length < 3) {
      setSlugStatus("idle");
      setSlug("");
      return;
    }

    setSlugStatus("resolving");
    const supabase = createClient();

    let candidate = base;
    for (let attempt = 0; attempt < 20; attempt++) {
      if (thisResolveId !== resolveIdRef.current) return; // input berubah lagi, batalin

      if (isValidSlugFormat(candidate) && !isSlugBlocked(candidate)) {
        const { data } = await supabase
          .from("pages")
          .select("id")
          .eq("slug", candidate)
          .maybeSingle();

        if (thisResolveId !== resolveIdRef.current) return;

        if (!data) {
          setSlug(candidate);
          setSlugStatus("ready");
          return;
        }
      }
      candidate = suggestSlugAlternative(base, attempt);
    }

    // Kalau 20x coba masih bentrok terus (kasus sangat jarang), tambahin
    // kode acak biar pasti unik.
    const fallback = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (thisResolveId === resolveIdRef.current) {
      setSlug(fallback);
      setSlugStatus("ready");
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => resolveSlug(productName), 500);
    return () => clearTimeout(timeout);
  }, [productName, resolveSlug]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Format foto harus JPG atau PNG.");
      return;
    }

    // Kalau fotonya kegedean, kecilin otomatis dulu di sini - user gak
    // pernah perlu tau soal "compress foto" sama sekali.
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

    // Jaga-jaga: kalau abis dikecilin masih kegedean juga (jarang
    // banget kejadian), baru minta pilih foto lain.
    if (finalFile.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      setPhotoProcessing(false);
      setPhotoError("Foto masih terlalu besar, coba pilih foto lain.");
      return;
    }

    setPhotoProcessing(false);
    setPhotoFile(finalFile);
    setPhotoPreviewUrl(URL.createObjectURL(finalFile));
  }

  async function handlePublish() {
    setFormError(null);

    if (!productName.trim()) return setFormError("Nama produk wajib diisi.");
    if (!promoPrice) return setFormError("Harga promo wajib diisi.");
    if (!isValidWhatsAppNumber(whatsapp))
      return setFormError("Format nomor WhatsApp tidak valid.");
    if (slugStatus !== "ready")
      return setFormError("Tunggu sebentar, sistem masih nyiapin alamat halaman kamu.");

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

    // Upload foto ke bucket "product-photos" dulu (kalau user pilih
    // foto), baru simpan URL publiknya ke kolom image_url.
    let imageUrl: string | null = null;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `${user.id}/${slug}-${Date.now()}.${ext}`;
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

    const { error } = await supabase.from("pages").insert({
      user_id: user.id,
      slug,
      product_name: productName,
      tagline,
      original_price: originalPrice ? Number(originalPrice) : null,
      promo_price: Number(promoPrice),
      highlights: highlights.filter((h) => h.trim().length > 0),
      whatsapp_number: whatsapp,
      image_url: imageUrl,
    });

    if (error) {
      setSubmitting(false);
      setFormError(
        error.message.includes("PAGE_LIMIT")
          ? "Batas 2 halaman akun Free sudah tercapai. Upgrade ke Founderku Pro di halaman Harga buat bikin halaman tanpa batas."
          : "Gagal menyimpan halaman: " + error.message
      );
      return;
    }

    // Kalau ini publish pertama kali user (belum pernah publish
    // sebelumnya), kasih tanda ke dashboard biar nampilin notifikasi
    // "halaman kamu sudah aktif" + tombol salin link. Publish
    // berikutnya tidak akan nampilin notifikasi ini lagi.
    const isFirstPublish = !localStorage.getItem("pajangin_has_published");
    localStorage.setItem("pajangin_has_published", "1");

    router.push(
      isFirstPublish
        ? `/pajangin/dashboard?firstPublish=1&slug=${slug}`
        : "/pajangin/dashboard"
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
        Pajangin
      </p>
      <h1 className="font-manrope font-extrabold text-3xl tracking-tight mb-1">
        Buat Halaman Baru
      </h1>
      <p className="text-sm text-text-soft mb-8">
        Isi form di kiri, lihat hasilnya langsung di kanan.
      </p>

      {showTip && (
        <div className="flex items-start gap-3 bg-indigo/10 border border-indigo/20 rounded-2xl px-4 py-3 mb-6">
          <p className="text-xs text-ink flex-1">
            <span className="font-manrope font-bold">Tips:</span> Isi kolom
            di kiri, hasilnya langsung kelihatan di kanan. Kalau sudah pas,
            klik &quot;Publish&quot; di bagian bawah.
          </p>
          <button
            onClick={() => {
              localStorage.setItem("pajangin_form_tip_dismissed", "1");
              setShowTip(false);
            }}
            aria-label="Tutup tips"
            className="text-text-faint hover:text-ink text-sm leading-none"
          >
            ✕
          </button>
        </div>
      )}

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
                  : "Klik untuk unggah foto dari HP - tidak wajib diisi"}
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                disabled={photoProcessing}
                onChange={handlePhotoChange}
              />
            </label>
            <p className="text-[11px] text-text-faint mt-1">
              Foto besar dari kamera HP otomatis dikecilin sendiri, tidak
              perlu diedit dulu.
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
            <p className="text-[11px] text-text-faint mt-1">
              Format akan divalidasi otomatis sebelum publish.
            </p>
          </Field>

          {productName.trim().length > 0 && (
            <p className="text-xs text-text-faint -mt-1">
              {slugStatus === "resolving" && "Menyiapkan alamat halaman..."}
              {slugStatus === "ready" && (
                <>Alamat halaman: founderku.com/l/{slug}</>
              )}
            </p>
          )}

          {formError && <p className="text-sm text-coral">{formError}</p>}

          <Pill
            variant="solid-amber"
            className="w-full justify-center"
            disabled={submitting}
            onClick={handlePublish}
          >
            {submitting ? "Menyimpan..." : "Publish Halaman"}
          </Pill>
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
              imageUrl: photoPreviewUrl,
              whatsappNumber: whatsapp,
              showWatermark: true,
            }}
          />
          <p className="text-[11px] text-text-faint text-center mt-3">
            founderku.com/l/{slug || "..."}
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
