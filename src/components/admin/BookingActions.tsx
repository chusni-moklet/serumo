"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookingActions({ booking }: { booking: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const updateStatus = async (status: "verified" | "rejected") => {
    setLoading(status);
    await supabase.from("bookings").update({ status }).eq("id", booking.id);
    if (booking.payment) {
      await supabase.from("payments").update({ status }).eq("booking_id", booking.id);
    }
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {/* View Payment Proof */}
      {booking.payment?.proof_url && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-blue-500 hover:text-blue-600">
              <Eye className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Bukti Pembayaran</DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              {booking.payment.proof_url.endsWith(".pdf") ? (
                <iframe src={booking.payment.proof_url} className="w-full h-96 rounded-lg" />
              ) : (
                <img src={booking.payment.proof_url} alt="Bukti Bayar" className="w-full rounded-lg max-h-96 object-contain" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Approve */}
      {booking.status === "pending" && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => updateStatus("verified")}
            disabled={!!loading}
          >
            {loading === "verified" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => updateStatus("rejected")}
            disabled={!!loading}
          >
            {loading === "rejected" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          </Button>
        </>
      )}
    </div>
  );
}
