export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Maximize2, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import RoomAdminActions from "@/components/admin/RoomAdminActions";
import type { Room } from "@/types";

export default async function AdminRoomsPage() {
  const supabase = await createClient();
  const { data: rooms } = await supabase.from("rooms").select("*").order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Ruangan</h1>
          <p className="text-gray-500 text-xs mt-0.5">{rooms?.length ?? 0} ruangan terdaftar</p>
        </div>
        <Link href="/admin/rooms/new">
          <Button size="sm" className="md:size-default">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Tambah</span>
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {(!rooms || rooms.length === 0) && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-500 mb-1">Belum ada ruangan</h3>
          <p className="text-gray-400 text-sm mb-5">Tambahkan ruangan pertama</p>
          <Link href="/admin/rooms/new">
            <Button size="sm"><Plus className="w-4 h-4" /> Tambah Ruangan</Button>
          </Link>
        </div>
      )}

      {/* Room list — single col mobile, 2 col tablet, 3 col desktop */}
      {rooms && rooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((room: Room) => (
            <Card key={room.id} className="overflow-hidden">
              {/* Image */}
              <div className="h-36 md:h-44 bg-gray-100 relative overflow-hidden">
                {room.image_url ? (
                  <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-red-50">
                    <Building2 className="w-8 h-8 text-red-300" />
                    <span className="text-xs text-red-400">Belum ada foto</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                {/* Name & Price */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{room.name}</h3>
                  <span className="text-red-600 font-bold text-xs shrink-0">
                    {formatCurrency(room.price)}<span className="text-gray-400 font-normal">/jam</span>
                  </span>
                </div>

                {/* Specs */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {room.capacity} orang
                  </span>
                  {room.area > 0 && (
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" /> {room.area} m²
                    </span>
                  )}
                </div>

                {/* Facility tags */}
                {room.room_facilities && room.room_facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.room_facilities.slice(0, 3).map((f: string) => (
                      <span key={f} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                    {room.room_facilities.length > 3 && (
                      <span className="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full">+{room.room_facilities.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link href={`/admin/rooms/${room.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                  </Link>
                  <RoomAdminActions roomId={room.id} roomName={room.name} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
