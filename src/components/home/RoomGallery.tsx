import { createClient } from "@/lib/supabase/server";
import { Camera } from "lucide-react";

export default async function RoomGallery() {
  const supabase = await createClient();

  // Fetch rooms with images
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, image_url, gallery")
    .limit(10);

  if (!rooms || rooms.length === 0) return null;

  // Extract all valid images
  const allImages: { url: string; title: string }[] = [];
  
  rooms.forEach((room) => {
    if (room.image_url) {
      allImages.push({ url: room.image_url, title: room.name });
    }
    if (room.gallery && Array.isArray(room.gallery)) {
      room.gallery.forEach((url) => {
        if (url) {
          allImages.push({ url: url, title: `${room.name} - Galeri` });
        }
      });
    }
  });

  // Limit to maybe 8 images for the gallery display
  const displayImages = allImages.slice(0, 8);

  if (displayImages.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {displayImages.map((img, index) => (
        <div 
          key={index} 
          className={`relative group rounded-2xl overflow-hidden bg-gray-100 ${
            index === 0 ? "md:col-span-2 md:row-span-2" : ""
          } ${index === 3 && displayImages.length > 4 ? "md:col-span-2" : ""}`}
          style={{ minHeight: index === 0 ? "300px" : "150px" }}
        >
          <img 
            src={img.url} 
            alt={img.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-4 w-full">
              <div className="flex items-center gap-2 text-white">
                <Camera className="w-4 h-4" />
                <p className="text-sm font-medium truncate">{img.title}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
