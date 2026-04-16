"use client";
import { useState } from "react";
import { Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/types";

interface Props {
  bookingId: string;
  existingPayment?: Payment | null;
}

export default function PaymentUpload({ bookingId, existingPayment }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState("");

  if (existingPayment?.proof_url && !success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="font-medium text-green-700">Bukti pembayaran sudah diupload</p>
        <p className="text-sm text-green-600 mt-1">Menunggu verifikasi admin</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="font-medium text-green-700">Bukti pembayaran berhasil diupload!</p>
        <p className="text-sm text-green-600 mt-1">Menunggu verifikasi admin</p>
      </div>
    );
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setError("Ukuran file maksimal 2MB."); return; }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(f.type)) {
      setError("Format file harus JPG, PNG, atau PDF.");
      return;
    }
    setError("");
    setFile(f);
    if (f.type !== "application/pdf") setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setStep("Mengupload file...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookingId", bookingId);

      const res = await fetch("/api/upload-payment", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Upload gagal");
        setLoading(false);
        setStep("");
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError("Terjadi kesalahan: " + err.message);
    }

    setLoading(false);
    setStep("");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-red-600" /> Upload Bukti Pembayaran
      </h2>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Upload gagal</p>
            <p className="mt-0.5 text-xs break-all">{error}</p>
          </div>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-red-300 transition-colors">
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-36 mx-auto rounded-lg mb-3 object-contain" />
        ) : (
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        )}
        <p className="text-sm text-gray-500 mb-2 truncate px-4">
          {file ? file.name : "JPG, PNG, atau PDF — Maks. 2MB"}
        </p>
        <label className="cursor-pointer inline-block">
          <span className="text-sm text-red-600 font-medium hover:underline">
            {file ? "Ganti File" : "Pilih File"}
          </span>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {file && (
        <Button onClick={handleUpload} className="w-full mt-4" disabled={loading}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> {step || "Mengupload..."}</>
            : <><Upload className="w-4 h-4" /> Upload Bukti Pembayaran</>
          }
        </Button>
      )}
    </div>
  );
}
