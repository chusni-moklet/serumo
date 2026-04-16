"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function RoomAdminActions({
  roomId,
  roomName,
}: {
  roomId: string;
  roomName?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Hapus ruangan "${roomName ?? "ini"}"?\n\nSemua data booking terkait juga akan terhapus.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("rooms").delete().eq("id", roomId);
    if (error) {
      alert("Gagal menghapus: " + error.message);
      setDeleting(false);
      return;
    }
    router.refresh();
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      title="Hapus ruangan"
    >
      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </Button>
  );
}
