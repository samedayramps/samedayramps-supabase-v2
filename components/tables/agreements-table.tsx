"use client"

import { type Tables } from "@/types/database.types"
import { DataTable, DataTableRowActions } from "@/components/common/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { deleteAgreement, sendAgreement } from "@/app/actions/agreements"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { useState } from "react"

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
      >
    }
  }
}

interface AgreementsTableProps {
  data: Agreement[]
}

export function AgreementsTable({ data }: AgreementsTableProps) {
  const { toast } = useToast()
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

  const handleDeleteAgreement = async (id: string) => {
    try {
      await deleteAgreement(id)
      toast({
        title: "Success",
        description: "Agreement deleted successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete agreement",
      })
    }
  }

  const columns: ColumnDef<Agreement>[] = [
    {
      id: "customerName",
      header: "Customer",
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
      header: "Status",
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
      header: "Rental Type",
      cell: ({ row }) => {
        const rentalType = row.original.quote?.rental_type
        return rentalType === 'ONE_TIME' ? 'One-Time Rental' : 'Recurring Rental'
      },
    },
    {
      id: "monthlyRate",
      header: "Monthly Rate",
      cell: ({ row }) => {
        const amount = row.original.quote?.monthly_rental_rate
        return amount ? formatCurrency(amount) : null
      },
    },
    {
      id: "setupFee",
      header: "Setup Fee",
      cell: ({ row }) => {
        const amount = row.original.quote?.setup_fee
        return amount ? formatCurrency(amount) : null
      },
    },
    {
      accessorKey: "signed_date",
      header: "Signed Date",
      cell: ({ row }) => {
        const date = row.getValue("signed_date")
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
        const status = row.original.agreement_status;
        const isSent = status === 'SENT';
        
        return (
          <DataTableRowActions 
            row={row.original} 
            editHref={`/agreements/${row.original.id}/edit`}
            deleteAction={handleDeleteAgreement}
            extraActions={[
              {
                label: isSent ? "Resend Agreement" : "Send for Signature",
                onClick: () => handleSendAgreement(row.original.id),
                disabled: 
                  sendingAgreementId === row.original.id || 
                  row.original.agreement_status === 'SIGNED' ||
                  row.original.agreement_status === 'DECLINED' ||
                  row.original.agreement_status === 'EXPIRED',
                loading: sendingAgreementId === row.original.id,
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