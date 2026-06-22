import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function PublicSchedule() {
  const supabase = await createClient();

  // Get today's date in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Fetch approved bookings from today onwards
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      date,
      start_time,
      end_time,
      status,
      room:rooms(name, capacity)
    `)
    .eq("status", "verified")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(10);

  if (error || !bookings || bookings.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Belum ada jadwal penggunaan ruangan terdekat.</p>
      </div>
    );
  }

  // Group bookings by date
  const groupedBookings = bookings.reduce((acc, booking) => {
    if (!acc[booking.date]) {
      acc[booking.date] = [];
    }
    acc[booking.date].push(booking);
    return acc;
  }, {} as Record<string, typeof bookings>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedBookings).map(([dateStr, dayBookings]) => {
        const dateObj = new Date(dateStr);
        const isToday = dateStr === today;

        return (
          <div key={dateStr} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-blue-50/50 border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                {format(dateObj, "EEEE, d MMMM yyyy", { locale: id })}
              </h3>
              {isToday && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  Hari Ini
                </Badge>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {dayBookings.map((booking) => (
                <div key={booking.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 text-blue-700 font-medium px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-4 h-4 opacity-70" />
                      {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{booking.room?.name || "Ruangan"}</h4>
                      <div className="flex items-center text-sm text-gray-500 gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Kapasitas {booking.room?.capacity || 0} Orang</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                      Terjadwal
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
