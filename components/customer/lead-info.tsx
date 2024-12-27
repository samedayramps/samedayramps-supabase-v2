'use client'

import { type Tables } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface LeadInfoProps {
  lead: Tables<"leads">
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
    case 'contacted':
      return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
    case 'qualified':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
    case 'unqualified':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
    case 'quoted':
      return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
    default:
      return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
  }
}

export function LeadInfo({ lead }: LeadInfoProps) {
  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <h2 className="text-sm font-medium">Lead Information</h2>
        </div>
        <Badge variant="secondary" className={getStatusColor(lead.status)}>
          {lead.status}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="flex flex-col sm:space-y-1.5">
          <span className="text-xs sm:text-sm text-muted-foreground">Timeline</span>
          <p className="text-sm font-medium">{lead.timeline || 'Not specified'}</p>
        </div>
        <div className="flex flex-col sm:space-y-1.5">
          <span className="text-xs sm:text-sm text-muted-foreground">Notes</span>
          <p className="text-sm font-medium">{
            lead.notes 
              ? typeof lead.notes === 'string' 
                ? lead.notes 
                : JSON.stringify(lead.notes)
              : 'No notes'
          }</p>
        </div>
      </div>
      <Separator className="my-4 sm:my-6" />
    </div>
  )
} 