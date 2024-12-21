import { QuoteForm } from "@/components/forms/quote-form"
import { createClient } from "@/utils/supabase/server"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient()
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
      <h1 className="text-2xl font-bold mb-6">Create New Quote</h1>
      <QuoteForm leadId={resolvedSearchParams?.leadId} leads={leads || []} />
    </div>
  )
} 