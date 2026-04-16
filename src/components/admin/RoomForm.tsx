"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import type { Room } from "@/types";

export default function RoomForm({ room }: { room?: Room }) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!room;

  const [form, setForm] = useState({
    name: room?.name ?? "",
    description: room?.description ?? "",
    price: room?.price?.toString() ?? "",
    capacity: room?.capacity?.toString() ?? "",
    area: room?.area?.toString() ?? "",
    image_url: room?.image_url ?? "",
    virtual_tour_url: room?.virtual_tour_url ?? "",
    map_image: room?.map_image ?? "",
  });

  const [roomFacilities, setRoomFacilities] = useState<string[]>(room?.room_facilities ?? []);
  const [facilityInput, setFacilityInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const addFacility = () => {
    const val = facilityInput.trim();
    if (!val || roomFacilities.includes(val)) return;
    setRoomFacilities((p) => [...p, val]);
    setFacilityInput("");
  };

  const removeFacility = (item: string) => {
    setRoomFacilities((p) => p.filter((f) => f !== item));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "tour" | "map") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }

    setUploadingImage(type);
    setError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);

    try {
      const res = await fetch("/api/upload-room-image", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Upload gagal");
        setUploadingImage(null);
        return;
      }

      // Update form dengan URL hasil upload
      if (type === "main") set("image_url", data.url);
      else if (type === "tour") set("virtual_tour_url", data.url);
      else if (type === "map") set("map_image", data.url);

    } catch (err: any) {
      setError("Upload gagal: " + err.message);
    }

    setUploadingImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        capacity: Number(form.capacity),
        area: Number(form.area) || 0,
        room_facilities: roomFacilities,
        image_url: form.image_url,
        virtual_tour_url: form.virtual_tour_url,
        map_image: form.map_image,
      };

      if (isEdit) {
        const { error: err } = await supabase.from("rooms").update(payload).eq("id", room.id);
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await supabase.from("rooms").insert(payload);
        if (err) throw new Error(err.message);
      }

      router.push("/admin/rooms");
      router.refresh();

    } catch (err: any) {
      console.error("Save room error:", err);
      setError(err.message ?? "Gagal menyimpan ruangan");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Info Dasar */}
      <Card>
        <CardContent className="p-5 md:p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Informasi Ruangan</h3>
          <div>
            <Label>Nama Ruangan</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Aula Utama" className="mt-1" required />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Deskripsi ruangan..." className="mt-1" rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Harga/Jam (Rp)</Label>
              <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="500000" className="mt-1" required />
            </div>
            <div>
              <Label>Kapasitas</Label>
              <Input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="100" className="mt-1" required />
            </div>
            <div>
              <Label>Luas (m²)</Label>
              <Input type="number" step="0.01" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="120" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fasilitas Bawaan */}
      <Card>
        <CardContent className="p-5 md:p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Fasilitas Ruangan</h3>
          <p className="text-xs text-gray-400">Fasilitas yang sudah tersedia di ruangan</p>
          <div className="flex gap-2">
            <Input
              value={facilityInput}
              onChange={(e) => setFacilityInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFacility(); } }}
              placeholder="Contoh: AC, Whiteboard, Meja..."
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addFacility} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {roomFacilities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {roomFacilities.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-sm">
                  {f}
                  <button type="button" onClick={() => removeFacility(f)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardContent className="p-5 md:p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Media</h3>

          {/* Foto Utama */}
          <div>
            <Label>Foto Utama</Label>
            <div className="mt-2 flex items-start gap-3">
              {form.image_url && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors text-center">
                    {uploadingImage === "main" ? (
                      <Loader2 className="w-6 h-6 text-red-600 mx-auto animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Klik untuk upload (max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "main")}
                    className="hidden"
                    disabled={!!uploadingImage}
                  />
                </label>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => set("image_url", "")}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Hapus foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Virtual Tour URL */}
          <div>
            <Label>URL Virtual Tour (iframe embed)</Label>
            <Input value={form.virtual_tour_url} onChange={(e) => set("virtual_tour_url", e.target.value)} placeholder="https://..." className="mt-1" />
            <p className="text-xs text-gray-400 mt-1">Paste URL embed dari virtual tour (contoh: Google Street View, Matterport, dll)</p>
          </div>

          {/* Denah */}
          <div>
            <Label>Denah Ruangan</Label>
            <div className="mt-2 flex items-start gap-3">
              {form.map_image && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <img src={form.map_image} alt="Denah" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors text-center">
                    {uploadingImage === "map" ? (
                      <Loader2 className="w-6 h-6 text-red-600 mx-auto animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Upload denah (max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "map")}
                    className="hidden"
                    disabled={!!uploadingImage}
                  />
                </label>
                {form.map_image && (
                  <button
                    type="button"
                    onClick={() => set("map_image", "")}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Hapus denah
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || !!uploadingImage} className="flex-1">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : isEdit ? "Simpan Perubahan" : "Tambah Ruangan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
      </div>
    </form>
  );
}
