import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-red-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-8">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <Link href="/">
          <Button><Building2 className="w-4 h-4" /> Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  );
}
