import { createClient } from "@/utils/supabase/server";
import { InstallationsTable } from "@/components/tables/installations-table";

export default async function InstallationsPage() {
  const supabase = await createClient();
  const { data: installations, error } = await supabase
    .from("installations")
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
    console.error('Error fetching installations:', error);
    // TODO: Handle error state
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Installations</h1>
      <InstallationsTable data={installations || []} />
    </div>
  );
} 