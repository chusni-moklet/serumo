import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp, addSecurityHeaders } from "@/lib/security";

const service = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`upload-payment:${ip}`, 10, 60_000); // 10 uploads/min
  if (!allowed) {
    const res = NextResponse.json({ error: "Terlalu banyak request. Coba lagi nanti." }, { status: 429 });
    return addSecurityHeaders(res);
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return addSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bookingId = formData.get("bookingId") as string;

    if (!file || !bookingId) {
      return addSecurityHeaders(NextResponse.json({ error: "File dan bookingId wajib" }, { status: 400 }));
    }

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      return addSecurityHeaders(NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 }));
    }
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return addSecurityHeaders(NextResponse.json({ error: "Format harus JPG, PNG, atau PDF" }, { status: 400 }));
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(bookingId)) {
      return addSecurityHeaders(NextResponse.json({ error: "Booking ID tidak valid" }, { status: 400 }));
    }

    // Verify booking belongs to user
    const { data: booking } = await supabase
      .from("bookings").select("id, user_id").eq("id", bookingId).eq("user_id", user.id).single();

    if (!booking) {
      return addSecurityHeaders(NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 }));
    }

    const ext = file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z]/g, "") ?? "jpg";
    const safeExts = ["jpg", "jpeg", "png", "pdf"];
    if (!safeExts.includes(ext)) {
      return addSecurityHeaders(NextResponse.json({ error: "Ekstensi file tidak valid" }, { status: 400 }));
    }

    const path = `payments/${bookingId}-${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadErr } = await service.storage
      .from("payment-proofs")
      .upload(path, bytes, { contentType: file.type, cacheControl: "3600", upsert: true });

    if (uploadErr) {
      return addSecurityHeaders(NextResponse.json({ error: "Upload gagal" }, { status: 500 }));
    }

    const { data: { publicUrl } } = service.storage.from("payment-proofs").getPublicUrl(path);

    const { error: dbErr } = await service.from("payments").upsert(
      { booking_id: bookingId, proof_url: publicUrl, status: "pending" },
      { onConflict: "booking_id" }
    );

    if (dbErr) {
      return addSecurityHeaders(NextResponse.json({ error: "Gagal simpan data" }, { status: 500 }));
    }

    return addSecurityHeaders(NextResponse.json({ success: true, url: publicUrl }));

  } catch {
    return addSecurityHeaders(NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 }));
  }
}
