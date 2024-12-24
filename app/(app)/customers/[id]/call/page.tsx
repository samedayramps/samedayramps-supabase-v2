import { getCustomerWithDetails } from "@/lib/queries/customers"
import { notFound } from "next/navigation"
import { CallCustomer } from "@/components/customer/call-customer"

interface CallCustomerPageProps {
  params: {
    id: string
  }
}

export default async function CallCustomerPage({ params }: CallCustomerPageProps) {
  const { customer, lead } = await getCustomerWithDetails(params.id)

  if (!customer) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <CallCustomer 
        customer={customer} 
        lead={lead} 
      />
    </div>
  )
} 