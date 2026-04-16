"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, Building2, LogOut, User, LayoutDashboard, Home, DoorOpen } from "lucide-react";

interface SimpleUser { id: string; email: string; name: string; role: string; }

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || !url.startsWith("http")) { setLoading(false); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setLoading(false); return; }
      const { data: profile } = await supabase.from("users").select("name, role").eq("id", session.user.id).single();
      setUser({ id: session.user.id, email: session.user.email ?? "", name: profile?.name ?? session.user.email?.split("@")[0] ?? "User", role: profile?.role ?? "user" });
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!session?.user) { setUser(null); setLoading(false); return; }
      const { data: profile } = await supabase.from("users").select("name, role").eq("id", session.user.id).single();
      setUser({ id: session.user.id, email: session.user.email ?? "", name: profile?.name ?? session.user.email?.split("@")[0] ?? "User", role: profile?.role ?? "user" });
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    window.location.href = "/";
  };

  const dashboardHref = (user?.role === "admin" || user?.role === "superadmin") ? "/admin" : "/dashboard";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E40521, #003087)" }}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Seru<span className="text-red-600">mo</span></span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #E40521, #003087)" }}>
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Seru<span className="text-red-600">mo</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-5">
              <Link href="/rooms" className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium">Ruangan</Link>
              {!loading && user ? (
                <>
                  <Link href={dashboardHref} className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1 font-medium">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E40521, #003087)" }}>
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors" title="Keluar">
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : !loading ? (
                <>
                  <Link href="/auth/login"><Button variant="outline" size="sm">Masuk</Button></Link>
                  <Link href="/auth/register"><Button size="sm">Daftar</Button></Link>
                </>
              ) : null}
            </div>

            {/* Mobile right */}
            <div className="flex md:hidden items-center gap-2">
              {!loading && user && (
                <Link href={dashboardHref} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E40521, #003087)" }}>
                  <User className="w-4 h-4 text-white" />
                </Link>
              )}
              <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setOpen(!open)}>
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-700">
                <Home className="w-4 h-4 text-gray-400" /> Beranda
              </Link>
              <Link href="/rooms" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-700">
                <DoorOpen className="w-4 h-4 text-gray-400" /> Ruangan
              </Link>
              {!loading && user ? (
                <>
                  <Link href={dashboardHref} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-700">
                    <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
                  </Link>
                  <div className="px-3 pt-2 pb-1 border-t border-gray-100 mt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E40521, #003087)" }}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 font-medium">
                      <LogOut className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                </>
              ) : !loading ? (
                <div className="flex gap-2 px-3 pt-2 pb-1 border-t border-gray-100 mt-1">
                  <Link href="/auth/login" className="flex-1"><Button variant="outline" size="sm" className="w-full">Masuk</Button></Link>
                  <Link href="/auth/register" className="flex-1"><Button size="sm" className="w-full">Daftar</Button></Link>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1">
          {[
            { href: "/", label: "Beranda", icon: Home },
            { href: "/rooms", label: "Ruangan", icon: DoorOpen },
          ].map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-3 py-2 ${active ? "text-red-600" : "text-gray-400"}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          {!loading && user ? (
            <>
              <Link href={dashboardHref} className={`flex flex-col items-center gap-0.5 px-3 py-2 ${pathname.startsWith("/dashboard") ? "text-red-600" : "text-gray-400"}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] font-medium">Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 px-3 py-2 text-gray-400">
                <LogOut className="w-5 h-5" />
                <span className="text-[10px] font-medium">Keluar</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={`flex flex-col items-center gap-0.5 px-3 py-2 ${pathname === "/auth/login" ? "text-red-600" : "text-gray-400"}`}>
                <User className="w-5 h-5" />
                <span className="text-[10px] font-medium">Masuk</span>
              </Link>
              <Link href="/auth/register" className={`flex flex-col items-center gap-0.5 px-3 py-2 ${pathname === "/auth/register" ? "text-red-600" : "text-gray-400"}`}>
                <User className="w-5 h-5" />
                <span className="text-[10px] font-medium">Daftar</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
