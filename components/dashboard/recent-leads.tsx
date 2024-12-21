import { createClient } from "@/utils/supabase/server"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

async function getRecentLeads() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('leads')
    .select(`
      id,
      created_at,
      status,
      mobility_type,
      customer:customers (
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
            <Link 
              href={`/leads/${lead.id}`}
              className="font-medium hover:underline"
            >
              {lead.customer?.first_name} {lead.customer?.last_name}
            </Link>
            <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
              <span>{formatDate(lead.created_at)}</span>
              <span>•</span>
              <span>{lead.mobility_type || 'Not specified'}</span>
              <span>•</span>
              <span className="capitalize">{lead.status.toLowerCase()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 