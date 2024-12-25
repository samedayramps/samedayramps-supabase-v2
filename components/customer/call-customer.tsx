"use client"

import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RampCalculator } from "./ramp-calculator"
import { useRouter } from "next/navigation"
import { Notes } from "./notes-drawer"
import { CustomerHeader } from "./customer-header"
import { LeadInfo } from "./lead-info"
import { CallGuide } from "./call-guide"

interface CallCustomerProps {
  customer: Tables<"customers"> & {
    addresses?: Tables<"addresses">[]
  }
  lead: Tables<"leads"> | null
}

export function CallCustomer({ customer, lead }: CallCustomerProps) {
  const router = useRouter()
  const customerName = `${customer.first_name} ${customer.last_name}`

  return (
    <div className="relative min-h-screen space-y-6 pb-20">
      <CustomerHeader 
        customer={customer}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <div className="space-y-6">
        {lead && (
          <>
            <LeadInfo lead={lead} />
            <CallGuide customerName={customerName} />
          </>
        )}

        <Card>
          <RampCalculator 
            customerAddress={customer.addresses?.[0]?.formatted_address || ""}
          />
        </Card>
      </div>
    </div>
  )
} 