export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import BookingActions from "@/components/admin/BookingActions";
import ExportButton from "@/components/admin/ExportButton";
import Link from "next/link";
import { FileText } from "lucide-react";

const statusConfig = {
  pending:  { label: "Menunggu",      variant: "warning" as const },
  verified: { label: "Terverifikasi", variant: "success" as const },
  rejected: { label: "Ditolak",       variant: "destructive" as const },
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select("*, room:rooms(*), user:users(*), payment:payments(*)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data: bookings } = await query;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Booking</h1>
          <p className="text-gray-500 text-xs mt-0.5">{bookings?.length ?? 0} booking</p>
        </div>
        <ExportButton bookings={bookings ?? []} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { value: "all", label: "Semua" },
          { value: "pending", label: "Menunggu" },
          { value: "verified", label: "Verified" },
          { value: "rejected", label: "Ditolak" },
        ].map((f) => (
          <a
            key={f.value}
            href={`/admin/bookings?status=${f.value}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              (status ?? "all") === f.value
                ? "bg-red-600 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Tidak ada booking</div>
        ) : (
          bookings.map((booking: any) => {
            const s = statusConfig[booking.status as keyof typeof statusConfig];
            return (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{booking.room?.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{booking.user?.name} · {booking.user?.email}</div>
                    </div>
                    <Badge variant={s.variant} className="shrink-0 text-xs">{s.label}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-2">
                    <span>{booking.date}</span>
                    <span>{booking.start_time} – {booking.end_time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-600 text-sm">{formatCurrency(booking.total_price)}</span>
                    <div className="flex items-center gap-2">
                      <Link href={`/invoice/${booking.id}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Invoice
                      </Link>
                      <BookingActions booking={booking} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Penyewa</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ruangan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Waktu</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!bookings || bookings.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">Tidak ada booking</td></tr>
                ) : (
                  bookings.map((booking: any) => {
                    const s = statusConfig[booking.status as keyof typeof statusConfig];
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{booking.user?.name}</div>
                          <div className="text-xs text-gray-400">{booking.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-sm">{booking.room?.name}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{booking.date}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{booking.start_time} – {booking.end_time}</td>
                        <td className="px-4 py-3 font-semibold text-red-600 text-sm">{formatCurrency(booking.total_price)}</td>
                        <td className="px-4 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                        <td className="px-4 py-3"><BookingActions booking={booking} /></td>
                        <td className="px-4 py-3">
                          <Link href={`/invoice/${booking.id}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Invoice
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
