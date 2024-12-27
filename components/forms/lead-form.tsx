"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { useFormState } from "react-dom"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import { type Tables } from "@/types/database.types"
import { createLead, updateLead, type State } from "@/app/actions/leads"
import { AddressAutocomplete } from "@/components/common/address-autocomplete"
import { Textarea } from "@/components/ui/textarea"
import { GoogleMapsScript } from "@/components/common/google-maps-script"

const leadFormSchema = z.object({
  customer: z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email().nullable(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").nullable(),
    address: z.object({
      formatted_address: z.string().min(1, "Installation address is required"),
      street_number: z.string().nullable(),
      street_name: z.string().nullable(),
      city: z.string().nullable(),
      state: z.string().nullable(),
      postal_code: z.string().nullable(),
      country: z.string().nullable(),
      lat: z.number().nullable(),
      lng: z.number().nullable(),
      place_id: z.string().nullable(),
    }),
  }),
  timeline: z.string().nullable(),
  status: z.string().default('NEW'),
  notes: z.string().nullable(),
})

type LeadFormValues = z.infer<typeof leadFormSchema>

type Lead = Tables<"leads"> & {
  customer?: Pick<Tables<"customers">, 
    | "first_name" 
    | "last_name" 
    | "email" 
    | "phone"
  > | null
  address?: Tables<"addresses">[] | null
}

interface LeadFormProps {
  initialData?: Lead
}

const initialState: State = {
  errors: {},
  message: null,
}

export function LeadForm({ initialData }: LeadFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [state, formAction] = useFormState(createLead, initialState)
  
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      customer: {
        first_name: initialData?.customer?.first_name ?? "",
        last_name: initialData?.customer?.last_name ?? "",
        email: initialData?.customer?.email ?? "",
        phone: initialData?.customer?.phone ?? "",
        address: initialData?.address?.[0] ? {
          formatted_address: initialData.address[0].formatted_address,
          street_number: initialData.address[0].street_number,
          street_name: initialData.address[0].street_name,
          city: initialData.address[0].city,
          state: initialData.address[0].state,
          postal_code: initialData.address[0].postal_code,
          country: initialData.address[0].country,
          lat: initialData.address[0].lat,
          lng: initialData.address[0].lng,
          place_id: initialData.address[0].place_id,
        } : {
          formatted_address: "",
          street_number: null,
          street_name: null,
          city: null,
          state: null,
          postal_code: null,
          country: null,
          lat: null,
          lng: null,
          place_id: null,
        },
      },
      timeline: initialData?.timeline ?? null,
      status: initialData?.status ?? 'NEW',
      notes: initialData?.notes ? JSON.stringify(initialData.notes) : null,
    },
  })

  // Handle server-side validation errors
  useEffect(() => {
    if (state.message) {
      toast({
        variant: state.errors ? "destructive" : "default",
        title: state.errors ? "Error" : "Success",
        description: state.message,
      })
    }
  }, [state, toast])

  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null)

  async function onSubmit(values: LeadFormValues) {
    setIsSubmitting(true)
    
    try {
      if (initialData) {
        await updateLead(initialData.id, {
          status: values.status,
          timeline: values.timeline,
          notes: values.notes,
        })
      } else {
        const formData = new FormData()
        
        // Add customer data
        formData.append('customer.first_name', values.customer.first_name)
        formData.append('customer.last_name', values.customer.last_name)
        formData.append('customer.email', values.customer.email || '')
        formData.append('customer.phone', values.customer.phone || '')
        
        // Add address data
        formData.append('customer.address.formatted_address', values.customer.address.formatted_address)
        formData.append('customer.address.street_number', values.customer.address.street_number || '')
        formData.append('customer.address.street_name', values.customer.address.street_name || '')
        formData.append('customer.address.city', values.customer.address.city || '')
        formData.append('customer.address.state', values.customer.address.state || '')
        formData.append('customer.address.postal_code', values.customer.address.postal_code || '')
        formData.append('customer.address.country', values.customer.address.country || '')
        formData.append('customer.address.lat', values.customer.address.lat?.toString() || '')
        formData.append('customer.address.lng', values.customer.address.lng?.toString() || '')
        formData.append('customer.address.place_id', values.customer.address.place_id || '')
        
        // Add other data
        formData.append('timeline', values.timeline || '')
        formData.append('status', values.status)
        formData.append('notes', values.notes || '')
        
        // Use formAction from useFormState
        formAction(formData)
      }

      if (!state.errors) {
        router.push('/leads')
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving lead:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save lead",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GoogleMapsScript>
      <Form {...form}>
        <form action={formAction} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Show form-level errors */}
          {state.message && state.errors && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md">
              {state.message}
            </div>
          )}

          <div className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer.first_name"
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
                name="customer.last_name"
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
                name="customer.email"
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
                name="customer.phone"
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
                name="customer.address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Installation Address</FormLabel>
                    <AddressAutocomplete
                      value={field.value.formatted_address}
                      onChange={(value, placeDetails) => {
                        if (placeDetails) {
                          const location = placeDetails.geometry?.location
                          setSelectedPlaceDetails(placeDetails)
                          field.onChange({
                            formatted_address: placeDetails.formatted_address!,
                            street_number: getAddressComponent(placeDetails, 'street_number'),
                            street_name: getAddressComponent(placeDetails, 'route'),
                            city: getAddressComponent(placeDetails, 'locality'),
                            state: getAddressComponent(placeDetails, 'administrative_area_level_1'),
                            postal_code: getAddressComponent(placeDetails, 'postal_code'),
                            country: getAddressComponent(placeDetails, 'country'),
                            lat: location?.lat() ?? null,
                            lng: location?.lng() ?? null,
                            place_id: placeDetails.place_id ?? null,
                          })
                        } else {
                          field.onChange({
                            ...field.value,
                            formatted_address: value,
                          })
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

          <div className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Ramp Requirements</h2>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How soon do you need the ramp?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ASAP">As soon as possible</SelectItem>
                        <SelectItem value="THIS_WEEK">This week</SelectItem>
                        <SelectItem value="THIS_MONTH">This month</SelectItem>
                        <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information or special requirements..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Lead" : "Create Lead"}
          </Button>
        </form>
      </Form>
    </GoogleMapsScript>
  )
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