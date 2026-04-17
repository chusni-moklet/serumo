"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Building2, LayoutDashboard, CalendarDays, DoorOpen, Wrench, LogOut, ShieldCheck, Loader2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin",                  label: "Dashboard",    icon: LayoutDashboard, roles: ["admin", "superadmin"] },
  { href: "/admin/bookings",         label: "Booking",      icon: CalendarDays,    roles: ["admin", "superadmin"] },
  { href: "/admin/rooms",            label: "Ruangan",      icon: DoorOpen,        roles: ["admin", "superadmin"] },
  { href: "/admin/facilities",       label: "Fasilitas",    icon: Wrench,          roles: ["admin", "superadmin"] },
  { href: "/admin/invoice-settings", label: "Invoice",      icon: FileText,        roles: ["admin", "superadmin"] },
  { href: "/admin/admins",           label: "Kelola Admin", icon: ShieldCheck,     roles: ["superadmin"] },
];

export default function AdminSidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await supabase.auth.signOut(); } catch {}
    window.location.href = "/";
  };

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-56 flex flex-col min-h-screen sticky top-0 shrink-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #001F5C 100%)" }}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #E40521, #003087)" }}>
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-sm leading-none">Serumo</div>
            <div className={cn("text-xs mt-0.5", role === "superadmin" ? "text-yellow-400 font-medium" : "text-white/40")}>
              {role === "superadmin" ? "Super Admin" : "Admin"}
            </div>
          </div>
        </Link>
        {name && <p className="text-xs text-white/30 mt-2 truncate">{name}</p>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {visibleItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", active ? "text-red-400" : "")} />
              <span className="truncate">{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-all w-full disabled:opacity-50"
        >
          {loggingOut ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> : <LogOut className="w-4 h-4 shrink-0" />}
          <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
        </button>
      </div>
    </aside>
  );
}
