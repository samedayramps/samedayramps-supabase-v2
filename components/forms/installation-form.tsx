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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import { type Tables } from "@/types/database.types"
import { createInstallation, updateInstallation } from "@/app/actions/installations"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { ImageUpload } from "@/components/common/image-upload"

const installationFormSchema = z.object({
  agreement_id: z.string().min(1, "Agreement is required"),
  installation_date: z.date().nullable(),
  installed_by: z.string().nullable(),
  sign_off: z.boolean().default(false),
  installation_photos: z.array(z.string()).nullable(),
})

type InstallationFormValues = z.infer<typeof installationFormSchema>

type Installation = Tables<"installations">

type Agreement = {
  id: string
  created_at: string
  quote?: {
    lead?: {
      customer?: {
        first_name: string | null
        last_name: string | null
      } | null
    } | null
  } | null
}

interface InstallationFormProps {
  initialData?: Installation
  agreementId?: string
  agreements: Agreement[]
}

export function InstallationForm({ initialData, agreementId, agreements }: InstallationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<InstallationFormValues>({
    resolver: zodResolver(installationFormSchema),
    defaultValues: {
      agreement_id: initialData?.agreement_id ?? agreementId ?? "",
      installation_date: initialData?.installation_date ? new Date(initialData.installation_date) : null,
      installed_by: initialData?.installed_by ?? null,
      sign_off: initialData?.sign_off ?? false,
      installation_photos: (initialData?.installation_photos as string[]) ?? null,
    },
  })

  async function onSubmit(values: InstallationFormValues) {
    setIsSubmitting(true)
    
    try {
      // Convert Date to ISO string for Supabase
      const dataToSave = {
        ...values,
        installation_date: values.installation_date?.toISOString() ?? null,
        installation_photos: values.installation_photos || null,
      }

      if (initialData) {
        // Update existing installation
        await updateInstallation(initialData.id, dataToSave)
        toast({
          title: "Success",
          description: "Installation updated successfully",
        })
      } else {
        // Create new installation
        const result = await createInstallation(dataToSave)
        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
          })
          return
        }
        toast({
          title: "Success",
          description: "Installation created successfully",
        })
      }

      router.push('/installations')
      router.refresh()
    } catch (error) {
      console.error('Error saving installation:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save installation",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Installation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="agreement_id"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Agreement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an agreement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agreements.map((agreement) => (
                        <SelectItem key={agreement.id} value={agreement.id}>
                          {agreement.quote?.lead?.customer 
                            ? `${agreement.quote.lead.customer.first_name} ${agreement.quote.lead.customer.last_name} - ${new Date(agreement.created_at).toLocaleDateString()}`
                            : `Agreement ${agreement.id} - ${new Date(agreement.created_at).toLocaleDateString()}`
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installation_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Installation Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installed_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Installed By</FormLabel>
                  <FormControl>
                    <Input 
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
              name="sign_off"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Installation Sign Off
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installation_photos"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Installation Photos</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value ?? []}
                      onChange={field.onChange}
                      onRemove={(url) => {
                        const newValue = field.value?.filter((val) => val !== url) ?? []
                        field.onChange(newValue.length > 0 ? newValue : null)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Installation" : "Create Installation"}
        </Button>
      </form>
    </Form>
  )
} 