export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InvoiceSettingsClient from "./InvoiceSettingsClient";

export default async function InvoiceSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "superadmin") {
    redirect("/admin");
  }

  // Load saved settings (from a simple key-value store in a settings table, or use localStorage fallback)
  // For simplicity we use localStorage on client side
  return <InvoiceSettingsClient />;
}
