import { AgreementForm } from "@/components/forms/agreement-form"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"

export default async function EditAgreementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const supabase = await createClient()
  
  // Fetch the agreement
  const { data: agreement, error: agreementError } = await supabase
    .from("agreements")
    .select()
    .eq('id', id)
    .single()

  if (agreementError || !agreement) {
    notFound()
  }

  // Fetch quotes for the form
  const { data: quotes } = await supabase
    .from("quotes")
    .select(`
      id,
      created_at,
      monthly_rental_rate,
      setup_fee,
      rental_type,
      lead:leads(
        customer:customers(
          first_name,
          last_name
        )
      )
    `)
    .eq('quote_status', 'ACCEPTED')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Agreement</h1>
      <AgreementForm initialData={agreement} quotes={quotes || []} />
    </div>
  )
} 