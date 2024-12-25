import { createClient } from "@/utils/supabase/server";
import { LeadsTable } from "@/components/tables/leads-table";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select(`
      *,
      customers(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    // TODO: Handle error state
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leads</h1>
      <LeadsTable data={leads || []} />
    </div>
  );
} 