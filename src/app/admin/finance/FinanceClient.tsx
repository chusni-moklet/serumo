"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, TrendingUp, TrendingDown, Plus, Loader2, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
};

type BookingIncome = {
  id: string;
  total_price: number;
  date: string;
  created_at: string;
};

type Transaction = {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  created_at: string;
  proof_url?: string | null;
  booking_id?: string;
};

export default function FinanceClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingExpense, setAddingExpense] = useState(false);
  const supabase = createClient();

  // Form states
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expFile, setExpFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFinanceData = async () => {
    setLoading(true);
    
    // Fetch income (verified bookings)
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("id, total_price, date, created_at, rooms(name), payments(proof_url)")
      .eq("status", "verified");

    // Fetch expenses
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*");

    const allTransactions: Transaction[] = [];

    if (bookingsData) {
      bookingsData.forEach((b: any) => {
        allTransactions.push({
          id: b.id,
          type: "income",
          description: `Sewa Ruangan: ${b.rooms?.name || "Ruangan"}`,
          amount: b.total_price,
          date: b.date,
          created_at: b.created_at,
          proof_url: b.payments?.[0]?.proof_url || null,
          booking_id: b.id
        });
      });
    }

    if (expensesData) {
      expensesData.forEach((e: any) => {
        allTransactions.push({
          id: e.id,
          type: "expense",
          description: e.description,
          amount: e.amount,
          date: e.date,
          created_at: e.created_at,
          proof_url: e.proof_url
        });
      });
    }

    // Sort by date descending
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(allTransactions);
    setLoading(false);
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || !expAmount || !expDate) return;
    
    setIsSubmitting(true);
    let uploadedUrl = null;

    if (expFile) {
      const fileExt = expFile.name.split('.').pop();
      const fileName = `expense-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, expFile);

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(uploadData.path);
        uploadedUrl = publicUrl;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("expenses").insert({
      description: expDesc,
      amount: parseInt(expAmount.replace(/\D/g, "")),
      date: expDate,
      created_by: user?.id,
      proof_url: uploadedUrl
    });

    setIsSubmitting(false);

    if (error) {
      alert("Gagal menyimpan pengeluaran: " + error.message);
    } else {
      alert("Pengeluaran berhasil dicatat");
      setAddingExpense(false);
      setExpDesc("");
      setExpAmount("");
      setExpFile(null);
      fetchFinanceData();
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Keuangan Total</h1>
          <p className="text-gray-500 text-xs mt-0.5">Pantau arus kas, pemasukan, dan pengeluaran.</p>
        </div>
        <Button onClick={() => setAddingExpense(!addingExpense)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Catat Pengeluaran
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-100 shadow-sm bg-green-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">Total Pemasukan</p>
                <h3 className="text-2xl font-bold text-green-900">{formatCurrency(totalIncome)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm bg-red-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">Total Pengeluaran</p>
                <h3 className="text-2xl font-bold text-red-900">{formatCurrency(totalExpense)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-md shrink-0">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Saldo Bersih</p>
                <h3 className="text-2xl font-bold text-blue-900">{formatCurrency(balance)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Form */}
      {addingExpense && (
        <Card className="border-blue-200 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Catat Pengeluaran Baru</h3>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-700 mb-1 block">Deskripsi / Keperluan</label>
                <Textarea required rows={2} value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Contoh: Perbaikan AC Aula Utama" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Nominal (Rp)</label>
                <Input required type="number" min="0" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="500000" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Tanggal</label>
                <Input required type="date" value={expDate} onChange={e => setExpDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Bukti (Opsional)</label>
                <Input type="file" accept="image/*,.pdf" onChange={e => setExpFile(e.target.files?.[0] || null)} className="text-xs" />
              </div>
              <div className="md:col-span-5 flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" onClick={() => setAddingExpense(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Pengeluaran"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ledger Table */}
      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Pemasukan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Pengeluaran</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Bukti / Referensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Memuat data...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(t.date), "dd MMM yyyy", { locale: id })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{t.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                      {t.type === "income" ? `+ ${formatCurrency(t.amount)}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-red-600">
                      {t.type === "expense" ? `- ${formatCurrency(t.amount)}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {t.proof_url ? (
                          <a href={t.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            Lihat Bukti
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                        {t.type === "income" && t.booking_id && (
                          <a href={`/invoice/${t.booking_id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-900 hover:underline">
                            Invoice
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
