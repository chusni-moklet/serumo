"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddAdminButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Gagal membuat admin");
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message ?? "Admin berhasil ditambahkan!");
      setSuccess(true);

    } catch (err: any) {
      setError("Terjadi kesalahan: " + err.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
      setSuccessMsg("");
      setEmail(""); setName(""); setPassword("");
      router.refresh();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(""); setSuccess(false); } }}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4" /> Tambah Admin</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Admin Baru</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">{successMsg}</p>
            <p className="text-sm text-gray-500 mt-1">Admin dapat langsung login ke sistem</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <Label>Nama Lengkap</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama admin" className="mt-1" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" className="mt-1" required />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="mt-1"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
              💡 Jika email sudah terdaftar, role-nya akan langsung diubah ke Admin.
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : "Tambah Admin"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
