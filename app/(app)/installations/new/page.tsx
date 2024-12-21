import { InstallationForm } from "@/components/forms/installation-form"
import { createClient } from "@/utils/supabase/server"

export default async function NewInstallationPage({
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
        lead:leads(
          customer:customers(
            first_name,
            last_name
          )
        )
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Installation</h1>
      <InstallationForm agreementId={resolvedSearchParams?.agreementId} agreements={agreements || []} />
    </div>
  )
} 