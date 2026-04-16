"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types";

const roleLabel: Record<string, { label: string; variant: any }> = {
  superadmin: { label: "Super Admin", variant: "default" },
  admin:      { label: "Admin",       variant: "secondary" },
  user:       { label: "Pengguna",    variant: "outline" },
};

export default function ProfileClient({
  profile,
  authEmail,
}: {
  profile: UserProfile | null;
  authEmail: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(profile?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingName(true);
    setNameMsg(null);
    const { error } = await supabase.from("users").update({ name }).eq("id", profile?.id ?? "");
    if (error) {
      setNameMsg({ type: "error", text: "Gagal update nama: " + error.message });
    } else {
      setNameMsg({ type: "success", text: "Nama berhasil diperbarui!" });
      router.refresh();
    }
    setLoadingName(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPass(true);
    setPassMsg(null);

    if (newPassword.length < 6) {
      setPassMsg({ type: "error", text: "Password baru minimal 6 karakter." });
      setLoadingPass(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPassMsg({ type: "error", text: "Gagal update password: " + error.message });
    } else {
      setPassMsg({ type: "success", text: "Password berhasil diperbarui!" });
      setCurrentPassword("");
      setNewPassword("");
    }
    setLoadingPass(false);
  };

  const role = profile?.role ?? "user";
  const rc = roleLabel[role] ?? roleLabel.user;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Profil Saya</h1>

      {/* Profile Card */}
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-red-600" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 text-lg truncate">{profile?.name ?? "-"}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500 truncate">{authEmail}</span>
              </div>
            </div>
            <Badge variant={rc.variant} className="shrink-0 ml-auto">{rc.label}</Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Bergabung sejak {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "-"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Update Name */}
      <Card className="mb-5">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Ubah Nama</h3>
          {nameMsg && (
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm mb-3 ${nameMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {nameMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {nameMsg.text}
            </div>
          )}
          <form onSubmit={handleUpdateName} className="flex gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="flex-1" required />
            <Button type="submit" disabled={loadingName}>
              {loadingName ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Update Password */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Ubah Password</h3>
          {passMsg && (
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm mb-3 ${passMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {passMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {passMsg.text}
            </div>
          )}
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <Label>Password Baru</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loadingPass}>
              {loadingPass ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
