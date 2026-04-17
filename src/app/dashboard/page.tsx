export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Building2, Upload, Plus, User } from "lucide-react";
import Link from "next/link";
import type { Booking } from "@/types";

const statusConfig = {
  pending:  { label: "Menunggu Verifikasi", variant: "warning" as const },
  verified: { label: "Terverifikasi",        variant: "success" as const },
  rejected: { label: "Ditolak",              variant: "destructive" as const },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, room:rooms(*), payment:payments(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const stats = {
    total:    bookings?.length ?? 0,
    verified: bookings?.filter((b) => b.status === "verified").length ?? 0,
    pending:  bookings?.filter((b) => b.status === "pending").length ?? 0,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Halo, <span className="font-medium text-red-600">{profile?.name}</span> 👋
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <User className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/rooms">
            <Button size="sm"><Plus className="w-4 h-4" /> Booking</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total",       value: stats.total,    color: "text-gray-900" },
          { label: "Verified",    value: stats.verified, color: "text-green-600" },
          { label: "Menunggu",    value: stats.pending,  color: "text-yellow-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking List */}
      <Card>
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base">Riwayat Booking</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!bookings || bookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Belum ada booking</p>
              <Link href="/rooms" className="mt-3 inline-block">
                <Button size="sm" variant="outline">Mulai Booking</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking: Booking & { room: any; payment: any }) => {
                const status = statusConfig[booking.status];
                const hasPayment = !!booking.payment;
                return (
                  <div key={booking.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{booking.room?.name}</h3>
                          <Badge variant={status.variant} className="text-xs py-0 shrink-0">{status.label}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {booking.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {booking.start_time} – {booking.end_time}
                          </span>
                        </div>
                        <div className="mt-1.5 font-bold text-red-600 text-sm">{formatCurrency(booking.total_price)}</div>
                      </div>
                      <div className="flex flex-col gap-2 items-end shrink-0">
                        {!hasPayment && booking.status === "pending" && (
                          <Link href={`/booking/success/${booking.id}`}>
                            <Button size="sm" variant="outline" className="text-xs h-8">
                              <Upload className="w-3 h-3" /> Bayar
                            </Button>
                          </Link>
                        )}
                        <Link href={`/invoice/${booking.id}`}>
                          <Button size="sm" variant="ghost" className="text-xs h-7 text-gray-400 hover:text-red-600">
                            Invoice
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
