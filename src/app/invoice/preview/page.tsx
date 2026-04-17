export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InvoicePrintClient from "../[bookingId]/InvoicePrintClient";

// Dummy data untuk preview
const PREVIEW_INVOICE = {
  invoiceNo: "INV-PREVIEW1",
  bookingId: "00000000-0000-0000-0000-000000000001",
  issuedAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
  status: "pending" as const,
  booker: {
    name: "Contoh Penyewa",
    email: "penyewa@example.com",
  },
  room: {
    name: "Aula Utama",
    capacity: 300,
    area: 450,
  },
  date: new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  rawDate: new Date().toISOString().split("T")[0],
  startTime: "08:00",
  endTime: "12:00",
  duration: 4,
  pricePerHour: 500000,
  roomSubtotal: 2000000,
  facilities: [
    { name: "Proyektor", price: 50000, quantity: 1, subtotal: 50000 },
    { name: "Sound System", price: 100000, quantity: 1, subtotal: 100000 },
  ],
  facilityTotal: 150000,
  totalPrice: 2150000,
  notes: "Ini adalah catatan contoh untuk keperluan preview invoice.",
  paymentStatus: "pending",
};

export default async function InvoicePreviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "superadmin") {
    redirect("/dashboard");
  }

  return (
    <div>
      {/* Preview banner */}
      <div className="print:hidden bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
        <span className="text-amber-700 text-sm font-medium">
          🎨 Mode Preview — Data ini adalah contoh. Perubahan pengaturan akan langsung terlihat di sini.
        </span>
      </div>
      <InvoicePrintClient invoice={PREVIEW_INVOICE} />
    </div>
  );
}
