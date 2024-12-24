"use client"

import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Copy, Mail, Phone, MapPin, Edit } from "lucide-react"
import { useToast } from "@/components/hooks/use-toast"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {customer.first_name} {customer.last_name}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {customer.email && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="end">
                  <div className="flex items-center gap-2">
                    <a 
                      href={`mailto:${customer.email}`}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {customer.email}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(customer.email!, "Email")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {customer.phone && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="end">
                  <div className="flex items-center gap-2">
                    <a 
                      href={`tel:${customer.phone}`}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {customer.phone}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(customer.phone!, "Phone")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {address && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="end">
                  <div className="flex items-center gap-2">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(address.formatted_address, "Address")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <Link href={`/customers/${customer.id}/edit`}>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 