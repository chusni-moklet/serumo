export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Users, MapPin, Tv, ArrowLeft, CheckCircle, Maximize2 } from "lucide-react";
import Link from "next/link";
import BookingButton from "@/components/rooms/BookingButton";
import type { Room, Facility } from "@/types";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: room } = await supabase.from("rooms").select("*").eq("id", id).single();
  if (!room) notFound();

  const { data: facilities } = await supabase.from("facilities").select("*");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/rooms" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <div className="rounded-2xl overflow-hidden h-72 md:h-96 bg-gray-100">
            {room.image_url ? (
              <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-red-50">
                <span className="text-gray-300 text-6xl">🏫</span>
              </div>
            )}
          </div>

          {/* Gallery */}
          {room.gallery && room.gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {room.gallery.map((img: string, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden h-28 bg-gray-100">
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          )}

          {/* Virtual Tour */}
          {room.virtual_tour_url && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tv className="w-5 h-5 text-red-600" /> Virtual Tour
              </h2>
              <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video">
                <iframe
                  src={room.virtual_tour_url}
                  className="w-full h-full"
                  allowFullScreen
                  title={`Virtual Tour ${room.name}`}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Deskripsi</h2>
            <p className="text-gray-600 leading-relaxed">{room.description}</p>
          </div>

          {/* Floor Plan */}
          {room.map_image && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" /> Denah Ruangan
              </h2>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <img src={room.map_image} alt="Denah" className="w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
              <Users className="w-4 h-4" />
              <span>Kapasitas {room.capacity} orang</span>
              {room.area > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <Maximize2 className="w-4 h-4" />
                  <span>{room.area} m²</span>
                </>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(room.price)}
                <span className="text-base font-normal text-gray-400">/jam</span>
              </div>
            </div>

            {/* Room Facilities */}
            {room.room_facilities && room.room_facilities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Fasilitas Ruangan</h3>
                <div className="flex flex-wrap gap-1.5">
                  {room.room_facilities.map((f: string) => (
                    <span key={f} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Facilities */}
            {facilities && facilities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Fasilitas Tambahan</h3>
                <ul className="space-y-1">
                  {facilities.map((f: Facility) => (
                    <li key={f.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {f.name}
                      </span>
                      <span className="text-gray-400">{formatCurrency(f.price)}/unit</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <BookingButton roomId={room.id} roomName={room.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
