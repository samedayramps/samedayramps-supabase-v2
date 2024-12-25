import { createClient } from "@/utils/supabase/server"
import { CustomersTable } from "@/components/tables/customers-table"

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: customers, error } = await supabase
    .from("customers")
    .select(`
      *,
      addresses(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    // TODO: Handle error state
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>
      <CustomersTable data={customers || []} />
    </div>
  )
} 