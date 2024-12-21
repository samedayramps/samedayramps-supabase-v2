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
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import { type Tables } from "@/types/database.types"
import { createQuote, updateQuote } from "@/app/actions/quotes"
import { QUOTE_STATUS, RENTAL_TYPE, RENTAL_TYPE_LABELS } from "@/lib/constants"
import { Textarea } from "@/components/ui/textarea"
import { addDays, addMonths, addWeeks } from "date-fns"
import { createClient } from "@/utils/supabase/client"

const VALID_DURATIONS = ['3_DAYS', '1_WEEK', '1_MONTH'] as const
type ValidDuration = typeof VALID_DURATIONS[number]

const quoteFormSchema = z.object({
  lead_id: z.string().min(1, "Lead is required"),
  rental_type: z.enum(['ONE_TIME', 'RECURRING'] as const),
  monthly_rental_rate: z.number().min(0, "Monthly rental rate must be positive"),
  setup_fee: z.number().min(0, "Setup fee must be positive"),
  quote_status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'] as const),
  valid_duration: z.enum(VALID_DURATIONS),
  notes: z.string().optional().nullable(),
})

type QuoteFormValues = z.infer<typeof quoteFormSchema>

type Quote = Tables<"quotes">

type Lead = {
  id: string
  created_at: string
  customer: {
    first_name: string | null
    last_name: string | null
  } | null
}

interface QuoteFormProps {
  initialData?: Quote
  leadId?: string
  leads: Lead[]
}

function getValidUntilDate(duration: ValidDuration): Date {
  const today = new Date()
  
  switch (duration) {
    case '3_DAYS':
      return addDays(today, 3)
    case '1_WEEK':
      return addWeeks(today, 1)
    case '1_MONTH':
      return addMonths(today, 1)
  }
}

function getDurationFromDate(date: string | null | undefined): ValidDuration {
  if (!date) return '1_WEEK'
  
  const validUntil = new Date(date)
  const today = new Date()
  const diffInDays = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays <= 3) return '3_DAYS'
  if (diffInDays <= 7) return '1_WEEK'
  return '1_MONTH'
}

const DURATION_LABELS: Record<ValidDuration, string> = {
  '3_DAYS': '3 Days',
  '1_WEEK': '1 Week',
  '1_MONTH': '1 Month',
}

export function QuoteForm({ initialData, leadId, leads }: QuoteFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      lead_id: initialData?.lead_id ?? leadId ?? "",
      rental_type: (initialData?.rental_type as any) ?? 'RECURRING',
      monthly_rental_rate: initialData?.monthly_rental_rate ? Number(initialData.monthly_rental_rate) : 0,
      setup_fee: initialData?.setup_fee ? Number(initialData.setup_fee) : 0,
      quote_status: (initialData?.quote_status as any) ?? 'DRAFT',
      valid_duration: getDurationFromDate(initialData?.valid_until),
      notes: initialData?.notes as string ?? "",
    },
  })

  async function onSubmit(values: QuoteFormValues) {
    setIsSubmitting(true)
    
    try {
      // Calculate the valid_until date based on the selected duration
      const validUntil = getValidUntilDate(values.valid_duration)
      
      // Remove valid_duration from the data sent to the database
      const { valid_duration, ...quoteData } = values
      
      const dataToSave = {
        ...quoteData,
        valid_until: validUntil.toISOString().split('T')[0], // Store as YYYY-MM-DD
        notes: values.notes || null,
      }
      
      if (initialData) {
        // Update existing quote
        await updateQuote(initialData.id, dataToSave)
        toast({
          title: "Success",
          description: "Quote updated successfully",
        })
      } else {
        // Create new quote
        const result = await createQuote(dataToSave)
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
          description: "Quote created successfully",
        })
        router.push('/quotes')
      }
    } catch (error) {
      console.error('Error saving quote:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save quote",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Quote Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="lead_id"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Lead</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a lead" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.customer 
                            ? `${lead.customer.first_name} ${lead.customer.last_name} - ${new Date(lead.created_at).toLocaleDateString()}`
                            : `Lead ${lead.id} - ${new Date(lead.created_at).toLocaleDateString()}`
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
              name="rental_type"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Rental Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rental type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RENTAL_TYPE).map(([key, value]) => (
                        <SelectItem key={value} value={value}>
                          {RENTAL_TYPE_LABELS[key as keyof typeof RENTAL_TYPE]}
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
              name="monthly_rental_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch('rental_type') === 'ONE_TIME' ? 'Rental Rate' : 'Monthly Rental Rate'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="setup_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setup Fee</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quote_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(QUOTE_STATUS).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
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
              name="valid_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid For</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DURATION_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
              name="notes"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Quote" : "Create Quote"}
        </Button>
      </form>
    </Form>
  )
} 