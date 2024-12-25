"use client"

import { useState } from "react"
import { type Tables } from "@/types/database.types"
import { DataTable } from "@/components/common/data-table"
import { DataTableColumnHeader } from "@/components/common/data-table-column-header"
import { DataTableRowActions } from "@/components/common/data-table-row-actions"
import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/constants"
import { cancelSubscription } from "@/app/actions/subscriptions"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export type Subscription = Tables<"subscriptions"> & {
  agreement: {
    quote: {
      monthly_rental_rate: number
      rental_type: string
      lead: {
        customer: {
          id: string
          first_name: string
          last_name: string
          email: string | null
        } | null
      } | null
    } | null
  } | null
}

interface SubscriptionsTableProps {
  data: Subscription[]
}

export function SubscriptionsTable({ data }: SubscriptionsTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const handleCancelSubscription = async (id: string) => {
    try {
      setCancelingId(id)
      const result = await cancelSubscription(id)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Subscription cancelled successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to cancel subscription",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription",
      })
    } finally {
      setCancelingId(null)
    }
  }

  const columns: ColumnDef<Subscription>[] = [
    {
      id: "customerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        const customer = row.original.agreement?.quote?.lead?.customer
        if (!customer) return null
        
        return (
          <div>
            <div className="font-medium">
              {customer.first_name} {customer.last_name}
            </div>
            {customer.email && (
              <div className="text-sm text-muted-foreground">
                {customer.email}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge 
            variant={
              status === "active" ? "success" :
              status === "past_due" ? "warning" :
              status === "canceled" ? "destructive" :
              "default"
            }
          >
            {SUBSCRIPTION_STATUS_LABELS[status.toUpperCase() as keyof typeof SUBSCRIPTION_STATUS_LABELS]}
          </Badge>
        )
      },
    },
    {
      id: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const amount = row.original.agreement?.quote?.monthly_rental_rate
        return amount ? (
          <div>{formatCurrency(amount)}/month</div>
        ) : null
      },
    },
    {
      id: "currentPeriod",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Current Period" />
      ),
      cell: ({ row }) => {
        const start = new Date(row.original.current_period_start).toLocaleDateString()
        const end = new Date(row.original.current_period_end).toLocaleDateString()
        return (
          <div>{start} - {end}</div>
        )
      },
    },
    {
      id: "trial",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trial" />
      ),
      cell: ({ row }) => {
        const { trial_start, trial_end } = row.original
        if (!trial_start || !trial_end) return "No trial"
        
        const start = new Date(trial_start).toLocaleDateString()
        const end = new Date(trial_end).toLocaleDateString()
        return (
          <div>{start} - {end}</div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subscription = row.original
        const isLoading = cancelingId === subscription.id
        const isDisabled = isLoading || subscription.status === 'canceled'

        return (
          <div className="flex items-center gap-2">
            {subscription.status !== 'canceled' && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelSubscription(subscription.id);
                }}
                disabled={isDisabled}
                className="h-8"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Subscription
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <DataTable<Subscription>
      columns={columns} 
      data={data} 
      filterColumn="customerName"
      filterPlaceholder="Filter by customer name..."
      onRowClick={(row) => {
        if (row.agreement?.quote?.lead?.customer?.id) {
          router.push(`/customers/${row.agreement.quote.lead.customer.id}`)
        }
      }}
      newItemButton={{
        href: "/subscriptions/new",
        label: "New Subscription"
      }}
    />
  )
} 