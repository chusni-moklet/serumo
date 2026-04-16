import RoomForm from "@/components/admin/RoomForm";

export default function NewRoomPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Ruangan Baru</h1>
      <RoomForm />
    </div>
  );
}
