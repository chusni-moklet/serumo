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
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Fasilitas</h1>
          <p className="text-gray-500 text-xs mt-0.5">Kelola fasilitas tambahan yang tersedia</p>
        </div>
      </div>
      <FacilityManager facilities={facilities ?? []} />
    </div>
  );
}
