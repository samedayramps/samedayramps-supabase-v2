"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { type Tables } from "@/types/database.types"
import Stripe from 'stripe'
import { Resend } from 'resend'
import InvoiceEmail from '@/components/emails/invoice-email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .match({ id })

    if (error) throw error

    revalidatePath('/invoices')
  } catch (error) {
    console.error('Error deleting invoice:', error)
    throw new Error('Failed to delete invoice')
  }
}

type InvoiceData = Pick<
  Tables<"invoices">,
  | "agreement_id"
  | "invoice_type"
  | "amount"
  | "paid"
  | "payment_date"
>

export async function createInvoice(data: InvoiceData) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('invoices')
      .insert(data)

    if (error) throw error

    revalidatePath('/invoices')
    return { success: true }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { error: 'Failed to create invoice' }
  }
}

export async function updateInvoice(id: string, data: InvoiceData): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('invoices')
      .update(data)
      .match({ id })

    if (error) throw error

    revalidatePath('/invoices')
    redirect('/invoices')
  } catch (error) {
    console.error('Error updating invoice:', error)
    throw new Error('Failed to update invoice')
  }
}

type SendInvoiceResponse = 
  | { success: true; clientSecret: string; subscriptionId: string }
  | { success: true; paymentLink: string }
  | { success: false; error: string }

export async function sendInvoice(id: string): Promise<SendInvoiceResponse> {
  const supabase = await createClient()
  
  try {
    // Fetch the invoice with customer details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        agreement:agreements(
          quote:quotes(
            monthly_rental_rate,
            setup_fee,
            rental_type,
            lead:leads(
              customer:customers(
                first_name,
                last_name,
                email
              )
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found')
    }

    // Check if invoice can be sent
    if (invoice.paid) {
      throw new Error('Cannot send payment link for a paid invoice')
    }

    const customerEmail = invoice.agreement?.quote?.lead?.customer?.email
    if (!customerEmail) {
      throw new Error('Customer email not found')
    }

    const customerName = `${invoice.agreement?.quote?.lead?.customer?.first_name} ${invoice.agreement?.quote?.lead?.customer?.last_name}`

    // Create or get Stripe customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          agreementId: invoice.agreement_id,
        },
      })
    }

    // Handle different payment types
    if (invoice.invoice_type === 'RENTAL' && invoice.agreement?.quote?.rental_type === 'RECURRING') {
      // Create a subscription for recurring rental payments
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: Math.round(invoice.amount! * 100),
        recurring: {
          interval: 'month',
        },
        product_data: {
          name: `Monthly Rental - ${customerName}`,
          metadata: {
            agreementId: invoice.agreement_id,
          },
        },
      });

      // Create a subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id }],
        metadata: {
          invoiceId: invoice.id,
          agreementId: invoice.agreement_id,
        },
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Get the client secret for the initial payment
      const clientSecret = (subscription.latest_invoice as any).payment_intent.client_secret;

      // Send email with subscription setup link
      await resend.emails.send({
        from: 'Same Day Ramps <billing@samedayramps.com>',
        to: customerEmail,
        subject: `Set Up Your Monthly Rental Payment - ${customerName}`,
        react: InvoiceEmail({
          customerName,
          amount: invoice.amount!,
          invoiceType: invoice.invoice_type as 'RENTAL' | 'SETUP' | 'REMOVAL',
          isRecurring: true,
          paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}/setup?client_secret=${clientSecret}`,
        }),
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        clientSecret,
      };
    } else {
      // Handle one-time payments (setup fee, removal fee, or one-time rental)
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: Math.round(invoice.amount! * 100),
        product_data: {
          name: `${invoice.invoice_type === 'SETUP' ? 'Setup Fee' : 
                 invoice.invoice_type === 'RENTAL' ? 'One-Time Rental Payment' :
                 invoice.invoice_type === 'REMOVAL' ? 'Removal Fee' :
                 'Payment'} - ${customerName}`,
        },
      });

      // Create payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        payment_method_types: ['card'],
        metadata: {
          invoiceId: invoice.id,
          customerId: customer.id,
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}/success`,
          },
        },
      });

      // Send email with payment link
      await resend.emails.send({
        from: 'Same Day Ramps <billing@samedayramps.com>',
        to: customerEmail,
        subject: `Payment Required - ${customerName}`,
        react: InvoiceEmail({
          customerName,
          amount: invoice.amount!,
          invoiceType: invoice.invoice_type as 'RENTAL' | 'SETUP' | 'REMOVAL',
          isRecurring: false,
          paymentUrl: paymentLink.url,
        }),
      });

      return { 
        success: true,
        paymentLink: paymentLink.url,
      };
    }

    revalidatePath('/invoices')
  } catch (error) {
    console.error('Error sending invoice:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send invoice' 
    }
  }
}

// Update webhook handler to handle subscription events
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const invoiceId = paymentIntent.metadata.invoiceId

        if (!invoiceId) {
          throw new Error('Invoice ID not found in payment metadata')
        }

        // Update invoice status
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ 
            paid: true,
            payment_date: new Date().toISOString(),
          })
          .eq('id', invoiceId)

        if (updateError) throw updateError
        break

      case 'invoice.paid':
        const stripeInvoice = event.data.object as Stripe.Invoice
        const subscriptionId = stripeInvoice.subscription
        
        if (!stripeInvoice.metadata) {
          throw new Error('No metadata found in Stripe invoice')
        }
        
        const agreementId = stripeInvoice.metadata.agreementId
        if (!agreementId) {
          throw new Error('Agreement ID not found in subscription metadata')
        }

        // Create a new invoice record for the subscription payment
        const { error: insertError } = await supabase
          .from('invoices')
          .insert({
            agreement_id: agreementId,
            invoice_type: 'RENTAL',
            amount: stripeInvoice.amount_paid / 100, // Convert from cents
            paid: true,
            payment_date: new Date().toISOString(),
          })

        if (insertError) throw insertError
        break

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        // Handle subscription cancellation
        // You might want to update the agreement status or take other actions
        break
    }

    revalidatePath('/invoices')
    return { success: true }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to handle Stripe webhook' 
    }
  }
} 