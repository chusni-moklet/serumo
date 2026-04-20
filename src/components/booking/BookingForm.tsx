"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, calculateDuration } from "@/lib/utils";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import type { Room, Facility } from "@/types";

interface Props {
  room: Room;
  facilities: Facility[];
  userId: string;
}

export default function BookingForm({ room, facilities, userId }: Props) {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const duration = startTime && endTime ? calculateDuration(startTime, endTime) : 0;

  // Harga ditampilkan di UI sebagai estimasi — harga final dihitung server
  const facilityTotal = [...selectedFacilities].reduce((sum, id) => {
    const f = facilities.find((f) => f.id === id);
    return sum + (f ? f.price : 0);
  }, 0);
  const estimatedTotal = duration > 0 ? duration * room.price + facilityTotal : 0;

  const toggleFacility = (id: string) => {
    setSelectedFacilities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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
    if (duration > 24) {
      setError("Durasi booking maksimal 24 jam.");
      return;
    }

    setLoading(true);

    try {
      // Kirim ke API route server-side — total_price dihitung di server
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: room.id,
          date,
          start_time: startTime,
          end_time: endTime,
          notes: notes || null,
          facility_ids: [...selectedFacilities],
          // TIDAK mengirim total_price — dihitung server
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Gagal membuat booking. Coba lagi.");
        setLoading(false);
        return;
      }

      router.push(`/booking/success/${data.bookingId}`);

    } catch (err: any) {
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
                      checked={selectedFacilities.has(f.id)}
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
            maxLength={500}
          />
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 md:p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Estimasi Harga</h2>
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
              <span>Estimasi Total</span>
              <span className="text-red-600">{formatCurrency(estimatedTotal)}</span>
            </div>
          </div>
          {/* Security notice */}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span>Harga final diverifikasi server saat konfirmasi</span>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={loading || estimatedTotal <= 0}>
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
          : "Konfirmasi Booking"
        }
      </Button>
    </form>
  );
}
