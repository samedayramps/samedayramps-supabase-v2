"use client"

import { type Database } from "@/types/database.types"
import { DataTable } from "@/components/common/data-table"
import { DataTableColumnHeader } from "@/components/common/data-table-column-header"
import { DataTableRowActions } from "@/components/common/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { LEAD_STATUS } from "@/lib/constants"
import { ColumnDef } from "@tanstack/react-table"
import { deleteLead } from "@/app/actions/leads"
import { formatDateTime } from "@/lib/utils/format"
import Link from "next/link"
import { useRouter } from "next/navigation"

type DbLead = Database["public"]["Tables"]["leads"]["Row"]
type DbCustomer = Database["public"]["Tables"]["customers"]["Row"]
type DbAddress = Database["public"]["Tables"]["addresses"]["Row"]

export type Lead = DbLead & {
  customer?: (Pick<DbCustomer, 
    | "first_name" 
    | "last_name" 
    | "email" 
    | "phone"
    | "id"
  > & {
    addresses?: DbAddress[]
  }) | null
}

interface LeadsTableProps {
  data: Lead[]
}

export function LeadsTable({ data }: LeadsTableProps) {
  const router = useRouter()

  const handleRowClick = (lead: Lead) => {
    if (lead.customer?.id) {
      router.push(`/customers/${lead.customer.id}`)
    }
  }

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => {
        const id = row.getValue("id") as string
        return (
          <div className="font-mono text-xs">
            {id.slice(0, 8)}
          </div>
        )
      },
    },
    {
      id: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="First Name" />
      ),
      accessorFn: (row) => row.customer?.first_name,
      cell: ({ row }) => {
        const customerId = row.original.customer?.id
        const firstName = row.original.customer?.first_name

        return (
          <div className="capitalize">
            {customerId ? (
              <Link 
                href={`/customers/${customerId}`}
                className="hover:underline text-primary"
              >
                {firstName}
              </Link>
            ) : (
              firstName
            )}
          </div>
        )
      },
    },
    {
      id: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Name" />
      ),
      accessorFn: (row) => row.customer?.last_name,
      cell: ({ row }) => {
        const customerId = row.original.customer?.id
        const lastName = row.original.customer?.last_name

        return (
          <div className="capitalize">
            {customerId ? (
              <Link 
                href={`/customers/${customerId}`}
                className="hover:underline text-primary"
              >
                {lastName}
              </Link>
            ) : (
              lastName
            )}
          </div>
        )
      },
    },
    {
      id: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      accessorFn: (row) => row.customer?.phone,
      cell: ({ row }) => {
        const phone = row.original.customer?.phone
        return phone ? (
          <a 
            href={`tel:${phone}`} 
            className="hover:underline text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {phone}
          </a>
        ) : null
      },
    },
    {
      id: "address",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Address" />
      ),
      accessorFn: (row) => row.customer?.addresses?.[0]?.formatted_address,
      cell: ({ row }) => {
        const address = row.original.customer?.addresses?.[0]
        return address ? (
          <div className="max-w-[300px] truncate" title={address.formatted_address}>
            {address.formatted_address}
          </div>
        ) : null
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof LEAD_STATUS
        return (
          <Badge 
            variant={
              status === "NEW" ? "default" :
              status === "CONTACTED" ? "secondary" :
              status === "QUALIFIED" ? "info" :
              status === "QUOTED" ? "warning" :
              status === "WON" ? "success" :
              "destructive"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "timeline",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Timeline" />
      ),
      cell: ({ row }) => {
        const timeline = row.getValue("timeline") as string | null
        return timeline ? (
          <div className="capitalize">
            {timeline.toLowerCase().replace(/_/g, ' ')}
          </div>
        ) : null
      }
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string
        return (
          <div className="whitespace-nowrap">
            {formatDateTime(date)}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DataTableRowActions
              deleteAction={async () => {
                await deleteLead(lead.id)
              }}
            />
          </div>
        )
      },
    },
  ]

  return (
    <DataTable<Lead>
      columns={columns} 
      data={data} 
      filterColumn="firstName"
      filterPlaceholder="Filter by first name..."
      onRowClick={handleRowClick}
      newItemButton={{
        href: "/leads/new",
        label: "New Lead"
      }}
    />
  )
} 