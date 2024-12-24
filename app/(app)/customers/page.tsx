import { createClient } from "@/utils/supabase/server"
import { CustomersTable } from "@/components/tables/customers-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link href="/customers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </Link>
      </div>
      
      <CustomersTable data={customers || []} />
    </div>
  )
} 