import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"

export default async function QuoteAcceptedPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; error?: string }>
}) {
  const { id, error } = await searchParams
  
  if (!id) {
    notFound()
  }

  const supabase = await createClient()
  const { data: quote } = await supabase
    .from("quotes")
    .select(`
      *,
      lead:leads(
        customer:customers(
          first_name,
          last_name
        )
      )
    `)
    .eq('id', id)
    .single()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {error ? (
          <>
            <XCircle className="mx-auto h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold text-destructive">Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold text-green-700">Quote Accepted!</h1>
            <p className="text-muted-foreground">
              Thank you for accepting the quote
              {quote?.lead?.customer && ` ${quote.lead.customer.first_name} ${quote.lead.customer.last_name}`}.
              We'll be in touch shortly with next steps.
            </p>
          </>
        )}
      </div>
    </div>
  )
} 