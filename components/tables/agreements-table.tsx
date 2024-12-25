"use client"

import { type Tables } from "@/types/database.types"
import { DataTable } from "@/components/common/data-table"
import { DataTableColumnHeader } from "@/components/common/data-table-column-header"
import { DataTableRowActions } from "@/components/common/data-table-row-actions"
import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { deleteAgreement, sendAgreement } from "@/app/actions/agreements"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export type Agreement = Tables<"agreements"> & {
  quote?: {
    monthly_rental_rate: number | null
    setup_fee: number | null
    rental_type: string
    lead?: {
      customer?: Pick<Tables<"customers">, 
        | "first_name" 
        | "last_name"
        | "email"
        | "id"
      > | null
    } | null
  } | null
}

interface AgreementsTableProps {
  data: Agreement[]
}

export function AgreementsTable({ data }: AgreementsTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [sendingAgreementId, setSendingAgreementId] = useState<string | null>(null)

  const handleSendAgreement = async (id: string) => {
    try {
      setSendingAgreementId(id)
      const result = await sendAgreement(id)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Agreement sent for signature",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to send agreement",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send agreement",
      })
    } finally {
      setSendingAgreementId(null)
    }
  }

  const columns: ColumnDef<Agreement>[] = [
    {
      id: "customerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        const firstName = row.original.quote?.lead?.customer?.first_name
        const lastName = row.original.quote?.lead?.customer?.last_name
        return firstName && lastName ? (
          <div className="capitalize">{`${firstName} ${lastName}`}</div>
        ) : null
      },
    },
    {
      accessorKey: "agreement_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("agreement_status") as string
        return (
          <Badge 
            variant={
              status === "DRAFT" ? "default" :
              status === "SENT" ? "secondary" :
              status === "SIGNED" ? "success" :
              status === "DECLINED" ? "destructive" :
              status === "EXPIRED" ? "outline" :
              "default"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: "rentalType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rental Type" />
      ),
      cell: ({ row }) => {
        const rentalType = row.original.quote?.rental_type
        return rentalType === 'ONE_TIME' ? 'One-Time Rental' : 'Recurring Rental'
      },
    },
    {
      id: "monthlyRate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Monthly Rate" />
      ),
      cell: ({ row }) => {
        const amount = row.original.quote?.monthly_rental_rate
        return amount ? formatCurrency(amount) : null
      },
    },
    {
      id: "setupFee",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Setup Fee" />
      ),
      cell: ({ row }) => {
        const amount = row.original.quote?.setup_fee
        return amount ? formatCurrency(amount) : null
      },
    },
    {
      accessorKey: "signed_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Signed Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("signed_date")
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
        const agreement = row.original
        const isSent = agreement.agreement_status === 'SENT'
        const isLoading = sendingAgreementId === agreement.id
        const isDisabled = 
          isLoading || 
          agreement.agreement_status === 'SIGNED' ||
          agreement.agreement_status === 'DECLINED' ||
          agreement.agreement_status === 'EXPIRED'

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSendAgreement(agreement.id);
              }}
              disabled={isDisabled}
              className="h-8"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSent ? "Resend Agreement" : "Send for Signature"}
            </Button>
            <DataTableRowActions
              editHref={`/agreements/${agreement.id}/edit`}
              deleteAction={async () => {
                await deleteAgreement(agreement.id)
              }}
            />
          </div>
        )
      },
    },
  ]

  return (
    <DataTable<Agreement>
      columns={columns} 
      data={data} 
      filterColumn="customerName"
      filterPlaceholder="Filter by customer name..."
      onRowClick={(row) => {
        if (row.quote?.lead?.customer?.id) {
          router.push(`/customers/${row.quote.lead.customer.id}`)
        }
      }}
      newItemButton={{
        href: "/agreements/new",
        label: "New Agreement"
      }}
    />
  )
} 