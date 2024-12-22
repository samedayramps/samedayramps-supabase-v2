"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { type Tables } from "@/types/database.types"

export async function deleteLead(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .match({ id })

    if (error) throw error

    revalidatePath('/leads')
  } catch (error) {
    console.error('Error deleting lead:', error)
    throw new Error('Failed to delete lead')
  }
}

type LeadData = {
  customer: {
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    address: {
      formatted_address: string
      street_number: string | null
      street_name: string | null
      city: string | null
      state: string | null
      postal_code: string | null
      country: string | null
      lat: number | null
      lng: number | null
      place_id: string | null
    }
  }
  timeline: string
  knows_length: 'YES' | 'NO'
  ramp_length: number | null
  knows_duration: 'YES' | 'NO'
  rental_months: number | null
  mobility_types: string[]
  status: string
  notes: string | null
}

export async function createLead(data: LeadData): Promise<void> {
  const supabase = await createClient()
  
  try {
    // First create the customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        first_name: data.customer.first_name,
        last_name: data.customer.last_name,
        email: data.customer.email || null,
        phone: data.customer.phone || null,
      })
      .select()
      .single()

    if (customerError) throw customerError

    // Then create the lead with the customer_id
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        customer_id: customer.id,
        status: data.status,
        mobility_type: data.mobility_types?.length ? data.mobility_types.join(', ') : null,
        ramp_length: data.knows_length === 'YES' ? data.ramp_length || null : null,
        timeline: data.timeline,
        rental_duration: data.knows_duration === 'YES' ? `${data.rental_months} MONTHS` : null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (leadError) throw leadError

    // Create address with all components
    if (data.customer.address) {
      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          formatted_address: data.customer.address.formatted_address,
          street_number: data.customer.address.street_number,
          street_name: data.customer.address.street_name,
          city: data.customer.address.city,
          state: data.customer.address.state,
          postal_code: data.customer.address.postal_code,
          country: data.customer.address.country,
          lat: data.customer.address.lat,
          lng: data.customer.address.lng,
          place_id: data.customer.address.place_id,
          customer_id: customer.id,
        })

      if (addressError) throw addressError
    }

    revalidatePath('/leads')
  } catch (error) {
    console.error('Error creating lead:', error)
    throw new Error('Failed to create lead')
  }
}

type UpdateLeadData = Pick<
  Tables<"leads">,
  | "status" 
  | "mobility_type" 
  | "ramp_length" 
  | "timeline" 
  | "rental_duration"
  | "notes"
>

export async function updateLead(id: string, data: UpdateLeadData): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('leads')
      .update(data)
      .match({ id })

    if (error) throw error

    revalidatePath('/leads')
    redirect('/leads')
  } catch (error) {
    console.error('Error updating lead:', error)
    throw new Error('Failed to update lead')
  }
} 