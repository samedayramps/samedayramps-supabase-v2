import { getCustomerWithDetails } from "@/lib/queries/customer"
import { CallCustomer } from "@/components/customer/call-customer"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { notFound } from "next/navigation"

interface CustomerCallPageProps {
  params: {
    id: string
  }
}

export default async function CustomerCallPage({ params }: CustomerCallPageProps) {
  const customer = await getCustomerWithDetails(params.id)

  if (!customer) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Customers", href: "/customers" },
    { label: `${customer.first_name} ${customer.last_name}`, href: `/customers/${customer.id}` },
    { label: "Call" }
  ]

  return (
    <div className="space-y-4">
      <Breadcrumbs items={breadcrumbs} />
      <CallCustomer customer={customer} lead={null} />
    </div>
  )
} 