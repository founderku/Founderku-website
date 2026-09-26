import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function isValidToken(received: string | null): boolean {
  const expected = process.env.XENDIT_CALLBACK_TOKEN;
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  // Panjang beda = pasti gak cocok, tapi tetap dicek pakai
  // timingSafeEqual biar gak ada celah "timing attack" (nebak token
  // huruf demi huruf lewat kecepatan respons server).
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const token = request.headers.get("x-callback-token");
  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Token tidak valid." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Invoice kedaluwarsa: tandai aja biar riwayat di halaman akun rapi.
  if (body.status === "EXPIRED") {
    await admin
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("xendit_invoice_id", body.id)
      .eq("status", "pending");
    return NextResponse.json({ received: true });
  }

  // Status lain selain PAID gak perlu aksi apa pun.
  if (body.status !== "PAID") {
    return NextResponse.json({ received: true });
  }

  // Semua pengecekan penting (nominal cocok, belum pernah diproses,
  // perpanjangan dari tanggal habis lama) dikerjakan di dalam SATU
  // fungsi database activate_subscription (lihat supabase/schema.sql),
  // jadi webhook yang dikirim dobel oleh Xendit gak bisa bikin masa
  // aktif nambah dua kali.
  const paidAmount = Number(body.paid_amount ?? body.amount);
  const { data: result, error } = await admin.rpc("activate_subscription", {
    invoice_id: body.id,
    paid_amount: paidAmount,
  });

  if (error) {
    // Balas 500 biar Xendit coba kirim ulang nanti (misal database lagi
    // gangguan sebentar).
    console.error("activate_subscription gagal:", error.message);
    return NextResponse.json({ error: "Gagal memproses." }, { status: 500 });
  }

  // not_found / amount_mismatch / already_paid tetap dibalas 200: bukan
  // masalah di sisi Xendit, jadi gak perlu dikirim ulang.
  return NextResponse.json({ received: true, result });
}
