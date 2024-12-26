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

// Debug log environment variables (redacted for security)
console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + '...',
})

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  console.log('=== START POST REQUEST ===')
  console.log('Request headers:', Object.fromEntries(request.headers.entries()))
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  try {
    console.log('Request URL:', request.url)
    console.log('Request method:', request.method)

    const body = await request.json()
    console.log('Raw request body:', JSON.stringify(body, null, 2))

    // Move validation outside of nested try block
    const validatedData = leadSchema.parse(body)
    console.log('Validation successful. Validated data:', JSON.stringify(validatedData, null, 2))
    
    console.log('Attempting to create customer...')
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
      console.error('Customer creation error:', {
        message: customerError.message,
        details: customerError.details,
        hint: customerError.hint,
        code: customerError.code
      })
      throw customerError
    }

    console.log('Customer created successfully:', JSON.stringify(customer, null, 2))

    console.log('Attempting to create lead...')
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
      console.error('Lead creation error:', {
        message: leadError.message,
        details: leadError.details,
        hint: leadError.hint,
        code: leadError.code
      })
      throw leadError
    }

    console.log('Lead created successfully:', JSON.stringify(lead, null, 2))
    console.log('=== END POST REQUEST - SUCCESS ===')

    return NextResponse.json(
      { 
        message: 'Lead created successfully', 
        leadId: lead.id,
        customer: customer.id 
      },
      { status: 201, headers }
    )
  } catch (error) {
    console.error('=== END POST REQUEST - ERROR ===')
    
    // Handle Zod validation errors specifically
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors
        },
        { status: 400, headers }
      )
    }

    console.error('Final error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to create lead', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: error?.constructor?.name
      },
      { status: 500, headers }
    )
  }
}

export async function OPTIONS(request: Request) {
  console.log('OPTIONS request received')
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 