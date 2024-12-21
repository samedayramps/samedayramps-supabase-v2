import { AgreementForm } from "@/components/forms/agreement-form"
import { createClient } from "@/utils/supabase/server"

export default async function NewAgreementPage({
  searchParams,
}: {
  searchParams: Promise<{ quoteId?: string }>
}) {
  const supabase = await createClient()
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

  const resolvedSearchParams = await searchParams;
  const { quoteId } = resolvedSearchParams;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Agreement</h1>
      <AgreementForm quoteId={quoteId} quotes={quotes || []} />
    </div>
  )
} 