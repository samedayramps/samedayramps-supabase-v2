import { createClient } from "@/utils/supabase/server";
import { AgreementsTable } from "@/components/tables/agreements-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AgreementsPage() {
  const supabase = await createClient();
  const { data: agreements, error } = await supabase
    .from("agreements")
    .select(`
      *,
      quote:quotes(
        monthly_rental_rate,
        setup_fee,
        rental_type,
        lead:leads(
          customer:customers(
            first_name,
            last_name,
            email
          )
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agreements:', error);
    // TODO: Handle error state
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agreements</h1>
        <Link href="/agreements/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Agreement
          </Button>
        </Link>
      </div>
      
      <AgreementsTable data={agreements || []} />
    </div>
  );
} 