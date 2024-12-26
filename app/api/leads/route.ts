import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const leadSchema = z.object({
  customer: z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
  timeline: z.string(),
  notes: z.string(),
})

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key instead of anon key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json()
    const validatedData = leadSchema.parse(body)
    
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

    // Create lead with minimal data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        customer_id: customer.id,
        status: 'NEW',
        timeline: validatedData.timeline,
        notes: validatedData.notes,
      })
      .select()
      .single()

    if (leadError) {
      throw leadError
    }

    return NextResponse.json(
      { message: 'Lead created successfully', leadId: lead.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 