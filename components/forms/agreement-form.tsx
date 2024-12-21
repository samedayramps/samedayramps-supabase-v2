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
import { createAgreement, updateAgreement } from "@/app/actions/agreements"
import { AGREEMENT_STATUS } from "@/lib/constants"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"

const agreementFormSchema = z.object({
  quote_id: z.string().min(1, "Quote is required"),
  agreement_status: z.enum(['DRAFT', 'SENT', 'SIGNED', 'DECLINED', 'EXPIRED'] as const),
  notes: z.any().optional().nullable(),
})

type AgreementFormValues = z.infer<typeof agreementFormSchema>

type Agreement = Tables<"agreements">

type Quote = {
  id: string
  created_at: string
  monthly_rental_rate: number | null
  setup_fee: number | null
  rental_type: string
  lead?: {
    customer?: {
      first_name: string | null
      last_name: string | null
    } | null
  } | null
}

interface AgreementFormProps {
  initialData?: Agreement
  quoteId?: string
  quotes: Quote[]
}

export function AgreementForm({ initialData, quoteId, quotes }: AgreementFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementFormSchema),
    defaultValues: {
      quote_id: initialData?.quote_id ?? quoteId ?? "",
      agreement_status: (initialData?.agreement_status as any) ?? 'DRAFT',
      notes: initialData?.notes ?? null,
    },
  })

  async function onSubmit(values: AgreementFormValues) {
    setIsSubmitting(true)
    
    try {
      if (initialData) {
        // Update existing agreement
        await updateAgreement(initialData.id, values)
        toast({
          title: "Success",
          description: "Agreement updated successfully",
        })
      } else {
        // Create new agreement
        const result = await createAgreement(values)
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
          description: "Agreement created successfully",
        })
        router.push('/agreements')
      }
    } catch (error) {
      console.error('Error saving agreement:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save agreement",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Agreement Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quote_id"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Quote</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a quote" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {quotes.map((quote) => (
                        <SelectItem key={quote.id} value={quote.id}>
                          {quote.lead?.customer 
                            ? `${quote.lead.customer.first_name} ${quote.lead.customer.last_name} - ${formatCurrency(quote.monthly_rental_rate || 0)}/month`
                            : `Quote ${quote.id} - ${formatCurrency(quote.monthly_rental_rate || 0)}/month`
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
              name="agreement_status"
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
                      {Object.entries(AGREEMENT_STATUS).map(([key, value]) => (
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
          {isSubmitting ? "Saving..." : initialData ? "Update Agreement" : "Create Agreement"}
        </Button>
      </form>
    </Form>
  )
} 