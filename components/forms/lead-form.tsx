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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MOBILITY_TYPES } from "@/lib/constants"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/hooks/use-toast"
import { type Tables } from "@/types/database.types"
import { updateLead } from "@/app/actions/leads"
import { AddressAutocomplete } from "@/components/common/address-autocomplete"
import { Textarea } from "@/components/ui/textarea"
import { GoogleMapsScript } from "@/components/common/google-maps-script"

const leadFormSchema = z.object({
  customer: z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email().optional().nullable(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional().nullable(),
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
  timeline: z.enum(['ASAP', 'THIS_WEEK', 'THIS_MONTH', 'FLEXIBLE']),
  knows_length: z.enum(['YES', 'NO']),
  ramp_length: z.number().optional().nullable(),
  knows_duration: z.enum(['YES', 'NO']),
  rental_months: z.number().min(1).max(60).optional().nullable(),
  mobility_types: z.array(z.string()).optional().default([]),
  status: z.string().default('NEW'),
  notes: z.string().optional().nullable(),
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

export function LeadForm({ initialData }: LeadFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
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
      timeline: initialData?.timeline as any ?? 'FLEXIBLE',
      knows_length: initialData?.ramp_length ? 'YES' : 'NO',
      ramp_length: initialData?.ramp_length ?? null,
      knows_duration: initialData?.rental_duration ? 'YES' : 'NO',
      rental_months: initialData?.rental_duration 
        ? parseInt(initialData.rental_duration.split(' ')[0]) 
        : null,
      mobility_types: initialData?.mobility_type 
        ? initialData.mobility_type.split(', ')
        : [],
      status: initialData?.status ?? 'NEW',
      notes: initialData?.notes as string ?? "",
    },
  })

  const knowsLength = form.watch('knows_length')
  const knowsDuration = form.watch('knows_duration')

  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null)

  async function onSubmit(values: LeadFormValues) {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      if (initialData) {
        // Get customer ID first
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('customer_id')
          .eq('id', initialData.id)
          .single()

        if (leadError) throw leadError

        // Update existing lead
        await updateLead(initialData.id, {
          status: values.status,
          mobility_type: values.mobility_types?.length ? values.mobility_types.join(', ') : null,
          ramp_length: values.knows_length === 'YES' ? values.ramp_length || null : null,
          timeline: values.timeline,
          rental_duration: values.knows_duration === 'YES' ? `${values.rental_months} MONTHS` : null,
          notes: values.notes || null,
        })

        // Update or create address if place details exist
        if (selectedPlaceDetails && lead.customer_id) {
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
            customer_id: lead.customer_id
          }

          const { error: addressError } = await supabase
            .from('addresses')
            .upsert(addressData)
            .eq('customer_id', lead.customer_id)

          if (addressError) throw addressError
        }

        toast({
          title: "Success",
          description: "Lead updated successfully",
        })
      } else {
        // Create new lead and address
        try {
          // First create the customer
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .insert({
              first_name: values.customer.first_name,
              last_name: values.customer.last_name,
              email: values.customer.email || null,
              phone: values.customer.phone || null,
            })
            .select()
            .single()

          if (customerError) throw customerError

          // Then create the lead
          const { data: lead, error: leadError } = await supabase
            .from('leads')
            .insert({
              customer_id: customer.id,
              status: values.status,
              mobility_type: values.mobility_types?.length ? values.mobility_types.join(', ') : null,
              ramp_length: values.knows_length === 'YES' ? values.ramp_length || null : null,
              timeline: values.timeline,
              rental_duration: values.knows_duration === 'YES' ? `${values.rental_months} MONTHS` : null,
              notes: values.notes || null,
            })
            .select()
            .single()

          if (leadError) throw leadError

          // Create address if place details exist
          if (selectedPlaceDetails && customer) {
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
              customer_id: customer.id
            }

            const { error: addressError } = await supabase
              .from('addresses')
              .insert(addressData)

            if (addressError) {
              console.error('Error creating address:', addressError)
              throw addressError
            }
          }

          toast({
            title: "Success",
            description: "Lead created successfully",
          })
        } catch (error) {
          console.error('Error creating lead:', error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create lead",
          })
        }
      }

      router.push('/leads')
      router.refresh()
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
    <GoogleMapsScript>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          // Handle manual input without place selection
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={form.control}
                name="knows_length"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Do you know the length needed?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="YES" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Yes
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="NO" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            No
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {knowsLength === 'YES' && (
                <FormField
                  control={form.control}
                  name="ramp_length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How long? (in feet)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          step="any"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="knows_duration"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Do you know how long you will need it?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="YES" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Yes
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="NO" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            No
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {knowsDuration === 'YES' && (
                <FormField
                  control={form.control}
                  name="rental_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How many months?</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={60}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="mobility_types"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>What specific mobility aids are used?</FormLabel>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(MOBILITY_TYPES).map(([key, value]) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name="mobility_types"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={key}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(value)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...(field.value || []), value]
                                        : (field.value || [])?.filter((val: string) => val !== value)
                                      field.onChange(updatedValue)
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {value}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
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