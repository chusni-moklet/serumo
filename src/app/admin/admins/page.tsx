export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import AdminUserActions from "@/components/admin/AdminUserActions";
import AddAdminButton from "@/components/admin/AddAdminButton";
import type { UserProfile } from "@/types";

export default async function AdminsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "superadmin") redirect("/admin");

  const { data: admins } = await supabase
    .from("users")
    .select("*")
    .in("role", ["admin", "superadmin"])
    .order("created_at", { ascending: false });

  const roleConfig = {
    superadmin: { label: "Super Admin", variant: "default" as const },
    admin: { label: "Admin", variant: "secondary" as const },
    user: { label: "User", variant: "outline" as const },
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Admin</h1>
          <p className="text-gray-500 text-sm mt-1">{admins?.length ?? 0} admin terdaftar</p>
        </div>
        <AddAdminButton />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Nama</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Bergabung</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins?.map((admin: UserProfile) => {
                  const rc = roleConfig[admin.role];
                  const isSelf = admin.id === user.id;
                  return (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {admin.name}
                          {isSelf && <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">Anda</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{admin.email}</td>
                      <td className="px-5 py-4">
                        <Badge variant={rc.variant}>{rc.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(admin.created_at)}</td>
                      <td className="px-5 py-4">
                        {!isSelf && (
                          <AdminUserActions userId={admin.id} currentRole={admin.role} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
