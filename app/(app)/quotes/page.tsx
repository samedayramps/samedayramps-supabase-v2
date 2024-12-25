import { createClient } from "@/utils/supabase/server";
import { QuotesTable } from "@/components/tables/quotes-table";

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select(`
      *,
      lead:leads(
        customer:customers(
          id,
          first_name,
          last_name,
          email,
          phone
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
      <h1 className="text-2xl font-bold">Quotes</h1>
      <QuotesTable data={quotes || []} />
    </div>
  );
} 