import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { type Database } from '@/types/database.types'

// Validation schema for the incoming lead data
const leadSchema = z.object({
  customer: z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
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
  timeline: z.enum(['ASAP', 'THIS_WEEK', 'THIS_MONTH', 'FLEXIBLE']).nullable(),
  notes: z.string().nullable(),
})

export async function POST(request: Request) {
  try {
    // Check API key
    const headersList = headers()
    const apiKey = headersList.get('Authorization')?.replace('Bearer ', '')
    
    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Parse and validate the request body
    const body = await request.json()
    const validatedData = leadSchema.parse(body)
    
    // Create Supabase client with service role key
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        first_name: validatedData.customer.first_name,
        last_name: validatedData.customer.last_name,
        email: validatedData.customer.email || null,
        phone: validatedData.customer.phone || null,
      })
      .select()
      .single()

    if (customerError) throw customerError

    // Create address
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .insert({
        customer_id: customer.id,
        formatted_address: validatedData.customer.address.formatted_address,
        street_number: validatedData.customer.address.street_number || null,
        street_name: validatedData.customer.address.street_name || null,
        city: validatedData.customer.address.city || null,
        state: validatedData.customer.address.state || null,
        postal_code: validatedData.customer.address.postal_code || null,
        country: validatedData.customer.address.country || null,
        lat: validatedData.customer.address.lat || null,
        lng: validatedData.customer.address.lng || null,
        place_id: validatedData.customer.address.place_id || null,
      })
      .select()
      .single()

    if (addressError) throw addressError

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        customer_id: customer.id,
        status: 'NEW',
        timeline: validatedData.timeline,
        notes: validatedData.notes ? { content: validatedData.notes } : null,
      })
      .select()
      .single()

    if (leadError) throw leadError

    return NextResponse.json(
      { 
        success: true,
        leadId: lead.id,
      },
      { 
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  } catch (error) {
    console.error('Error creating lead:', error)
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
} 