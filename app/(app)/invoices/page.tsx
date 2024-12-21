import { createClient } from "@/utils/supabase/server";
import { InvoicesTable } from "@/components/tables/invoices-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`
      *,
      agreement:agreements(
        quote:quotes(
          lead:leads(
            customer:customers(
              first_name,
              last_name,
              email
            )
          )
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    // TODO: Handle error state
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>
      
      <InvoicesTable data={invoices || []} />
    </div>
  );
} 