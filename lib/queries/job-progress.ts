import { createClient } from "@/utils/supabase/server"
import { type Tables } from "@/types/database.types"

type Lead = Tables<"leads"> & {
  customer?: Pick<Tables<"customers">, 
    | "first_name" 
    | "last_name" 
    | "email" 
    | "phone"
  > | null
  address?: Tables<"addresses">[] | null
}

type Quote = Tables<"quotes"> & {
  lead?: Lead | null
}

type Agreement = Tables<"agreements"> & {
  quote?: Quote | null
}

type Installation = Tables<"installations"> & {
  agreement?: Agreement | null
}

type Invoice = Tables<"invoices"> & {
  installation?: Installation | null
}

export async function getJobProgress(leadId: string) {
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('leads')
    .select(`
      id,
      created_at,
      status,
      timeline,
      customer:customers (
        first_name,
        last_name,
        email,
        phone,
        address:addresses (
          formatted_address
        )
      )
    `)
    .eq('id', leadId)
    .single()

  if (!lead) return null

  return {
    lead: {
      id: lead.id,
      createdAt: lead.created_at,
      status: lead.status,
      timeline: lead.timeline,
      customer: lead.customer ? {
        name: `${lead.customer.first_name} ${lead.customer.last_name}`,
        email: lead.customer.email,
        phone: lead.customer.phone,
        address: lead.customer.address?.[0]?.formatted_address,
      } : null,
    },
  }
} 