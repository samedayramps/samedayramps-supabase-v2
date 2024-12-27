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
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import { type Tables } from "@/types/database.types"
import { createInvoice, updateInvoice, sendInvoice } from "@/app/actions/invoices"
import { INVOICE_TYPE } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const invoiceFormSchema = z.object({
  agreement_id: z.string().min(1, "Agreement is required"),
  invoice_type: z.enum(['SETUP', 'RECURRING', 'ONE_TIME'] as const),
  amount: z.number().min(0, "Amount must be positive"),
  paid: z.boolean().default(false),
  payment_date: z.string().nullable(),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

type Invoice = Tables<"invoices">

type Agreement = {
  id: string
  created_at: string
  quote?: {
    monthly_rental_rate: number | null
    setup_fee: number | null
    lead?: {
      customer?: {
        first_name: string | null
        last_name: string | null
      } | null
    } | null
  } | null
}

interface InvoiceFormProps {
  initialData?: Invoice
  agreementId?: string
  agreements: Agreement[]
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function InvoiceForm({ initialData, agreementId, agreements }: InvoiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const { toast } = useToast()
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      agreement_id: initialData?.agreement_id ?? agreementId ?? "",
      invoice_type: (initialData?.invoice_type as any) ?? 'RENTAL',
      amount: initialData?.amount ? Number(initialData.amount) : 0,
      paid: initialData?.paid ?? false,
      payment_date: initialData?.payment_date ?? null,
    },
  })

  // Auto-fill amount based on invoice type and selected agreement
  const selectedAgreementId = form.watch('agreement_id')
  const selectedInvoiceType = form.watch('invoice_type')
  
  const selectedAgreement = agreements.find(a => a.id === selectedAgreementId)
  
  const handleInvoiceTypeChange = (type: string) => {
    form.setValue('invoice_type', type as any)
    
    if (selectedAgreement?.quote) {
      let amount = 0
      switch (type) {
        case 'SETUP':
          amount = selectedAgreement.quote.setup_fee || 0
          break
        case 'RECURRING':
          amount = selectedAgreement.quote.monthly_rental_rate || 0
          break
        case 'ONE_TIME':
          // You might want to set a default one-time fee or calculate it differently
          amount = selectedAgreement.quote.setup_fee || 0
          break
      }
      form.setValue('amount', amount)
    }
  }

  async function onSubmit(values: InvoiceFormValues) {
    setIsSubmitting(true)
    
    try {
      if (initialData) {
        // Update existing invoice
        await updateInvoice(initialData.id, values)
        toast({
          title: "Success",
          description: "Invoice updated successfully",
        })
      } else {
        // Create new invoice
        const result = await createInvoice(values)
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
          description: "Invoice created successfully",
        })
        router.push('/invoices')
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save invoice",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendInvoice = async (id: string) => {
    try {
      const result = await sendInvoice(id)
      
      if (result.success) {
        if ('clientSecret' in result && result.clientSecret) {
          // Handle subscription setup
          setClientSecret(result.clientSecret)
          toast({
            title: "Success",
            description: "Please complete the subscription setup",
          })
        } else if ('paymentLink' in result && result.paymentLink) {
          // Handle one-time payment
          setPaymentLink(result.paymentLink)
          toast({
            title: "Success",
            description: "Payment link generated successfully",
          })
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to process payment",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment",
      })
    }
  }

  const handlePaymentSetup = async () => {
    if (!initialData?.id) return;
    
    try {
      setIsSubmitting(true)
      await handleSendInvoice(initialData.id)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set up payment",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
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
                            ? `${agreement.quote.lead.customer.first_name} ${agreement.quote.lead.customer.last_name} - ${formatCurrency(agreement.quote.monthly_rental_rate || 0)}/month`
                            : `Agreement ${agreement.id}`
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
              name="invoice_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select 
                    onValueChange={handleInvoiceTypeChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(INVOICE_TYPE).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value === 'SETUP' ? 'Setup Fee' : 
                           value === 'RECURRING' ? 'Recurring Payment' : 
                           value === 'ONE_TIME' ? 'One-Time Payment' : 
                           value}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
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
              name="paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === 'true')} 
                    defaultValue={field.value ? 'true' : 'false'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">Unpaid</SelectItem>
                      <SelectItem value="true">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field}
                      value={field.value ?? ''}
                      disabled={!form.watch('paid')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {clientSecret && (
          <div className="mt-6 p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Set Up Subscription</h3>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentElement />
              <Button 
                type="button" 
                onClick={handlePaymentSetup}
                className="mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Setting up..." : "Set Up Subscription"}
              </Button>
            </Elements>
          </div>
        )}

        {paymentLink && (
          <div className="mt-6">
            <Alert>
              <AlertTitle>Payment Link Generated</AlertTitle>
              <AlertDescription>
                <a 
                  href={paymentLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Click here to complete the payment
                </a>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Invoice" : "Create Invoice"}
        </Button>
      </form>
    </Form>
  )
} 