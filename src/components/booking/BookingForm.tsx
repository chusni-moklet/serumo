"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, calculateDuration } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Room, Facility } from "@/types";

interface Props {
  room: Room;
  facilities: Facility[];
  userId: string;
}

export default function BookingForm({ room, facilities, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const duration = startTime && endTime ? calculateDuration(startTime, endTime) : 0;
  const facilityTotal = Object.entries(selectedFacilities).reduce((sum, [id]) => {
    const f = facilities.find((f) => f.id === id);
    return sum + (f ? f.price : 0);
  }, 0);
  const total = duration > 0 ? duration * room.price + facilityTotal : 0;

  const toggleFacility = (id: string) => {
    setSelectedFacilities((prev) => {
      if (prev[id]) { const next = { ...prev }; delete next[id]; return next; }
      return { ...prev, [id]: 1 };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!date || !startTime || !endTime) {
      setError("Lengkapi tanggal dan waktu booking.");
      return;
    }
    if (duration <= 0) {
      setError("Waktu selesai harus lebih dari waktu mulai.");
      return;
    }

    setLoading(true);

    try {
      // 1. Cek session dulu
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Sesi habis. Silakan login ulang.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      // 2. Cek overlap jadwal
      const { data: conflicts, error: conflictErr } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_id", room.id)
        .eq("date", date)
        .neq("status", "rejected")
        .lt("start_time", endTime)
        .gt("end_time", startTime);

      if (conflictErr) {
        // Jika error RLS, lanjutkan saja (tidak bisa cek overlap)
        console.warn("Conflict check error:", conflictErr.message);
      } else if (conflicts && conflicts.length > 0) {
        setError("Waktu yang dipilih sudah dipesan. Silakan pilih waktu lain.");
        setLoading(false);
        return;
      }

      // 3. Insert booking
      const { data: booking, error: bookingErr } = await supabase
        .from("bookings")
        .insert({
          user_id: session.user.id, // pakai session langsung, bukan prop
          room_id: room.id,
          date,
          start_time: startTime,
          end_time: endTime,
          total_price: total,
          notes: notes || null,
          status: "pending",
        })
        .select()
        .single();

      if (bookingErr) {
        console.error("Booking error:", bookingErr);
        setError(`Gagal membuat booking: ${bookingErr.message}`);
        setLoading(false);
        return;
      }

      if (!booking) {
        setError("Booking gagal dibuat. Coba lagi.");
        setLoading(false);
        return;
      }

      // 4. Insert fasilitas tambahan
      const facilityInserts = Object.entries(selectedFacilities).map(([facility_id, quantity]) => ({
        booking_id: booking.id,
        facility_id,
        quantity,
      }));

      if (facilityInserts.length > 0) {
        const { error: facErr } = await supabase.from("booking_facilities").insert(facilityInserts);
        if (facErr) console.warn("Facility insert error:", facErr.message);
      }

      router.push(`/booking/success/${booking.id}`);

    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Date & Time */}
      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Jadwal Booking</h2>
          <div>
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date" type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="mt-1" required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start">Jam Mulai</Label>
              <Input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="end">Jam Selesai</Label>
              <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1" required />
            </div>
          </div>
          {duration > 0 && (
            <p className="text-sm text-red-700 font-medium bg-red-50 rounded-lg px-3 py-2">
              ⏱ Durasi: <strong>{duration} jam</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Facilities */}
      {facilities.length > 0 && (
        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Fasilitas Tambahan</h2>
            <div className="space-y-3">
              {facilities.map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={f.id}
                      checked={!!selectedFacilities[f.id]}
                      onCheckedChange={() => toggleFacility(f.id)}
                    />
                    <Label htmlFor={f.id} className="cursor-pointer font-normal text-sm">{f.name}</Label>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{formatCurrency(f.price)}/unit</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <Label htmlFor="notes">Catatan Tambahan <span className="text-gray-400 font-normal">(opsional)</span></Label>
          <Textarea
            id="notes" value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kebutuhan khusus, jumlah peserta, dll."
            className="mt-1" rows={3}
          />
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 md:p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Ringkasan Harga</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sewa ruangan ({duration} jam × {formatCurrency(room.price)})</span>
              <span className="font-medium">{formatCurrency(duration * room.price)}</span>
            </div>
            {facilityTotal > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Fasilitas tambahan</span>
                <span className="font-medium">{formatCurrency(facilityTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-red-200 pt-2 mt-1">
              <span>Total</span>
              <span className="text-red-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={loading || total <= 0}>
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
          : "Konfirmasi Booking"
        }
      </Button>
    </form>
  );
}
