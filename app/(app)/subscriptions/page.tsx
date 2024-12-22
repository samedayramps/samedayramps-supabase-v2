import { createClient } from "@/utils/supabase/server";
import { SubscriptionsTable } from "@/components/tables/subscriptions-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load subscriptions. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter out subscriptions with missing data
  const validSubscriptions = subscriptions?.filter(
    (sub) => sub.agreement?.quote?.lead?.customer
  ) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Link href="/subscriptions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Subscription
          </Button>
        </Link>
      </div>
      
      <SubscriptionsTable data={validSubscriptions} />
    </div>
  );
} 