import { createClient } from "@/utils/supabase/server";
import { LeadsTable } from "@/components/tables/leads-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select(`
      *,
      customer:customers(
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    // TODO: Handle error state
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Link href="/leads/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        </Link>
      </div>
      
      <LeadsTable data={leads || []} />
    </div>
  );
} 