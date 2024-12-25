"use client"

import { type Tables } from "@/types/database.types"
import { DataTable } from "@/components/common/data-table"
import { DataTableColumnHeader } from "@/components/common/data-table-column-header"
import { DataTableRowActions } from "@/components/common/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { useToast } from "@/components/hooks/use-toast"
import { useRouter } from "next/navigation"
import { type ColumnDef } from "@tanstack/react-table"
import { deleteQuote } from "@/app/actions/quotes"

export type Quote = Tables<"quotes"> & {
  lead?: {
    customer?: Pick<Tables<"customers">, 
      | "first_name" 
      | "last_name" 
      | "email" 
      | "phone"
      | "id"
    > | null
  } | null
}

interface QuotesTableProps {
  data: Quote[]
}

export function QuotesTable({ data }: QuotesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [sendingQuoteId, setSendingQuoteId] = useState<string | null>(null)

  const handleSendQuote = async (id: string) => {
    try {
      setSendingQuoteId(id)
      // TODO: Implement quote sending logic
      toast({
        title: "Success",
        description: "Quote sent successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send quote",
      })
    } finally {
      setSendingQuoteId(null)
    }
  }

  const columns: ColumnDef<Quote>[] = [
    {
      id: "customerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        const firstName = row.original.lead?.customer?.first_name
        const lastName = row.original.lead?.customer?.last_name
        return firstName && lastName ? (
          <div className="capitalize">{`${firstName} ${lastName}`}</div>
        ) : null
      },
    },
    {
      accessorKey: "monthly_rental_rate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Monthly Rate" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("monthly_rental_rate")
        return amount ? formatCurrency(amount as number) : null
      },
    },
    {
      accessorKey: "setup_fee",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Setup Fee" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("setup_fee")
        return amount ? formatCurrency(amount as number) : null
      },
    },
    {
      accessorKey: "quote_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("quote_status") as string
        return (
          <Badge 
            variant={
              status === "DRAFT" ? "default" :
              status === "SENT" ? "secondary" :
              status === "ACCEPTED" ? "success" :
              status === "REJECTED" ? "destructive" :
              "default"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "valid_until",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Valid Until" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("valid_until")
        return date ? new Date(date as string).toLocaleDateString() : null
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        return new Date(row.getValue("created_at")).toLocaleDateString()
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const quote = row.original
        const isLoading = sendingQuoteId === quote.id
        const isDisabled = isLoading || quote.quote_status === 'ACCEPTED'

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSendQuote(quote.id);
              }}
              disabled={isDisabled}
              className="h-8"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {quote.quote_status === 'SENT' ? "Resend Quote" : "Send Quote"}
            </Button>
            <DataTableRowActions
              editHref={`/quotes/${quote.id}/edit`}
              deleteAction={async () => {
                await deleteQuote(quote.id)
              }}
            />
          </div>
        )
      },
    },
  ]

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      filterColumn="customer_name"
      filterPlaceholder="Filter by customer name..."
      onRowClick={(row) => router.push(`/quotes/${row.id}`)}
      newItemButton={{
        href: "/quotes/new",
        label: "New Quote"
      }}
    />
  )
} 