"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { type Tables } from "@/types/database.types"
import { Resend } from 'resend'
import QuoteEmail from '@/emails/quote-email'
import { render } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function deleteQuote(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .match({ id })

    if (error) throw error

    revalidatePath('/quotes')
  } catch (error) {
    console.error('Error deleting quote:', error)
    throw new Error('Failed to delete quote')
  }
}

type QuoteData = Pick<
  Tables<"quotes">,
  | "lead_id"
  | "monthly_rental_rate"
  | "setup_fee"
  | "quote_status"
  | "valid_until"
  | "notes"
  | "rental_type"
>

export async function createQuote(data: QuoteData) {
  const supabase = await createClient()
  
  try {
    // Get the customer_id and their address through the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        customer_id,
        customer:customers (
          addresses (
            id
          )
        )
      `)
      .eq('id', data.lead_id)
      .single()

    if (leadError) throw leadError
    if (!lead.customer_id) throw new Error('Customer ID not found for lead')
    if (!lead.customer?.addresses?.[0]?.id) throw new Error('Address not found for customer')

    // Add customer_id and address_id to the quote data
    const quoteData = {
      ...data,
      customer_id: lead.customer_id,
      address_id: lead.customer.addresses[0].id
    }

    const { error } = await supabase
      .from('quotes')
      .insert(quoteData)

    if (error) throw error

    revalidatePath('/quotes')
    return { success: true }
  } catch (error) {
    console.error('Error creating quote:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create quote' }
  }
}

export async function updateQuote(id: string, data: QuoteData): Promise<void> {
  const supabase = await createClient()

  try {
    // Get the customer_id and their address through the lead if it has changed
    if (data.lead_id) {
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select(`
          customer_id,
          customer:customers (
            addresses (
              id
            )
          )
        `)
        .eq('id', data.lead_id)
        .single()

      if (leadError) throw leadError
      if (!lead.customer_id) throw new Error('Customer ID not found for lead')
      if (!lead.customer?.addresses?.[0]?.id) throw new Error('Address not found for customer')

      // Update the quote data with new customer_id and address_id
      const quoteData = {
        ...data,
        customer_id: lead.customer_id,
        address_id: lead.customer.addresses[0].id
      }

      const { error } = await supabase
        .from('quotes')
        .update(quoteData)
        .match({ id })

      if (error) throw error
    } else {
      // If lead_id hasn't changed, just update the quote data
      const { error } = await supabase
        .from('quotes')
        .update(data)
        .match({ id })

      if (error) throw error
    }

    revalidatePath('/quotes')
    redirect('/quotes')
  } catch (error) {
    console.error('Error updating quote:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to update quote')
  }
}

export async function sendQuote(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  try {
    // Fetch the quote with customer details and address
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(
          first_name,
          last_name,
          email,
          phone,
          addresses(
            formatted_address,
            street_number,
            street_name,
            city,
            state,
            postal_code
          )
        )
      `)
      .eq('id', id)
      .single()

    if (quoteError || !quote) {
      throw new Error('Quote not found')
    }

    // Check if quote can be sent
    if (quote.quote_status === 'ACCEPTED' || quote.quote_status === 'REJECTED') {
      throw new Error(`Cannot send quote in ${quote.quote_status.toLowerCase()} status`)
    }

    const customerEmail = quote.customer?.email
    if (!customerEmail) {
      throw new Error('Customer email not found')
    }

    const customerName = `${quote.customer?.first_name} ${quote.customer?.last_name}`
    const customerPhone = quote.customer?.phone ?? null

    // Get address components
    const address = quote.customer?.addresses?.[0]
    if (!address) {
      throw new Error('Installation address not found')
    }

    // Format address with all components
    const installAddress = address.formatted_address || [
      address.street_number,
      address.street_name,
      address.city,
      address.state,
      address.postal_code
    ].filter(Boolean).join(' ')

    // Create the email content
    const emailContent = QuoteEmail({
      customerName,
      customerEmail,
      customerPhone,
      installAddress,
      monthlyRate: quote.monthly_rental_rate || 0,
      setupFee: quote.setup_fee || 0,
      validUntil: quote.valid_until || new Date().toISOString(),
      rentalType: quote.rental_type as 'ONE_TIME' | 'RECURRING',
      notes: quote.notes as string,
      quoteId: quote.id,
    })

    // Send the email
    await resend.emails.send({
      from: 'Same Day Ramps <quotes@samedayramps.com>',
      to: customerEmail,
      subject: `${quote.quote_status === 'SENT' ? 'Updated ' : ''}Quote for ${customerName}`,
      react: emailContent,
    })

    // Only update status if it's not already sent
    if (quote.quote_status !== 'SENT') {
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ quote_status: 'SENT' })
        .eq('id', id)

      if (updateError) throw updateError
    }

    revalidatePath('/quotes')
    return { success: true }
  } catch (error) {
    console.error('Error sending quote:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send quote' 
    }
  }
} 