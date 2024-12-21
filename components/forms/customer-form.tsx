"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import { type Tables } from "@/types/database.types"
import { createCustomer, updateCustomer } from "@/app/actions/customers"
import { AddressAutocomplete } from "@/components/common/address-autocomplete"
import { createClient } from "@/utils/supabase/client"

const customerFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email().nullable(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").nullable(),
  address: z.string().nullable(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

type Customer = Tables<"customers"> & {
  addresses?: Tables<"addresses">[] | null
}

interface CustomerFormProps {
  initialData?: Customer
}

export function CustomerForm({ initialData }: CustomerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null)
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: initialData?.first_name ?? "",
      last_name: initialData?.last_name ?? "",
      email: initialData?.email ?? null,
      phone: initialData?.phone ?? null,
      address: initialData?.addresses?.[0]?.formatted_address ?? null,
    },
  })

  async function onSubmit(values: CustomerFormValues) {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      if (initialData) {
        // Update existing customer
        await updateCustomer(initialData.id, {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email || null,
          phone: values.phone || null,
        })

        // Update or create address if place details exist
        if (selectedPlaceDetails) {
          const location = selectedPlaceDetails.geometry?.location
          const addressData = {
            formatted_address: selectedPlaceDetails.formatted_address!,
            street_number: getAddressComponent(selectedPlaceDetails, 'street_number'),
            street_name: getAddressComponent(selectedPlaceDetails, 'route'),
            city: getAddressComponent(selectedPlaceDetails, 'locality'),
            state: getAddressComponent(selectedPlaceDetails, 'administrative_area_level_1'),
            postal_code: getAddressComponent(selectedPlaceDetails, 'postal_code'),
            country: getAddressComponent(selectedPlaceDetails, 'country'),
            lat: location?.lat() ?? null,
            lng: location?.lng() ?? null,
            place_id: selectedPlaceDetails.place_id ?? null,
            customer_id: initialData.id,
            lead_id: null,
          }

          const { error: addressError } = await supabase
            .from('addresses')
            .upsert(addressData)
            .eq('customer_id', initialData.id)

          if (addressError) throw addressError
        }

        toast({
          title: "Success",
          description: "Customer updated successfully",
        })
      } else {
        // Create new customer
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .insert({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email || null,
            phone: values.phone || null,
          })
          .select()
          .single()

        if (customerError) throw customerError

        // Create address if place details exist
        if (selectedPlaceDetails && customer) {
          const location = selectedPlaceDetails.geometry?.location
          const { error: addressError } = await supabase
            .from('addresses')
            .insert({
              formatted_address: selectedPlaceDetails.formatted_address!,
              street_number: getAddressComponent(selectedPlaceDetails, 'street_number'),
              street_name: getAddressComponent(selectedPlaceDetails, 'route'),
              city: getAddressComponent(selectedPlaceDetails, 'locality'),
              state: getAddressComponent(selectedPlaceDetails, 'administrative_area_level_1'),
              postal_code: getAddressComponent(selectedPlaceDetails, 'postal_code'),
              country: getAddressComponent(selectedPlaceDetails, 'country'),
              lat: location?.lat() ?? null,
              lng: location?.lng() ?? null,
              place_id: selectedPlaceDetails.place_id ?? null,
              customer_id: customer.id,
              lead_id: null,
            })

          if (addressError) throw addressError
        }

        toast({
          title: "Success",
          description: "Customer created successfully",
        })
      }

      router.push('/customers')
      router.refresh()
    } catch (error) {
      console.error('Error saving customer:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save customer",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function getAddressComponent(
    place: google.maps.places.PlaceResult,
    type: string,
    useShortName: boolean = false
  ): string | null {
    const component = place.address_components?.find(
      (component) => component.types.includes(type)
    )
    return component ? (useShortName ? component.short_name : component.long_name) : null
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address</FormLabel>
                  <AddressAutocomplete
                    value={field.value ?? ''}
                    onChange={(value, placeDetails) => {
                      field.onChange(value)
                      if (placeDetails) {
                        setSelectedPlaceDetails(placeDetails)
                      }
                    }}
                    onBlur={field.onBlur}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Customer" : "Create Customer"}
        </Button>
      </form>
    </Form>
  )
} 