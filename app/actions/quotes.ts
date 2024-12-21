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
>

export async function createQuote(data: QuoteData) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('quotes')
      .insert(data)

    if (error) throw error

    revalidatePath('/quotes')
    return { success: true }
  } catch (error) {
    console.error('Error creating quote:', error)
    return { error: 'Failed to create quote' }
  }
}

export async function updateQuote(id: string, data: QuoteData): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('quotes')
      .update(data)
      .match({ id })

    if (error) throw error

    revalidatePath('/quotes')
    redirect('/quotes')
  } catch (error) {
    console.error('Error updating quote:', error)
    throw new Error('Failed to update quote')
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
        lead:leads(
          customer:customers(
            first_name,
            last_name,
            email,
            phone
          ),
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

    const customerEmail = quote.lead?.customer?.email
    if (!customerEmail) {
      throw new Error('Customer email not found')
    }

    const customerName = `${quote.lead?.customer?.first_name} ${quote.lead?.customer?.last_name}`
    const customerPhone = quote.lead?.customer?.phone
    
    // Get address components
    const address = quote.lead?.addresses?.[0]
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