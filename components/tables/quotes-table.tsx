"use client"

import { type Tables } from "@/types/database.types"
import { DataTable, DataTableRowActions } from "@/components/common/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { deleteQuote, sendQuote } from "@/app/actions/quotes"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { useState } from "react"

export type Quote = Tables<"quotes"> & {
  lead?: {
    customer?: Pick<Tables<"customers">, 
      | "first_name" 
      | "last_name"
    >
  }
}

interface QuotesTableProps {
  data: Quote[]
}

export function QuotesTable({ data }: QuotesTableProps) {
  const { toast } = useToast()
  const [sendingQuoteId, setSendingQuoteId] = useState<string | null>(null)

  const handleSendQuote = async (id: string) => {
    try {
      setSendingQuoteId(id)
      const result = await sendQuote(id)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Quote sent successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to send quote",
        })
      }
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

  const handleDeleteQuote = async (id: string) => {
    try {
      await deleteQuote(id)
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete quote",
      })
    }
  }

  const columns: ColumnDef<Quote>[] = [
    {
      id: "customerName",
      header: "Customer",
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
      header: "Monthly Rate",
      cell: ({ row }) => {
        const amount = row.getValue("monthly_rental_rate")
        return amount ? formatCurrency(amount as number) : null
      },
    },
    {
      accessorKey: "setup_fee",
      header: "Setup Fee",
      cell: ({ row }) => {
        const amount = row.getValue("setup_fee")
        return amount ? formatCurrency(amount as number) : null
      },
    },
    {
      accessorKey: "quote_status",
      header: "Status",
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
      header: "Valid Until",
      cell: ({ row }) => {
        const date = row.getValue("valid_until")
        return date ? new Date(date as string).toLocaleDateString() : null
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        return new Date(row.getValue("created_at")).toLocaleDateString()
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const status = row.original.quote_status;
        const isSent = status === 'SENT';
        
        return (
          <DataTableRowActions 
            row={row.original} 
            editHref={`/quotes/${row.original.id}/edit`}
            deleteAction={handleDeleteQuote}
            extraActions={[
              {
                label: isSent ? "Resend Quote" : "Send Quote",
                onClick: () => handleSendQuote(row.original.id),
                disabled: 
                  sendingQuoteId === row.original.id || 
                  row.original.quote_status === 'ACCEPTED' ||
                  row.original.quote_status === 'REJECTED',
                loading: sendingQuoteId === row.original.id,
              }
            ]}
          />
        )
      },
    },
  ]

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      filterColumn="customerName"
      filterPlaceholder="Filter by customer name..."
    />
  )
} 