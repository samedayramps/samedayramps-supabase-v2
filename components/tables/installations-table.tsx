"use client"

import { type Tables } from "@/types/database.types"
import { DataTable, DataTableRowActions } from "@/components/common/data-table"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { deleteInstallation } from "@/app/actions/installations"

export type Installation = Tables<"installations"> & {
  agreement?: {
    quote?: {
      lead?: {
        customer?: {
          first_name: string | null
          last_name: string | null
        } | null
      } | null
    } | null
  } | null
}

const columns: ColumnDef<Installation>[] = [
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
    accessorKey: "installation_date",
    header: "Installation Date",
    cell: ({ row }) => {
      const date = row.getValue("installation_date")
      return date ? new Date(date as string).toLocaleDateString() : null
    },
  },
  {
    accessorKey: "installed_by",
    header: "Installed By",
  },
  {
    accessorKey: "sign_off",
    header: "Sign Off",
    cell: ({ row }) => {
      const signOff = row.getValue("sign_off") as boolean
      return (
        <Badge 
          variant={signOff ? "success" : "secondary"}
        >
          {signOff ? "Signed Off" : "Pending"}
        </Badge>
      )
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
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row.original} 
        deleteAction={async (id: string) => {
          try {
            await deleteInstallation(id)
          } catch (error) {
            console.error('Failed to delete installation:', error)
          }
        }} 
      />
    ),
  },
]

interface InstallationsTableProps {
  data: Installation[]
}

export function InstallationsTable({ data }: InstallationsTableProps) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      filterColumn="customerName"
      filterPlaceholder="Filter by customer name..."
      deleteAction={async (id: string) => {
        try {
          await deleteInstallation(id)
        } catch (error) {
          console.error('Failed to delete installation:', error)
        }
      }}
    />
  )
} 