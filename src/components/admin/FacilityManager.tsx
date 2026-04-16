"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { Facility } from "@/types";

export default function FacilityManager({ facilities: initial }: { facilities: Facility[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [facilities, setFacilities] = useState(initial);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data } = await supabase.from("facilities").insert({ name, price: Number(price) }).select().single();
    if (data) setFacilities((p) => [...p, data]);
    setName("");
    setPrice("");
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("facilities").delete().eq("id", id);
    setFacilities((p) => p.filter((f) => f.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Add Form */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Tambah Fasilitas</h3>
          <form onSubmit={handleAdd} className="flex gap-3">
            <div className="flex-1">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama fasilitas (e.g. Proyektor)" required />
            </div>
            <div className="w-40">
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Harga (Rp)" required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {facilities.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Belum ada fasilitas</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {facilities.map((f) => (
                <li key={f.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <span className="font-medium text-gray-900">{f.name}</span>
                    <span className="ml-3 text-sm text-red-600">{formatCurrency(f.price)}/unit</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(f.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
