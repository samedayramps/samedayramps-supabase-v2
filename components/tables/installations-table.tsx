"use client"

import { type Tables } from "@/types/database.types"
import { DataTable } from "@/components/common/data-table"
import { DataTableColumnHeader } from "@/components/common/data-table-column-header"
import { DataTableRowActions } from "@/components/common/data-table-row-actions"
import { type ColumnDef } from "@tanstack/react-table"
import { deleteInstallation } from "@/app/actions/installations"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

export type Installation = Tables<"installations"> & {
  agreement?: {
    quote?: {
      lead?: {
        customer?: Pick<Tables<"customers">, 
          | "first_name" 
          | "last_name" 
          | "email" 
          | "phone"
          | "id"
        > | null
      } | null
    } | null
  } | null
}

interface InstallationsTableProps {
  data: Installation[]
}

export function InstallationsTable({ data }: InstallationsTableProps) {
  const router = useRouter()

  const columns: ColumnDef<Installation>[] = [
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
      accessorKey: 'installation_date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Installation Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue('installation_date')
        return date ? formatDate(date as string) : 'Not scheduled'
      },
    },
    {
      accessorKey: 'installed_by',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Installed By" />
      ),
    },
    {
      accessorKey: 'sign_off',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sign Off" />
      ),
      cell: ({ row }) => {
        return row.getValue('sign_off') ? 'Yes' : 'No'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const installation = row.original
        return (
          <DataTableRowActions
            editHref={`/installations/${installation.id}/edit`}
            deleteAction={async () => {
              await deleteInstallation(installation.id)
            }}
          />
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
      onRowClick={(row) => router.push(`/installations/${row.id}`)}
      newItemButton={{
        href: "/installations/new",
        label: "New Installation"
      }}
    />
  )
} 