"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldMinus, Trash2 } from "lucide-react";
import type { UserRole } from "@/types";

export default function AdminUserActions({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const updateRole = async (role: UserRole) => {
    setLoading(role);
    setError("");
    try {
      const res = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Gagal update role");
      else router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm("Hapus akun admin ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setLoading("delete");
    setError("");
    try {
      const res = await fetch("/api/admin/delete-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Gagal hapus admin");
      else router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-500 mr-1">{error}</span>}
      {currentRole === "admin" ? (
        <Button
          size="sm"
          variant="outline"
          className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => updateRole("superadmin")}
          disabled={!!loading}
          title="Jadikan Super Admin"
        >
          {loading === "superadmin" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          Jadikan SA
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="text-xs text-gray-600"
          onClick={() => updateRole("admin")}
          disabled={!!loading}
          title="Turunkan ke Admin"
        >
          {loading === "admin" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldMinus className="w-3.5 h-3.5" />}
          Jadikan Admin
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="text-red-400 hover:text-red-600 hover:bg-red-50"
        onClick={handleDelete}
        disabled={!!loading}
        title="Hapus admin"
      >
        {loading === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
}
