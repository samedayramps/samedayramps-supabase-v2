"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/hooks/use-toast"
import { useState } from "react"
import { Save } from "lucide-react"
import { AddressAutocomplete } from "@/components/common/address-autocomplete"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import type { Setting } from './types'
import { settingFormSchema, type SettingFormValues } from './schema'
import { updateSettings } from './actions'
import { useFormState } from 'react-dom'

interface SettingsFormProps {
  settings: Setting[]
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [addressDetails, setAddressDetails] = useState<google.maps.places.PlaceResult | null>(null)
  const [state, formAction] = useFormState(updateSettings, null)

  // Initialize form with current settings
  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingFormSchema),
    defaultValues: {
      base_setup_fee: Number(settings.find(s => s.key === 'base_setup_fee')?.value || 0),
      price_per_foot: Number(settings.find(s => s.key === 'price_per_foot')?.value || 0),
      price_per_mile: Number(settings.find(s => s.key === 'price_per_mile')?.value || 0),
      component_install_fee: Number(settings.find(s => s.key === 'component_install_fee')?.value || 0),
      warehouse_address: String(settings.find(s => s.key === 'warehouse_address')?.value || ''),
    },
  })

  const onSubmit = async (values: SettingFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()

      // Add main settings
      for (const [key, value] of Object.entries(values)) {
        formData.append(key, value.toString())
      }

      // Add lat/lng if we have address details
      if (addressDetails?.geometry?.location) {
        formData.append('warehouse_lat', addressDetails.geometry.location.lat().toString())
        formData.append('warehouse_lng', addressDetails.geometry.location.lng().toString())
      }

      // Submit the form using the Server Action
      formAction(formData)

      // Show success message
      toast({
        title: "Success",
        description: "All settings saved successfully"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show error message if the server action fails
  if (state?.message && !state.message.includes('successfully')) {
    toast({
      variant: "destructive",
      title: "Error",
      description: state.message
    })
  }

  return (
    <div className="container py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Pricing Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pricing Settings</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="base_setup_fee"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 gap-4 items-start">
                    <div>
                      <FormLabel>Base Setup Fee</FormLabel>
                      <FormDescription>
                        Initial setup fee for all installations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_per_foot"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 gap-4 items-start">
                    <div>
                      <FormLabel>Price Per Foot</FormLabel>
                      <FormDescription>
                        Monthly rental price per foot of ramp
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_per_mile"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 gap-4 items-start">
                    <div>
                      <FormLabel>Price Per Mile</FormLabel>
                      <FormDescription>
                        Additional fee per mile of travel distance
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="component_install_fee"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 gap-4 items-start">
                    <div>
                      <FormLabel>Component Installation Fee</FormLabel>
                      <FormDescription>
                        Fee per component installed
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Location Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Location Settings</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="warehouse_address"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 gap-4 items-start">
                    <div>
                      <FormLabel>Warehouse Address</FormLabel>
                      <FormDescription>
                        Address used for distance calculations
                      </FormDescription>
                    </div>
                    <div>
                      <FormControl>
                        <AddressAutocomplete
                          value={field.value}
                          onChange={(value, placeDetails) => {
                            field.onChange(value)
                            if (placeDetails) {
                              setAddressDetails(placeDetails)
                            }
                          }}
                          onBlur={field.onBlur}
                          className="w-full"
                          placeholder="Enter warehouse address"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 