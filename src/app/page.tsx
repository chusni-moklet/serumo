export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Users, Building2, Calendar, Shield, CheckCircle, Star } from "lucide-react";
import type { Room } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: rooms } = await supabase.from("rooms").select("*").limit(6);
  const { count: totalBookings } = await supabase.from("bookings").select("*", { count: "exact", head: true });

  return (
    <div>
      {/* Hero — Telkom gradient */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #E40521 0%, #B8001A 35%, #001F5C 70%, #003087 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-5">
              <span className="text-xs text-white font-medium">🏫 SMK Telkom Malang</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-white">
              Sewa Ruangan<br />
              <span className="text-yellow-300">Moklet</span> Mudah &<br />
              Transparan
            </h1>
            <p className="text-base text-white/80 mb-7 max-w-md leading-relaxed">
              Booking ruangan sekolah secara online. Lihat virtual tour, pilih fasilitas, dan konfirmasi pembayaran — semua dalam satu platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/rooms">
                <Button size="lg" className="w-full sm:w-auto bg-white text-red-700 hover:bg-red-50 shadow-xl font-semibold">
                  Lihat Ruangan <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-black/20 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">{rooms?.length ?? 0}+</div>
                <div className="text-white/60 text-xs md:text-sm">Ruangan</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">{totalBookings ?? 0}+</div>
                <div className="text-white/60 text-xs md:text-sm">Booking</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">100%</div>
                <div className="text-white/60 text-xs md:text-sm">Terverifikasi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Kenapa Serumo?</h2>
            <p className="text-gray-500 text-sm">Platform booking ruangan SMK Telkom Malang yang modern</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Building2, title: "Virtual Tour 360°", desc: "Lihat kondisi ruangan langsung sebelum booking melalui virtual tour interaktif.", color: "from-red-500 to-red-700" },
              { icon: Calendar, title: "Booking Real-time", desc: "Cek ketersediaan otomatis, tidak ada double booking, jadwal selalu akurat.", color: "from-blue-700 to-blue-900" },
              { icon: Shield, title: "Pembayaran Aman", desc: "Upload bukti bayar dan tunggu verifikasi admin. Proses transparan dan terpercaya.", color: "from-red-600 to-blue-800" },
            ].map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Catalog Preview */}
      {rooms && rooms.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ruangan Tersedia</h2>
                <p className="text-gray-500 text-sm mt-1">Pilih ruangan yang sesuai kebutuhan Anda</p>
              </div>
              <Link href="/rooms">
                <Button variant="outline" size="sm">Semua <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map((room: Room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — Telkom gradient */}
      <section className="py-14 md:py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #003087 0%, #0047C8 50%, #E40521 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-2xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Siap Booking Ruangan?</h2>
          <p className="text-white/70 mb-8 text-sm leading-relaxed">Daftar sekarang dan nikmati kemudahan booking ruangan SMK Telkom Malang secara online.</p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-xl w-full sm:w-auto">
              Mulai Sekarang <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function RoomCard({ room }: { room: Room }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-0 shadow-md">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {room.image_url ? (
          <img src={room.image_url} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fff1f2, #eff6ff)" }}>
            <Building2 className="w-12 h-12 text-red-200" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className="bg-emerald-500 text-white border-0 text-xs shadow-md">Tersedia</Badge>
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate text-base">{room.name}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>{room.capacity} orang</span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{room.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-red-600 font-bold text-base">{formatCurrency(room.price)}</span>
            <span className="text-gray-400 text-xs">/jam</span>
          </div>
          <Link href={`/rooms/${room.id}`}>
            <Button size="sm" className="text-xs h-8">Detail</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
