"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

type HeroSlide = {
  id: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

export default function SliderManagerClient() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const fetchSlides = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSlides(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `sliders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hero-slider')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-slider')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('hero_slides').insert({
        image_url: publicUrl,
        sort_order: slides.length,
        is_active: true
      });

      alert("Foto slider berhasil ditambahkan.");
      fetchSlides();
    } catch (error: any) {
      alert("Gagal mengupload: " + error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Hapus foto slider ini?")) return;
    
    try {
      // Extract filepath from public URL to delete from storage as well
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('hero-slider') + 1).join('/');
      
      if (filePath) {
        await supabase.storage.from('hero-slider').remove([filePath]);
      }
      
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      
      setSlides(slides.filter(s => s.id !== id));
      alert("Berhasil dihapus");
    } catch (error: any) {
      alert("Gagal menghapus: " + error.message);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Foto Slider</h1>
          <p className="text-gray-500 text-xs mt-0.5">Kelola foto yang akan ditampilkan bergantian di Halaman Utama</p>
        </div>
        <div>
          <Button disabled={uploading} className="relative overflow-hidden cursor-pointer gap-2 bg-red-600 hover:bg-red-700 text-white">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {uploading ? "Mengupload..." : "Tambah Foto"}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={uploading}
              title="Upload Foto"
            />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : slides.length === 0 ? (
        <Card className="border-dashed shadow-none bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
              <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Foto</h3>
            <p className="text-gray-500 text-sm max-w-sm text-center">Silakan tambah foto untuk ditampilkan sebagai slider otomatis di beranda Anda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <Card key={slide.id} className="overflow-hidden group">
              <div className="relative aspect-video bg-gray-100">
                <img src={slide.image_url} alt="Slider" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(slide.id, slide.image_url)} className="gap-2">
                    <Trash2 className="w-4 h-4" /> Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


