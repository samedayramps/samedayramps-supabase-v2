"use client"

import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RampCalculator } from "./ramp-calculator"
import { useRouter } from "next/navigation"
import { Notes } from "./notes"

interface CallCustomerProps {
  customer: Tables<"customers"> & {
    addresses?: Tables<"addresses">[]
  }
  lead: Tables<"leads"> | null
}

export function CallCustomer({ customer, lead }: CallCustomerProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{`${customer.first_name} ${customer.last_name}`}</h1>
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card>
        <Tabs defaultValue="calculator">
          <TabsList className="w-full">
            <TabsTrigger value="calculator" className="flex-1">Calculator</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="calculator">
            <div className="p-4">
              <RampCalculator 
                customerAddress={customer.addresses?.[0]?.formatted_address || ""}
              />
            </div>
          </TabsContent>
          <TabsContent value="notes">
            <div className="p-4">
              <Notes customerId={customer.id} />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
} 