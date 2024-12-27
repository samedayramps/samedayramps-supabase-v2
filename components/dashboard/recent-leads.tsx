import { createClient } from "@/utils/supabase/server"
import { formatDateTime } from "@/lib/utils/format"
import Link from "next/link"

async function getRecentLeads() {
  const supabase = createClient()

  const { data: leads } = await supabase
    .from('leads')
    .select(`
      id,
      created_at,
      status,
      timeline,
      customer:customers (
        id,
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return leads || []
}

export async function RecentLeads() {
  const leads = await getRecentLeads()

  return (
    <div className="space-y-8">
      {leads.map((lead) => (
        <div key={lead.id} className="flex items-center">
          <div className="space-y-1">
            {lead.customer?.id ? (
              <Link 
                href={`/customers/${lead.customer.id}`}
                className="font-medium hover:underline"
              >
                {lead.customer.first_name} {lead.customer.last_name}
              </Link>
            ) : (
              <span className="font-medium">
                {lead.customer?.first_name} {lead.customer?.last_name}
              </span>
            )}
            <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
              <span className="whitespace-nowrap">{formatDateTime(lead.created_at)}</span>
              <span>•</span>
              <span>{lead.timeline || 'No timeline'}</span>
              <span>•</span>
              <span className="capitalize">{lead.status.toLowerCase()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 