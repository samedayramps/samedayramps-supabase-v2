"use client"

import { type Tables } from "@/types/database.types"
import { DataTable, DataTableRowActions } from "@/components/common/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { deleteCustomer } from "@/app/actions/customers"

export type Customer = Tables<"customers"> & {
  addresses?: Tables<"addresses">[] | null
}

const columns: ColumnDef<Customer>[] = [
  {
    id: "firstName",
    header: "First Name",
    accessorKey: "first_name",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.first_name}</div>
    ),
  },
  {
    id: "lastName",
    header: "Last Name",
    accessorKey: "last_name",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.last_name}</div>
    ),
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => {
      const email = row.original.email
      return email ? (
        <a 
          href={`mailto:${email}`} 
          className="hover:underline text-primary"
        >
          {email}
        </a>
      ) : null
    },
  },
  {
    id: "phone",
    header: "Phone",
    accessorKey: "phone",
    cell: ({ row }) => {
      const phone = row.original.phone
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
    id: "address",
    header: "Address",
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
            await deleteCustomer(id)
          } catch (error) {
            console.error('Failed to delete customer:', error)
          }
        }} 
      />
    ),
  },
]

interface CustomersTableProps {
  data: Customer[]
}

export function CustomersTable({ data }: CustomersTableProps) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      filterColumn="firstName"
      filterPlaceholder="Filter by first name..."
      deleteAction={async (id: string) => {
        try {
          await deleteCustomer(id)
        } catch (error) {
          console.error('Failed to delete customer:', error)
        }
      }}
    />
  )
} 