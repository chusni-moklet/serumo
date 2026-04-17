export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDate, calculateDuration } from "@/lib/utils";
import InvoicePrintClient from "./InvoicePrintClient";

export default async function InvoicePage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/invoice/" + bookingId);

  // Fetch booking with all relations
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      room:rooms(*),
      payment:payments(*),
      booking_facilities(*, facility:facilities(*))
    `)
    .eq("id", bookingId)
    .single();

  if (!booking) notFound();

  // Allow owner or admin
  const { data: profile } = await supabase.from("users").select("role, name, email").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";
  const isOwner = booking.user_id === user.id;

  if (!isOwner && !isAdmin) redirect("/dashboard");

  // Get booker profile if admin viewing
  let bookerProfile = profile;
  if (isAdmin && !isOwner) {
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data } = await service.from("users").select("name, email, role").eq("id", booking.user_id).single();
    bookerProfile = data;
  }

  const duration = calculateDuration(booking.start_time, booking.end_time);
  const roomPrice = duration * (booking.room?.price ?? 0);
  const facilityTotal = booking.booking_facilities?.reduce((sum: number, bf: any) => {
    return sum + (bf.facility?.price ?? 0) * (bf.quantity ?? 1);
  }, 0) ?? 0;

  const invoiceData = {
    invoiceNo: `INV-${booking.id.slice(0, 8).toUpperCase()}`,
    bookingId: booking.id,
    issuedAt: new Date(booking.created_at).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    }),
    status: booking.status as "pending" | "verified" | "rejected",
    booker: {
      name: bookerProfile?.name ?? "-",
      email: bookerProfile?.email ?? "-",
    },
    room: {
      name: booking.room?.name ?? "-",
      capacity: booking.room?.capacity ?? 0,
      area: booking.room?.area ?? 0,
    },
    date: formatDate(booking.date),
    rawDate: booking.date,
    startTime: booking.start_time,
    endTime: booking.end_time,
    duration,
    pricePerHour: booking.room?.price ?? 0,
    roomSubtotal: roomPrice,
    facilities: (booking.booking_facilities ?? []).map((bf: any) => ({
      name: bf.facility?.name ?? "-",
      price: bf.facility?.price ?? 0,
      quantity: bf.quantity ?? 1,
      subtotal: (bf.facility?.price ?? 0) * (bf.quantity ?? 1),
    })),
    facilityTotal,
    totalPrice: booking.total_price,
    notes: booking.notes,
    paymentStatus: booking.payment?.status ?? null,
  };

  return <InvoicePrintClient invoice={invoiceData} />;
}
