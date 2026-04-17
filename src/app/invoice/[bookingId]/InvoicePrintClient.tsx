"use client";
import { useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { Printer, Download, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FacilityLine {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface InvoiceData {
  invoiceNo: string;
  bookingId: string;
  issuedAt: string;
  status: "pending" | "verified" | "rejected";
  booker: { name: string; email: string };
  room: { name: string; capacity: number; area: number };
  date: string;
  rawDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  pricePerHour: number;
  roomSubtotal: number;
  facilities: FacilityLine[];
  facilityTotal: number;
  totalPrice: number;
  notes?: string;
  paymentStatus: string | null;
}

const statusConfig = {
  pending:  { label: "Menunggu Verifikasi", color: "#b45309", bg: "#fef3c7", icon: "⏳" },
  verified: { label: "Terverifikasi",        color: "#065f46", bg: "#d1fae5", icon: "✅" },
  rejected: { label: "Ditolak",              color: "#991b1b", bg: "#fee2e2", icon: "❌" },
};

export default function InvoicePrintClient({ invoice }: { invoice: InvoiceData }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const st = statusConfig[invoice.status];

  return (
    <>
      {/* Action bar — hidden on print */}
      <div className="print:hidden bg-gray-100 border-b border-gray-200 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice — this gets printed */}
      <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:p-0 print:min-h-0">
        <div
          ref={printRef}
          className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none"
          style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
        >
          {/* Header */}
          <div
            className="p-8 print:p-10"
            style={{ background: "linear-gradient(135deg, #E40521 0%, #B8001A 40%, #003087 100%)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <div className="text-white font-bold text-xl">Serumo</div>
                    <div className="text-white/60 text-xs">SMK Telkom Malang</div>
                  </div>
                </div>
                <div className="text-white/70 text-xs mt-2 space-y-0.5">
                  <div>Jl. Danau Ranau, Sawojajar, Kec. Kedungkandang</div>
                  <div>Kota Malang, Jawa Timur 65138</div>
                  <div>info@smktelkom-mlg.sch.id · 0812-2348-8999</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Invoice</div>
                <div className="text-white font-bold text-2xl">{invoice.invoiceNo}</div>
                <div className="text-white/60 text-xs mt-1">Diterbitkan: {invoice.issuedAt}</div>
                <div
                  className="mt-3 px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  <span>{st.icon}</span>
                  <span>{st.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 print:p-10 space-y-8">
            {/* Billing info */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">Ditagihkan Kepada</div>
                <div className="font-semibold text-gray-900 text-base">{invoice.booker.name}</div>
                <div className="text-gray-500 text-sm">{invoice.booker.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">Detail Booking</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID Booking</span>
                    <span className="font-mono text-gray-700 text-xs">{invoice.bookingId.slice(0, 12).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tanggal</span>
                    <span className="text-gray-700">{invoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Waktu</span>
                    <span className="text-gray-700">{invoice.startTime} – {invoice.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Durasi</span>
                    <span className="text-gray-700">{invoice.duration} jam</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Room info box */}
            <div
              className="rounded-xl p-5 border-l-4"
              style={{ background: "#fff7f7", borderLeftColor: "#E40521" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Ruangan yang Disewa</div>
                  <div className="font-bold text-gray-900 text-lg">{invoice.room.name}</div>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>👥 Kapasitas {invoice.room.capacity} orang</span>
                    {invoice.room.area > 0 && <span>📐 {invoice.room.area} m²</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Harga per jam</div>
                  <div className="font-bold text-red-600 text-lg">{formatCurrency(invoice.pricePerHour)}</div>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#0f172a", color: "white" }}>
                    <th className="text-left px-4 py-3 rounded-tl-lg font-medium">Deskripsi</th>
                    <th className="text-right px-4 py-3 font-medium">Harga</th>
                    <th className="text-right px-4 py-3 font-medium">Qty</th>
                    <th className="text-right px-4 py-3 rounded-tr-lg font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Room line */}
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-900">{invoice.room.name}</div>
                      <div className="text-xs text-gray-400">Sewa ruangan {invoice.duration} jam ({invoice.startTime}–{invoice.endTime})</div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-600">{formatCurrency(invoice.pricePerHour)}/jam</td>
                    <td className="px-4 py-3.5 text-right text-gray-600">{invoice.duration}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-900">{formatCurrency(invoice.roomSubtotal)}</td>
                  </tr>

                  {/* Facility lines */}
                  {invoice.facilities.map((f, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-900">{f.name}</div>
                        <div className="text-xs text-gray-400">Fasilitas tambahan</div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-600">{formatCurrency(f.price)}/unit</td>
                      <td className="px-4 py-3.5 text-right text-gray-600">{f.quantity}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-gray-900">{formatCurrency(f.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>

                {/* Totals */}
                <tfoot>
                  {invoice.facilityTotal > 0 && (
                    <tr className="border-b border-gray-100">
                      <td colSpan={3} className="px-4 py-3 text-right text-gray-500 text-xs">Subtotal Ruangan</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(invoice.roomSubtotal)}</td>
                    </tr>
                  )}
                  {invoice.facilityTotal > 0 && (
                    <tr className="border-b border-gray-100">
                      <td colSpan={3} className="px-4 py-3 text-right text-gray-500 text-xs">Subtotal Fasilitas</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(invoice.facilityTotal)}</td>
                    </tr>
                  )}
                  <tr style={{ background: "linear-gradient(135deg, #E40521, #003087)" }}>
                    <td colSpan={3} className="px-4 py-4 text-right font-bold text-white text-base rounded-bl-lg">
                      TOTAL PEMBAYARAN
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-white text-xl rounded-br-lg">
                      {formatCurrency(invoice.totalPrice)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-semibold">Catatan</div>
                <div className="text-gray-600 text-sm">{invoice.notes}</div>
              </div>
            )}

            {/* Payment status */}
            <div
              className="rounded-xl p-5 flex items-center gap-4"
              style={{ background: st.bg }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: st.color + "22" }}
              >
                {st.icon}
              </div>
              <div>
                <div className="font-semibold" style={{ color: st.color }}>{st.label}</div>
                <div className="text-sm mt-0.5" style={{ color: st.color + "aa" }}>
                  {invoice.status === "pending" && "Silakan transfer ke rekening berikut dan upload bukti pembayaran."}
                  {invoice.status === "verified" && "Pembayaran telah dikonfirmasi. Booking Anda aktif."}
                  {invoice.status === "rejected" && "Pembayaran ditolak. Hubungi admin untuk informasi lebih lanjut."}
                </div>
              </div>
            </div>

            {/* Payment info — shown if pending */}
            {invoice.status === "pending" && (
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">Informasi Pembayaran</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-0.5">Bank</div>
                    <div className="font-semibold text-gray-900">Bank BRI / BNI / Mandiri</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-0.5">No. Rekening</div>
                    <div className="font-semibold text-gray-900">Hubungi Admin</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-0.5">Atas Nama</div>
                    <div className="font-semibold text-gray-900">SMK Telkom Malang</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-0.5">Jumlah Transfer</div>
                    <div className="font-bold text-red-600 text-base">{formatCurrency(invoice.totalPrice)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-100 pt-6 flex items-end justify-between text-xs text-gray-400">
              <div>
                <div className="font-semibold text-gray-600 mb-1">Serumo — SMK Telkom Malang</div>
                <div>Dokumen ini diterbitkan secara otomatis oleh sistem Serumo.</div>
                <div>Untuk pertanyaan, hubungi: info@smktelkom-mlg.sch.id</div>
              </div>
              <div className="text-right">
                <div>{invoice.invoiceNo}</div>
                <div className="mt-1">Dicetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          nav, footer { display: none !important; }
          body > div > main { padding-bottom: 0 !important; }
        }
      `}</style>
    </>
  );
}
