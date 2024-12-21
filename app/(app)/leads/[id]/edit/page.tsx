import { createClient } from "@/utils/supabase/server"
import { LeadForm } from "@/components/forms/lead-form"
import { notFound } from "next/navigation"

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient()
  
  const { data: lead, error } = await supabase
    .from("leads")
    .select(`
      *,
      customer:customers(
        first_name,
        last_name,
        email,
        phone
      ),
      address:addresses(*)
    `)
    .eq('id', id)
    .order('created_at', { foreignTable: 'addresses', ascending: false })
    .single()

  if (error || !lead) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Lead</h1>
      <LeadForm initialData={lead} />
    </div>
  )
} 