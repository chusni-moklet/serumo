import { Building2, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: "linear-gradient(135deg, #0f172a 0%, #001F5C 60%, #1a0a0a 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #E40521, #003087)" }}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-white">Serumo</span>
                <div className="text-xs text-white/40 leading-none">SMK Telkom Malang</div>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Sistem penyewaan ruangan SMK Telkom Malang. Booking mudah, cepat, dan transparan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-white/50 hover:text-red-400 transition-colors">Beranda</Link></li>
              <li><Link href="/rooms" className="text-white/50 hover:text-red-400 transition-colors">Katalog Ruangan</Link></li>
              <li><Link href="/dashboard" className="text-white/50 hover:text-red-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Kontak</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2 text-white/50">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Jl. Danau Ranau, Sawojajar, Kec. Kedungkandang, Kota Malang, Jawa Timur</span>
              </li>
              <li className="flex items-center gap-2 text-white/50">
                <Phone className="w-4 h-4 text-red-400 shrink-0" />
                <span>0812-2348-8999</span>
              </li>
              <li className="flex items-center gap-2 text-white/50">
                <Mail className="w-4 h-4 text-red-400 shrink-0" />
                <span>info@smktelkom-mlg.sch.id</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Serumo — SMK Telkom Malang. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs text-white/20 ml-1">Telkom Indonesia Group</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
