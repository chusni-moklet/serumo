export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import BookingForm from "@/components/booking/BookingForm";

export default async function BookingPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/booking/" + roomId);

  const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).single();
  if (!room) notFound();

  const { data: facilities } = await supabase.from("facilities").select("*");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Ruangan</h1>
      <p className="text-gray-500 mb-8">Isi form di bawah untuk memesan <span className="font-medium text-red-600">{room.name}</span></p>
      <BookingForm room={room} facilities={facilities ?? []} userId={user.id} />
    </div>
  );
}
