"use client"

import { useState } from "react"
import { type Tables } from "@/types/database.types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/constants"
import { cancelSubscription } from "@/app/actions/subscriptions"

type SubscriptionsTableProps = {
  data: (Tables<"subscriptions"> & {
    agreement: {
      quote: {
        monthly_rental_rate: number
        rental_type: string
        lead: {
          customer: {
            first_name: string
            last_name: string
            email: string | null
          } | null
        } | null
      } | null
    } | null
  })[]
}

export function SubscriptionsTable({ data }: SubscriptionsTableProps) {
  const { toast } = useToast()
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Current Period</TableHead>
          <TableHead>Trial</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((subscription) => {
          const customer = subscription.agreement?.quote?.lead?.customer
          if (!customer) return null // Skip if no customer data
          
          return (
            <TableRow key={subscription.id}>
              <TableCell>
                {customer.first_name} {customer.last_name}
                <br />
                <span className="text-sm text-muted-foreground">
                  {customer.email}
                </span>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                  ${subscription.status === 'active' ? 'bg-green-50 text-green-700' : 
                    subscription.status === 'past_due' ? 'bg-yellow-50 text-yellow-700' :
                    subscription.status === 'canceled' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-700'}`}>
                  {SUBSCRIPTION_STATUS_LABELS[subscription.status.toUpperCase() as keyof typeof SUBSCRIPTION_STATUS_LABELS]}
                </span>
              </TableCell>
              <TableCell>
                {formatCurrency(subscription.agreement?.quote?.monthly_rental_rate || 0)}/month
              </TableCell>
              <TableCell>
                {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {subscription.trial_start && subscription.trial_end ? (
                  <>{new Date(subscription.trial_start).toLocaleDateString()} - {new Date(subscription.trial_end).toLocaleDateString()}</>
                ) : (
                  "No trial"
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {subscription.status !== 'canceled' && (
                      <DropdownMenuItem
                        onClick={() => handleCancelSubscription(subscription.id)}
                        disabled={cancelingId === subscription.id}
                      >
                        {cancelingId === subscription.id ? "Canceling..." : "Cancel Subscription"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
} 