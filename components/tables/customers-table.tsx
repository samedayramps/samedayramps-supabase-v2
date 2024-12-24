"use client"

import { type Tables } from "@/types/database.types"
import { DataTable } from "@/components/common/data-table"
import { DataTableColumnHeader } from "@/components/common/data-table-column-header"
import { DataTableRowActions } from "@/components/common/data-table-row-actions"
import { ColumnDef } from "@tanstack/react-table"
import { deleteCustomer } from "@/app/actions/customers"
import Link from "next/link"

export type Customer = Tables<"customers"> & {
  addresses?: Tables<"addresses">[] | null
}

interface CustomersTableProps {
  data: Customer[]
}

export function CustomersTable({ data }: CustomersTableProps) {
  const columns: ColumnDef<Customer>[] = [
    {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const firstName = row.original.first_name
        const lastName = row.original.last_name
        return (
          <Link 
            href={`/customers/${row.original.id}`}
            className="block capitalize hover:underline"
          >
            {[firstName, lastName].filter(Boolean).join(" ")}
          </Link>
        )
      },
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    },
    {
      id: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      accessorKey: "email",
      cell: ({ row }) => {
        const email = row.original.email
        return email ? (
          <a 
            href={`mailto:${email}`} 
            className="hover:underline text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {email}
          </a>
        ) : null
      },
    },
    {
      id: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      accessorKey: "phone",
      cell: ({ row }) => {
        const phone = row.original.phone
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
      cell: ({ row }) => {
        const address = row.original.addresses?.[0]
        return address ? (
          <div>
            <div>{[
              address.street_number,
              address.street_name,
            ].filter(Boolean).join(' ')}</div>
            <div className="text-sm text-muted-foreground">
              {[
                address.city,
                address.state,
                address.postal_code
              ].filter(Boolean).join(', ')}
            </div>
          </div>
        ) : null
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
        const customer = row.original
        return (
          <DataTableRowActions
            editHref={`/customers/${customer.id}/edit`}
            deleteAction={async () => {
              await deleteCustomer(customer.id)
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
      filterColumn="name"
      filterPlaceholder="Filter by name..."
    />
  )
} 