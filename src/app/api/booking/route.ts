import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp, addSecurityHeaders } from "@/lib/security";
import { z } from "zod";

const service = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const bookingSchema = z.object({
  room_id: z.string().uuid("room_id tidak valid"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format jam tidak valid"),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format jam tidak valid"),
  notes: z.string().max(500).optional().nullable(),
  facility_ids: z.array(z.string().uuid()).optional().default([]),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`booking:${ip}`, 10, 60_000);
  if (!allowed) {
    return addSecurityHeaders(NextResponse.json({ error: "Terlalu banyak request" }, { status: 429 }));
  }

  try {
    // 1. Verify auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return addSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    // 2. Validate input
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Input tidak valid";
      return addSecurityHeaders(NextResponse.json({ error: msg }, { status: 400 }));
    }

    const { room_id, date, start_time, end_time, notes, facility_ids } = parsed.data;

    // 3. Validate time logic
    const [sh, sm] = start_time.split(":").map(Number);
    const [eh, em] = end_time.split(":").map(Number);
    const durationHours = (eh * 60 + em - (sh * 60 + sm)) / 60;

    if (durationHours <= 0) {
      return addSecurityHeaders(NextResponse.json({ error: "Waktu selesai harus lebih dari waktu mulai" }, { status: 400 }));
    }
    if (durationHours > 24) {
      return addSecurityHeaders(NextResponse.json({ error: "Durasi maksimal 24 jam" }, { status: 400 }));
    }

    // 4. Validate date not in past
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return addSecurityHeaders(NextResponse.json({ error: "Tanggal booking tidak boleh di masa lalu" }, { status: 400 }));
    }

    // 5. Get room price from DB (server-side, cannot be manipulated)
    const { data: room, error: roomErr } = await service
      .from("rooms")
      .select("id, price, name")
      .eq("id", room_id)
      .single();

    if (roomErr || !room) {
      return addSecurityHeaders(NextResponse.json({ error: "Ruangan tidak ditemukan" }, { status: 404 }));
    }

    // 6. Calculate total price SERVER-SIDE (never trust client)
    const roomSubtotal = Math.round(durationHours * room.price);

    // 7. Get facility prices from DB
    let facilityTotal = 0;
    const validFacilities: { facility_id: string; quantity: number; price: number }[] = [];

    if (facility_ids.length > 0) {
      const { data: facilities } = await service
        .from("facilities")
        .select("id, price")
        .in("id", facility_ids);

      if (facilities) {
        for (const f of facilities) {
          facilityTotal += f.price;
          validFacilities.push({ facility_id: f.id, quantity: 1, price: f.price });
        }
      }
    }

    const totalPrice = roomSubtotal + facilityTotal;

    // 8. Check double booking
    const { data: conflicts } = await service
      .from("bookings")
      .select("id")
      .eq("room_id", room_id)
      .eq("date", date)
      .neq("status", "rejected")
      .lt("start_time", end_time)
      .gt("end_time", start_time);

    if (conflicts && conflicts.length > 0) {
      return addSecurityHeaders(NextResponse.json({ error: "Waktu yang dipilih sudah dipesan" }, { status: 409 }));
    }

    // 9. Insert booking with SERVER-CALCULATED price
    const { data: booking, error: bookingErr } = await service
      .from("bookings")
      .insert({
        user_id: user.id,
        room_id,
        date,
        start_time,
        end_time,
        total_price: totalPrice, // Dihitung server, bukan dari client
        notes: notes ?? null,
        status: "pending",       // Selalu pending, tidak bisa dimanipulasi
      })
      .select()
      .single();

    if (bookingErr || !booking) {
      return addSecurityHeaders(NextResponse.json({ error: "Gagal membuat booking" }, { status: 500 }));
    }

    // 10. Insert facilities
    if (validFacilities.length > 0) {
      await service.from("booking_facilities").insert(
        validFacilities.map((f) => ({
          booking_id: booking.id,
          facility_id: f.facility_id,
          quantity: f.quantity,
        }))
      );
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      bookingId: booking.id,
      totalPrice,
    }));

  } catch (err: any) {
    console.error("Booking API error:", err);
    return addSecurityHeaders(NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 }));
  }
}
