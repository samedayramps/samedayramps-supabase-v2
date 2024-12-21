import { createClient } from "@/utils/supabase/server"
import { InstallationForm } from "@/components/forms/installation-form"
import { notFound } from "next/navigation"

export default async function EditInstallationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient()
  
  const { data: installation, error } = await supabase
    .from("installations")
    .select(`
      *,
      agreement:agreements(
        quote:quotes(
          lead:leads(
            customer:customers(
              first_name,
              last_name
            )
          )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !installation) {
    notFound()
  }

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
      <h1 className="text-2xl font-bold mb-6">Edit Installation</h1>
      <InstallationForm initialData={installation} agreements={agreements || []} />
    </div>
  )
} 