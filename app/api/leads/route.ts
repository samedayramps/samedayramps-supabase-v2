import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for the incoming lead data
const leadSchema = z.object({
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
  timeline: z.enum(['ASAP', 'THIS_WEEK', 'THIS_MONTH', 'FLEXIBLE']),
  knows_length: z.enum(['YES', 'NO']),
  ramp_length: z.number().nullable(),
  knows_duration: z.enum(['YES', 'NO']),
  rental_months: z.number().min(1).max(60).nullable(),
  mobility_types: z.array(z.string()).optional().default([]),
  notes: z.string().nullable(),
})

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json()
    const validatedData = leadSchema.parse(body)
    
    const supabase = await createClient()

    // Create customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        first_name: validatedData.customer.first_name,
        last_name: validatedData.customer.last_name,
        email: validatedData.customer.email,
        phone: validatedData.customer.phone,
      })
      .select()
      .single()

    if (customerError) {
      throw customerError
    }

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        customer_id: customer.id,
        status: 'NEW',
        mobility_type: validatedData.mobility_types?.length 
          ? validatedData.mobility_types.join(', ') 
          : null,
        ramp_length: validatedData.knows_length === 'YES' 
          ? validatedData.ramp_length 
          : null,
        timeline: validatedData.timeline,
        rental_duration: validatedData.knows_duration === 'YES' 
          ? `${validatedData.rental_months} MONTHS` 
          : null,
        notes: validatedData.notes,
      })
      .select()
      .single()

    if (leadError) {
      throw leadError
    }

    // Create address
    if (validatedData.customer.address) {
      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          ...validatedData.customer.address,
          customer_id: customer.id,
        })

      if (addressError) {
        throw addressError
      }
    }

    return NextResponse.json(
      { message: 'Lead created successfully', leadId: lead.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
} 