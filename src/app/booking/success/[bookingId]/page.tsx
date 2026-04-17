export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, ArrowRight } from "lucide-react";
import Link from "next/link";
import PaymentUpload from "@/components/booking/PaymentUpload";

export default async function BookingSuccessPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, room:rooms(*), payment:payments(*)")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .single();

  if (!booking) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil!</h1>
        <p className="text-gray-500">Booking Anda telah dibuat. Silakan upload bukti pembayaran.</p>
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Detail Booking</h2>
          <Badge variant="warning">Menunggu Pembayaran</Badge>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">ID Booking</span>
            <span className="font-mono text-xs text-gray-700">{booking.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ruangan</span>
            <span className="font-medium">{booking.room?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tanggal</span>
            <span>{formatDate(booking.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Waktu</span>
            <span>{booking.start_time} – {booking.end_time}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3 mt-3">
            <span>Total Pembayaran</span>
            <span className="text-red-600">{formatCurrency(booking.total_price)}</span>
          </div>
        </div>
      </div>

      {/* Payment Upload */}
      <PaymentUpload bookingId={booking.id} existingPayment={booking.payment} />

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/invoice/${booking.id}`}>
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowRight className="w-4 h-4" /> Lihat Invoice
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="w-full sm:w-auto text-gray-500">
            Riwayat Booking
          </Button>
        </Link>
      </div>
    </div>
  );
}
