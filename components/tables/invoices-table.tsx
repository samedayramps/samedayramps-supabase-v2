"use client"

import { type Tables } from "@/types/database.types"
import { DataTable, DataTableRowActions } from "@/components/common/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { deleteInvoice, sendInvoice } from "@/app/actions/invoices"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { useState } from "react"

export type Invoice = Tables<"invoices"> & {
  agreement?: {
    quote?: {
      lead?: {
        customer?: Pick<Tables<"customers">, 
          | "first_name" 
          | "last_name"
          | "email"
        > | null
      } | null
    } | null
  } | null
}

interface InvoicesTableProps {
  data: Invoice[]
}

export function InvoicesTable({ data }: InvoicesTableProps) {
  const { toast } = useToast()
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null)

  const handleSendInvoice = async (id: string) => {
    try {
      setSendingInvoiceId(id)
      const result = await sendInvoice(id)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Invoice sent successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to send invoice",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invoice",
      })
    } finally {
      setSendingInvoiceId(null)
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    try {
      await deleteInvoice(id)
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete invoice",
      })
    }
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      id: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const firstName = row.original.agreement?.quote?.lead?.customer?.first_name
        const lastName = row.original.agreement?.quote?.lead?.customer?.last_name
        return firstName && lastName ? (
          <div className="capitalize">{`${firstName} ${lastName}`}</div>
        ) : null
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("amount")
        return amount ? formatCurrency(amount as number) : null
      },
    },
    {
      accessorKey: "invoice_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("invoice_type") as string
        return (
          <Badge variant="outline">
            {type === 'SETUP' ? 'Setup Fee' : 
             type === 'RENTAL' ? 'Rental Payment' : 
             type === 'REMOVAL' ? 'Removal Fee' : 
             type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "paid",
      header: "Status",
      cell: ({ row }) => {
        const paid = row.getValue("paid") as boolean
        return (
          <Badge 
            variant={paid ? "success" : "default"}
          >
            {paid ? "Paid" : "Unpaid"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "payment_date",
      header: "Payment Date",
      cell: ({ row }) => {
        const date = row.getValue("payment_date")
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
        const paid = row.original.paid;
        
        return (
          <DataTableRowActions 
            row={row.original} 
            editHref={`/invoices/${row.original.id}/edit`}
            deleteAction={handleDeleteInvoice}
            extraActions={[
              {
                label: "Send Payment Link",
                onClick: () => handleSendInvoice(row.original.id),
                disabled: 
                  sendingInvoiceId === row.original.id || 
                  paid,
                loading: sendingInvoiceId === row.original.id,
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