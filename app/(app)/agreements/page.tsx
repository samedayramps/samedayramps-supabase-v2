import { createClient } from "@/utils/supabase/server";
import { AgreementsTable } from "@/components/tables/agreements-table";

export default async function AgreementsPage() {
  const supabase = await createClient();
  const { data: agreements, error } = await supabase
    .from("agreements")
    .select(`
      *,
      quote:quotes(
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
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agreements:', error);
    // TODO: Handle error state
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Agreements</h1>
      <AgreementsTable data={agreements || []} />
    </div>
  );
} 