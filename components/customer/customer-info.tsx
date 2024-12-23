"use client"

import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Mail, Phone, MapPin, Edit } from "lucide-react"
import { useToast } from "@/components/hooks/use-toast"
import Link from "next/link"

type CustomerWithDetails = Tables<"customers"> & {
  addresses?: Tables<"addresses">[] | null
}

interface CustomerInfoProps {
  customer: CustomerWithDetails
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  const { toast } = useToast()
  const address = customer.addresses?.[0]

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {customer.first_name} {customer.last_name}
        </CardTitle>
        <Link href={`/customers/${customer.id}/edit`}>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {customer.email && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`mailto:${customer.email}`}
                className="text-sm hover:underline"
              >
                {customer.email}
              </a>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(customer.email!, "Email")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {customer.phone && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`tel:${customer.phone}`}
                className="text-sm hover:underline"
              >
                {customer.phone}
              </a>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(customer.phone!, "Phone")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {address && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div>
                  {[
                    address.street_number,
                    address.street_name,
                  ].filter(Boolean).join(' ')}
                </div>
                <div className="text-muted-foreground">
                  {[
                    address.city,
                    address.state,
                    address.postal_code
                  ].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(address.formatted_address, "Address")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 