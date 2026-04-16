export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FacilityManager from "@/components/admin/FacilityManager";
import type { Facility } from "@/types";

export default async function AdminFacilitiesPage() {
  const supabase = await createClient();
  const { data: facilities } = await supabase.from("facilities").select("*").order("name");

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Fasilitas</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola fasilitas tambahan yang tersedia</p>
      </div>
      <FacilityManager facilities={facilities ?? []} />
    </div>
  );
}
