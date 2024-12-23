"use client"

import { type Tables } from "@/types/database.types"
import { DataTable } from "@/components/common/data-table"
import { DataTableColumnHeader } from "@/components/common/data-table-column-header"
import { DataTableRowActions } from "@/components/common/data-table-row-actions"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { deleteInvoice, sendInvoice } from "@/app/actions/invoices"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export type Invoice = Tables<"invoices"> & {
  agreement?: {
    quote?: {
      lead?: {
        customer?: Pick<Tables<"customers">, 
          | "first_name" 
          | "last_name"
          | "email"
          | "id"
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
  const router = useRouter()
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

  const columns: ColumnDef<Invoice>[] = [
    {
      id: "customerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("amount")
        return amount ? formatCurrency(amount as number) : null
      },
    },
    {
      accessorKey: "invoice_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("payment_date")
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
        const invoice = row.original
        const isLoading = sendingInvoiceId === invoice.id
        const isDisabled = isLoading || invoice.paid

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendInvoice(invoice.id)}
              disabled={isDisabled}
              className="h-8"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Payment Link
            </Button>
            <DataTableRowActions
              editHref={`/invoices/${invoice.id}/edit`}
              deleteAction={async () => {
                await deleteInvoice(invoice.id)
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
      filterColumn="customerName"
      filterPlaceholder="Filter by customer name..."
      onRowClick={(row) => {
        if (row.agreement?.quote?.lead?.customer?.id) {
          router.push(`/customers/${row.agreement.quote.lead.customer.id}`)
        }
      }}
    />
  )
} 