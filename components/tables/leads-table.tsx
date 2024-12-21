"use client"

import { type Tables } from "@/types/database.types"
import { DataTable, DataTableRowActions } from "@/components/common/data-table"
import { Badge } from "@/components/ui/badge"
import { LEAD_STATUS } from "@/lib/constants"
import { ColumnDef } from "@tanstack/react-table"
import { deleteLead } from "@/app/actions/leads"

export type Lead = Tables<"leads"> & {
  customer?: Pick<Tables<"customers">, 
    | "first_name" 
    | "last_name" 
    | "email" 
    | "phone"
  >
}

const columns: ColumnDef<Lead>[] = [
  {
    id: "firstName",
    header: "First Name",
    accessorFn: (row) => row.customer?.first_name,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.customer?.first_name}</div>
    ),
  },
  {
    id: "lastName",
    header: "Last Name",
    accessorFn: (row) => row.customer?.last_name,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.customer?.last_name}</div>
    ),
  },
  {
    id: "phone",
    header: "Phone",
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
    header: "Status",
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
    header: "Mobility Type",
  },
  {
    accessorKey: "ramp_length",
    header: "Ramp Length",
    cell: ({ row }) => {
      const length = row.getValue("ramp_length")
      return length ? `${length} ft` : null
    },
  },
  {
    accessorKey: "timeline",
    header: "Timeline",
  },
  {
    accessorKey: "rental_duration",
    header: "Rental Duration",
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
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row.original} 
        deleteAction={async (id: string) => {
          try {
            await deleteLead(id)
          } catch (error) {
            console.error('Failed to delete lead:', error)
            // You could add toast notification here
          }
        }} 
      />
    ),
  },
]

interface LeadsTableProps {
  data: Lead[]
}

export function LeadsTable({ data }: LeadsTableProps) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      filterColumn="firstName"
      filterPlaceholder="Filter by first name..."
      deleteAction={async (id: string) => {
        try {
          await deleteLead(id)
        } catch (error) {
          console.error('Failed to delete lead:', error)
          // You could add toast notification here
        }
      }}
    />
  )
} 