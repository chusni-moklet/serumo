export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, Clock, TrendingUp, DoorOpen, Users, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalBookings },
    { count: verifiedBookings },
    { count: pendingBookings },
    { count: totalRooms },
    { count: totalUsers },
    { data: revenueData },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "verified"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("rooms").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "user"),
    supabase.from("bookings").select("total_price").eq("status", "verified"),
    supabase.from("bookings").select("*, room:rooms(name), user:users(name)").order("created_at", { ascending: false }).limit(5),
  ]);

  const totalRevenue = revenueData?.reduce((sum: number, b: any) => sum + (b.total_price ?? 0), 0) ?? 0;

  const stats = [
    { label: "Total Booking", value: totalBookings ?? 0, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Terverifikasi", value: verifiedBookings ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Menunggu", value: pendingBookings ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Pendapatan", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-red-700", bg: "bg-red-50" },
    { label: "Ruangan", value: totalRooms ?? 0, icon: DoorOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pengguna", value: totalUsers ?? 0, icon: Users, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  const statusConfig: Record<string, { label: string; variant: any }> = {
    pending:  { label: "Menunggu", variant: "warning" },
    verified: { label: "Verified",  variant: "success" },
    rejected: { label: "Ditolak",   variant: "destructive" },
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-0.5">Ringkasan aktivitas Serumo</p>
      </div>

      {/* Stats grid — 2 col mobile, 3 col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-lg md:text-2xl font-bold text-gray-900 leading-none truncate">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions — 2x2 grid mobile */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Aksi Cepat</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/rooms/new">
            <div className="flex items-center gap-3 p-3.5 rounded-xl transition-colors text-white" style={{ background: "linear-gradient(135deg, #E40521, #B8001A)" }}>
              <Plus className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium leading-tight">Tambah Ruangan</span>
            </div>
          </Link>
          <Link href="/admin/rooms">
            <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <DoorOpen className="w-5 h-5 text-purple-500 shrink-0" />
              <span className="text-sm font-medium text-gray-700 leading-tight">Kelola Ruangan</span>
            </div>
          </Link>
          <Link href="/admin/bookings">
            <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <CalendarDays className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-sm font-medium text-gray-700 leading-tight">Lihat Booking</span>
            </div>
          </Link>
          <Link href="/admin/facilities">
            <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-sm font-medium text-gray-700 leading-tight">Fasilitas</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Booking Terbaru</h2>
          <Link href="/admin/bookings">
            <Button variant="ghost" size="sm" className="text-red-600 h-7 px-2 text-xs">
              Semua <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {!recentBookings || recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Belum ada booking</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentBookings.map((b: any) => {
                  const s = statusConfig[b.status];
                  return (
                    <div key={b.id} className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm truncate">{b.room?.name ?? "-"}</div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate">
                          {b.user?.name ?? "-"} · {b.date}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                        <span className="text-xs font-bold text-red-600">{formatCurrency(b.total_price)}</span>
                        <Badge variant={s.variant} className="text-xs py-0">{s.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
