"use client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function ExportButton({ bookings }: { bookings: any[] }) {
  const handleExport = () => {
    const data = bookings.map((b) => ({
      ID: b.id.slice(0, 8).toUpperCase(),
      Penyewa: b.user?.name ?? "-",
      Email: b.user?.email ?? "-",
      Ruangan: b.room?.name ?? "-",
      Tanggal: b.date,
      "Jam Mulai": b.start_time,
      "Jam Selesai": b.end_time,
      "Total (Rp)": b.total_price,
      Status: b.status,
      "Dibuat": new Date(b.created_at).toLocaleString("id-ID"),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `serumo-bookings-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="w-4 h-4" /> Export Excel
    </Button>
  );
}
