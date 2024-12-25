import { createClient } from "@/utils/supabase/server";
import { SubscriptionsTable } from "@/components/tables/subscriptions-table";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      agreement:agreements(
        quote:quotes(
          monthly_rental_rate,
          rental_type,
          lead:leads(
            customer:customers(
              id,
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
    console.error('Error fetching subscriptions:', error);
    // TODO: Handle error state
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <SubscriptionsTable data={subscriptions || []} />
    </div>
  );
} 