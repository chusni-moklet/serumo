"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, CalendarDays, DoorOpen, Wrench, ShieldCheck, LogOut, Loader2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin",                  label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "superadmin"] },
  { href: "/admin/bookings",         label: "Booking",   icon: CalendarDays,    roles: ["admin", "superadmin"] },
  { href: "/admin/rooms",            label: "Ruangan",   icon: DoorOpen,        roles: ["admin", "superadmin"] },
  { href: "/admin/facilities",       label: "Fasilitas", icon: Wrench,          roles: ["admin", "superadmin"] },
  { href: "/admin/invoice-settings", label: "Invoice",   icon: FileText,        roles: ["admin", "superadmin"] },
  { href: "/admin/admins",           label: "Admin",     icon: ShieldCheck,     roles: ["superadmin"] },
];

export default function AdminBottomNav({ role }: { role: string }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="flex items-center justify-around px-1 py-1">
        {visibleItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-colors min-w-0",
                active ? "text-red-600" : "text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
          <span className="text-[10px] font-medium">{loggingOut ? "..." : "Keluar"}</span>
        </button>
      </div>
    </nav>
  );
}
