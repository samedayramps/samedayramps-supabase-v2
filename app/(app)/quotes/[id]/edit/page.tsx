import { QuoteForm } from "@/components/forms/quote-form"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const supabase = await createClient()
  
  // Fetch the quote
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select()
    .eq('id', id)
    .single()

  if (quoteError || !quote) {
    notFound()
  }

  // Fetch leads for the form
  const { data: leads } = await supabase
    .from("leads")
    .select(`
      id,
      created_at,
      status,
      customer:customers(
        first_name,
        last_name
      )
    `)
    .eq('status', 'NEW')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Quote</h1>
      <QuoteForm initialData={quote} leads={leads || []} />
    </div>
  )
} 