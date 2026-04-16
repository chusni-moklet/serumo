export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Building2, Users, Maximize2 } from "lucide-react";
import Link from "next/link";
import type { Room } from "@/types";

export default async function RoomsPage() {
  const supabase = await createClient();
  const { data: rooms } = await supabase.from("rooms").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Katalog Ruangan</h1>
        <p className="text-gray-500 text-sm">Temukan ruangan yang sesuai kebutuhan acara Anda</p>
      </div>

      {!rooms || rooms.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-500">Belum ada ruangan tersedia</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room: Room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {room.image_url ? (
                  <img src={room.image_url} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-50">
                    <Building2 className="w-12 h-12 text-red-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-500 text-white border-0 text-xs">Tersedia</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{room.name}</h3>
                <div className="flex items-center gap-3 text-gray-500 text-xs mb-2">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {room.capacity} orang</span>
                  {room.area > 0 && <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /> {room.area} m²</span>}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{room.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-red-600 font-bold">{formatCurrency(room.price)}</span>
                    <span className="text-gray-400 text-xs ml-1">/jam</span>
                  </div>
                  <Link href={`/rooms/${room.id}`}>
                    <Button size="sm" className="text-xs h-8">Lihat Detail</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
