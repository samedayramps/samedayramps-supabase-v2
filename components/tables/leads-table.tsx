"use client"

import { type Tables } from "@/types/database.types"
import { DataTable } from "@/components/common/data-table"
import { DataTableColumnHeader } from "@/components/common/data-table-column-header"
import { DataTableRowActions } from "@/components/common/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { LEAD_STATUS } from "@/lib/constants"
import { ColumnDef, Row } from "@tanstack/react-table"
import { deleteLead } from "@/app/actions/leads"
import { useRouter } from "next/navigation"

export type Lead = Tables<"leads"> & {
  customer?: Pick<Tables<"customers">, 
    | "first_name" 
    | "last_name" 
    | "email" 
    | "phone"
    | "id"
  > | null
  address?: Tables<"addresses">[] | null
}

interface LeadsTableProps {
  data: Lead[]
}

export function LeadsTable({ data }: LeadsTableProps) {
  const router = useRouter()

  const columns: ColumnDef<Lead>[] = [
    {
      id: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="First Name" />
      ),
      accessorFn: (row) => row.customer?.first_name,
      cell: ({ row }) => (
        <div className="capitalize">{row.original.customer?.first_name}</div>
      ),
    },
    {
      id: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Name" />
      ),
      accessorFn: (row) => row.customer?.last_name,
      cell: ({ row }) => (
        <div className="capitalize">{row.original.customer?.last_name}</div>
      ),
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
          >
            {phone}
          </a>
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
      accessorKey: "mobility_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mobility Type" />
      ),
    },
    {
      accessorKey: "ramp_length",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ramp Length" />
      ),
      cell: ({ row }) => {
        const length = row.getValue("ramp_length")
        return length ? `${length} ft` : null
      },
    },
    {
      accessorKey: "timeline",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Timeline" />
      ),
    },
    {
      accessorKey: "rental_duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rental Duration" />
      ),
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
        const lead = row.original
        return (
          <DataTableRowActions
            editHref={`/leads/${lead.id}/edit`}
            deleteAction={async () => {
              await deleteLead(lead.id)
            }}
          />
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
      onRowClick={(row) => {
        if (row.customer?.id) {
          router.push(`/customers/${row.customer.id}`)
        }
      }}
    />
  )
} 