import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  )
}

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
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Middleware to bypass auth for now during testing
export async function middleware(request: Request) {
  return NextResponse.next()
}

export async function POST(request: Request) {
  console.log('=== START POST REQUEST ===')
  
  // Get the origin of the request
  const origin = request.headers.get('origin') || '*'
  console.log('Request origin:', origin)
  
  // Define CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow all origins during testing
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  try {
    const body = await request.json()
    console.log('Raw request body:', JSON.stringify(body, null, 2))

    // Validate the data
    const validatedData = leadSchema.parse(body)
    console.log('Validation successful:', validatedData)

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
      console.error('Customer creation error:', customerError)
      throw customerError
    }

    // Create lead
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
      console.error('Lead creation error:', leadError)
      throw leadError
    }

    return NextResponse.json(
      { message: 'Lead created successfully', leadId: lead.id },
      { status: 201, headers }
    )
  } catch (error: unknown) {
    console.error('Error creating lead:', error)
    
    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400, headers }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers }
    )
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow all origins during testing
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Configure which methods are allowed
export const config = {
  matcher: '/api/leads',
} 