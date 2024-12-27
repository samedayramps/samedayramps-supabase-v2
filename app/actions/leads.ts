"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { type Database, type Json } from "@/types/database.types"
import { z } from "zod"

// Validation schema for the form
const LeadFormSchema = z.object({
  customer: z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email().nullable(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").nullable(),
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
  timeline: z.string().nullable(),
  status: z.string().default('NEW'),
  notes: z.string().nullable(),
})

export type State = {
  errors?: {
    customer?: string[];
    timeline?: string[];
    status?: string[];
    notes?: string[];
  };
  message?: string | null;
};

export async function createLead(prevState: State, formData: FormData) {
  const validatedFields = LeadFormSchema.safeParse({
    customer: {
      first_name: formData.get('customer.first_name'),
      last_name: formData.get('customer.last_name'),
      email: formData.get('customer.email'),
      phone: formData.get('customer.phone'),
      address: {
        formatted_address: formData.get('customer.address.formatted_address'),
        street_number: formData.get('customer.address.street_number'),
        street_name: formData.get('customer.address.street_name'),
        city: formData.get('customer.address.city'),
        state: formData.get('customer.address.state'),
        postal_code: formData.get('customer.address.postal_code'),
        country: formData.get('customer.address.country'),
        lat: parseFloat(formData.get('customer.address.lat')?.toString() || ''),
        lng: parseFloat(formData.get('customer.address.lng')?.toString() || ''),
        place_id: formData.get('customer.address.place_id'),
      },
    },
    timeline: formData.get('timeline'),
    status: formData.get('status'),
    notes: formData.get('notes'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Lead.',
    }
  }

  const supabase = await createClient()
  
  try {
    const { customer, timeline, status, notes } = validatedFields.data

    // First create the customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
      })
      .select()
      .single()

    if (customerError) throw customerError

    // Then create the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        customer_id: customerData.id,
        status,
        timeline,
        notes: notes ? JSON.parse(notes) as Json : null,
      })
      .select()
      .single()

    if (leadError) throw leadError

    // Create address
    if (customer.address) {
      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          ...customer.address,
          customer_id: customerData.id,
        })

      if (addressError) throw addressError
    }

    revalidatePath('/leads')
    redirect('/leads')
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Lead.',
    }
  }
}

export async function updateLead(id: string, data: {
  status: string
  timeline: string | null
  notes: string | null
}) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('leads')
      .update({
        status: data.status,
        timeline: data.timeline,
        notes: data.notes ? JSON.parse(data.notes) as Json : null,
      })
      .match({ id })

    if (error) throw error

    revalidatePath('/leads')
    redirect('/leads')
  } catch (error) {
    throw new Error('Failed to update lead')
  }
}

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
    throw new Error('Failed to delete lead')
  }
}

export async function getLeads() {
  const supabase = await createClient()

  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        customer:customers(
          id,
          first_name,
          last_name,
          email,
          phone,
          addresses(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return leads
  } catch (error) {
    throw new Error('Failed to fetch leads')
  }
} 