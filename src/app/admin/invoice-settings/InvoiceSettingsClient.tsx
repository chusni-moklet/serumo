"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save, RotateCcw, Eye, CheckCircle, Building2, Palette, FileText, CreditCard } from "lucide-react";

export interface InvoiceSettings {
  // Identitas
  orgName: string;
  orgSubtitle: string;
  orgAddress: string;
  orgPhone: string;
  orgEmail: string;
  orgWebsite: string;
  // Warna
  primaryColor: string;
  secondaryColor: string;
  // Teks invoice
  invoiceTitle: string;
  invoiceFooterNote: string;
  // Info pembayaran
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  paymentNote: string;
  // Layout
  showLogo: boolean;
  showWatermark: boolean;
  showPaymentInfo: boolean;
}

const DEFAULT_SETTINGS: InvoiceSettings = {
  orgName: "Serumo",
  orgSubtitle: "SMK Telkom Malang",
  orgAddress: "Jl. Danau Ranau, Sawojajar, Kec. Kedungkandang, Kota Malang, Jawa Timur 65138",
  orgPhone: "0812-2348-8999",
  orgEmail: "info@smktelkom-mlg.sch.id",
  orgWebsite: "www.smktelkom-mlg.sch.id",
  primaryColor: "#E40521",
  secondaryColor: "#003087",
  invoiceTitle: "INVOICE",
  invoiceFooterNote: "Dokumen ini diterbitkan secara otomatis oleh sistem Serumo. Untuk pertanyaan, hubungi email kami.",
  bankName: "Bank BRI / BNI / Mandiri",
  bankAccount: "Hubungi Admin",
  bankAccountName: "SMK Telkom Malang",
  paymentNote: "Harap transfer sesuai nominal dan sertakan nomor invoice sebagai keterangan.",
  showLogo: true,
  showWatermark: false,
  showPaymentInfo: true,
};

const STORAGE_KEY = "serumo_invoice_settings";

export function loadInvoiceSettings(): InvoiceSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
}

const tabs = [
  { id: "identity", label: "Identitas", icon: Building2 },
  { id: "color",    label: "Warna & Judul", icon: Palette },
  { id: "payment",  label: "Pembayaran", icon: CreditCard },
  { id: "footer",   label: "Footer", icon: FileText },
];

export default function InvoiceSettingsClient() {
  const [settings, setSettings] = useState<InvoiceSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState("identity");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadInvoiceSettings());
  }, []);

  const set = (key: keyof InvoiceSettings, value: string | boolean) => {
    setSettings((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (!confirm("Reset semua pengaturan ke default?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pengaturan Invoice</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kustomisasi tampilan dan isi invoice yang dikirim ke penyewa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <a href="/invoice/preview" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" /> Preview
            </Button>
          </a>
          <Button size="sm" onClick={handleSave}>
            {saved ? <><CheckCircle className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> Simpan</>}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab list */}
        <div className="md:w-44 shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={activeTab === tab.id ? { background: "linear-gradient(135deg, #E40521, #003087)" } : {}}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">

          {/* IDENTITY */}
          {activeTab === "identity" && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Informasi Organisasi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Organisasi</Label>
                    <Input value={settings.orgName} onChange={(e) => set("orgName", e.target.value)} className="mt-1" placeholder="Serumo" />
                  </div>
                  <div>
                    <Label>Subjudul / Tagline</Label>
                    <Input value={settings.orgSubtitle} onChange={(e) => set("orgSubtitle", e.target.value)} className="mt-1" placeholder="SMK Telkom Malang" />
                  </div>
                </div>
                <div>
                  <Label>Alamat</Label>
                  <Textarea value={settings.orgAddress} onChange={(e) => set("orgAddress", e.target.value)} className="mt-1" rows={2} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nomor Telepon</Label>
                    <Input value={settings.orgPhone} onChange={(e) => set("orgPhone", e.target.value)} className="mt-1" placeholder="0812-xxxx-xxxx" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={settings.orgEmail} onChange={(e) => set("orgEmail", e.target.value)} className="mt-1" placeholder="info@..." />
                  </div>
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={settings.orgWebsite} onChange={(e) => set("orgWebsite", e.target.value)} className="mt-1" placeholder="www.example.com" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* COLOR & TITLE */}
          {activeTab === "color" && (
            <Card>
              <CardContent className="p-5 space-y-5">
                <h3 className="font-semibold text-gray-900">Warna & Judul Invoice</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Warna Utama (Header kiri)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => set("primaryColor", e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => set("primaryColor", e.target.value)}
                        className="font-mono text-sm"
                        placeholder="#E40521"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Warna Sekunder (Header kanan)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => set("secondaryColor", e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => set("secondaryColor", e.target.value)}
                        className="font-mono text-sm"
                        placeholder="#003087"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview gradient */}
                <div
                  className="rounded-xl h-16 flex items-center px-5 text-white font-bold text-lg"
                  style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})` }}
                >
                  {settings.invoiceTitle} — {settings.orgName}
                </div>

                <div>
                  <Label>Judul Invoice</Label>
                  <Input value={settings.invoiceTitle} onChange={(e) => set("invoiceTitle", e.target.value)} className="mt-1" placeholder="INVOICE" />
                  <p className="text-xs text-gray-400 mt-1">Biasanya "INVOICE" atau "KWITANSI"</p>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-medium text-gray-700">Opsi Tampilan</h4>
                  {[
                    { key: "showLogo" as const,       label: "Tampilkan inisial logo di header" },
                    { key: "showPaymentInfo" as const, label: "Tampilkan info rekening pembayaran" },
                    { key: "showWatermark" as const,   label: "Tampilkan watermark status (LUNAS/PENDING)" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => set(key, !settings[key])}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${settings[key] ? "bg-red-600" : "bg-gray-200"}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* PAYMENT */}
          {activeTab === "payment" && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">Informasi Rekening Pembayaran</h3>
                <p className="text-xs text-gray-400">Informasi ini ditampilkan di invoice saat status masih "Menunggu Pembayaran"</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Bank</Label>
                    <Input value={settings.bankName} onChange={(e) => set("bankName", e.target.value)} className="mt-1" placeholder="Bank BRI" />
                  </div>
                  <div>
                    <Label>Nomor Rekening</Label>
                    <Input value={settings.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} className="mt-1" placeholder="1234-5678-9012" />
                  </div>
                </div>
                <div>
                  <Label>Atas Nama</Label>
                  <Input value={settings.bankAccountName} onChange={(e) => set("bankAccountName", e.target.value)} className="mt-1" placeholder="SMK Telkom Malang" />
                </div>
                <div>
                  <Label>Catatan Pembayaran</Label>
                  <Textarea value={settings.paymentNote} onChange={(e) => set("paymentNote", e.target.value)} className="mt-1" rows={3} placeholder="Instruksi tambahan untuk penyewa..." />
                </div>

                {/* Preview */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">Preview</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400">Bank:</span> <span className="font-medium">{settings.bankName}</span></div>
                    <div><span className="text-gray-400">No. Rek:</span> <span className="font-medium">{settings.bankAccount}</span></div>
                    <div className="col-span-2"><span className="text-gray-400">A.N.:</span> <span className="font-medium">{settings.bankAccountName}</span></div>
                  </div>
                  {settings.paymentNote && <p className="text-xs text-gray-500 mt-2 italic">{settings.paymentNote}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* FOOTER */}
          {activeTab === "footer" && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">Teks Footer Invoice</h3>
                <div>
                  <Label>Catatan Footer</Label>
                  <Textarea
                    value={settings.invoiceFooterNote}
                    onChange={(e) => set("invoiceFooterNote", e.target.value)}
                    className="mt-1"
                    rows={4}
                    placeholder="Teks yang muncul di bagian bawah invoice..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Contoh: syarat & ketentuan, ucapan terima kasih, dll.</p>
                </div>

                {/* Preview */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">Preview Footer</div>
                  <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                    <div className="font-semibold text-gray-600 mb-1">{settings.orgName} — {settings.orgSubtitle}</div>
                    <div>{settings.invoiceFooterNote}</div>
                    <div className="mt-1">{settings.orgEmail} · {settings.orgPhone}</div>
                    {settings.orgWebsite && <div>{settings.orgWebsite}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save reminder */}
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleSave} className="gap-2">
              {saved
                ? <><CheckCircle className="w-4 h-4" /> Pengaturan Tersimpan!</>
                : <><Save className="w-4 h-4" /> Simpan Pengaturan</>
              }
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
