import { createClient } from "@/utils/supabase/server";
import { QuotesTable } from "@/components/tables/quotes-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select(`
      *,
      lead:leads(
        customer:customers(
          first_name,
          last_name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes:', error);
    // TODO: Handle error state
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Link href="/quotes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>
      
      <QuotesTable data={quotes || []} />
    </div>
  );
} 