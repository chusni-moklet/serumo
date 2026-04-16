"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function BookingButton({ roomId, roomName }: { roomId: string; roomName: string }) {
  return (
    <Link href={`/booking/${roomId}`} className="block">
      <Button className="w-full" size="lg">
        <Calendar className="w-5 h-5" /> Booking Sekarang
      </Button>
    </Link>
  );
}
