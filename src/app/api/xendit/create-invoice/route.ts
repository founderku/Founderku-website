import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createXenditClient } from "@/lib/xendit";
import { PRICING, getPriceOption } from "@/lib/pricing";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  // Nominal & lama aktif SELALU diambil dari data/pricing.json di server,
  // browser cuma ngirim id pilihan harganya ("monthly", "yearly", dst).
  const option =
    typeof body?.priceId === "string" ? getPriceOption(body.priceId) : undefined;

  if (!option) {
    return NextResponse.json({ error: "Paket tidak valid." }, { status: 400 });
  }

  const { amount, days } = option;
  const origin = new URL(request.url).origin;

  // Pengaman anti-spam: cegah 1 user bikin banyak invoice pending
  // berturut-turut (misal double-click atau script otomatis). Kalau
  // udah ada 3+ invoice pending dalam 1 jam terakhir, tahan dulu.
  const admin = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: pendingCount } = await admin
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending")
    .gte("created_at", oneHourAgo);

  if ((pendingCount ?? 0) >= 3) {
    return NextResponse.json(
      {
        error:
          "Ada beberapa pembayaran yang belum selesai. Coba selesaikan salah satunya dulu, atau tunggu beberapa saat sebelum coba lagi.",
      },
      { status: 429 }
    );
  }

  // external_id ini yang dipakai buat ngelacak invoice ini balik ke user
  // mana - sengaja diselipin user.id di dalamnya sebagai jaga-jaga kalau
  // ada masalah, meski pencarian utamanya tetap lewat xendit_invoice_id.
  const externalId = `founderku-${user.id}-${Date.now()}`;

  try {
    const xendit = createXenditClient();
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId,
        amount,
        payerEmail: user.email,
        description: `${PRICING.planName} - ${option.label.id}`,
        successRedirectUrl: `${origin}/akun?upgraded=1`,
        failureRedirectUrl: `${origin}/harga?failed=1`,
      },
    });

    // Simpan record "pending" - dipakai admin service role, bukan client
    // biasa, karena RLS tabel subscriptions sengaja gak ngasih akses
    // insert/update dari sisi client sama sekali.
    const { error: dbError } = await admin.from("subscriptions").insert({
      user_id: user.id,
      xendit_invoice_id: invoice.id,
      price_id: option.id,
      amount,
      days,
      status: "pending",
    });

    if (dbError) {
      // Detail error cuma dicatat di log server, gak dikirim ke browser
      console.error("Simpan langganan gagal:", dbError.message);
      return NextResponse.json(
        { error: "Gagal menyiapkan pembayaran. Coba lagi sebentar lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: invoice.invoiceUrl });
  } catch (err) {
    console.error("Buat invoice Xendit gagal:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Gagal membuat tagihan. Coba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}
