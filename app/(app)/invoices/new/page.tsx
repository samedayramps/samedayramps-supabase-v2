import { InvoiceForm } from "@/components/forms/invoice-form"
import { createClient } from "@/utils/supabase/server"

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ agreementId?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient()
  const { data: agreements } = await supabase
    .from("agreements")
    .select(`
      id,
      created_at,
      quote:quotes(
        monthly_rental_rate,
        setup_fee,
        lead:leads(
          customer:customers(
            first_name,
            last_name
          )
        )
      )
    `)
    .eq('agreement_status', 'SIGNED')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
      <InvoiceForm agreementId={resolvedSearchParams?.agreementId} agreements={agreements || []} />
    </div>
  )
} 