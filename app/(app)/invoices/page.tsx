import { createClient } from "@/utils/supabase/server";
import { InvoicesTable } from "@/components/tables/invoices-table";

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
              id,
              first_name,
              last_name,
              email,
              phone
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
      <h1 className="text-2xl font-bold">Invoices</h1>
      <InvoicesTable data={invoices || []} />
    </div>
  );
} 