import { createClient } from "@/utils/supabase/server";
import { InstallationsTable } from "@/components/tables/installations-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

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
              first_name,
              last_name
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Installations</h1>
        <Link href="/installations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Installation
          </Button>
        </Link>
      </div>
      
      <InstallationsTable data={installations || []} />
    </div>
  );
} 