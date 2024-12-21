import { createClient } from "@/utils/supabase/server"
import { CustomerForm } from "@/components/forms/customer-form"
import { notFound } from "next/navigation"

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient()
  
  const { data: customer, error } = await supabase
    .from("customers")
    .select(`
      *,
      addresses(*)
    `)
    .eq('id', id)
    .order('created_at', { foreignTable: 'addresses', ascending: false })
    .single()

  if (error || !customer) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Customer</h1>
      <CustomerForm initialData={customer} />
    </div>
  )
} 