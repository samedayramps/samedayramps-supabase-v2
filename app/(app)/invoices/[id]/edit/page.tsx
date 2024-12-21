import { InvoiceForm } from "@/components/forms/invoice-form"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const supabase = await createClient()
  
  // Fetch the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select()
    .eq('id', id)
    .single()

  if (invoiceError || !invoice) {
    notFound()
  }

  // Fetch agreements for the form
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
      <h1 className="text-2xl font-bold mb-6">Edit Invoice</h1>
      <InvoiceForm initialData={invoice} agreements={agreements || []} />
    </div>
  )
} 