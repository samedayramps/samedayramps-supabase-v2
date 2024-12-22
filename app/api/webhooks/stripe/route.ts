import { NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/app/actions/invoices'
import { handleSubscriptionWebhook } from '@/app/actions/subscriptions'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: Request) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return new NextResponse('Missing signature', { status: 401 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      return new NextResponse(
        err instanceof Error ? err.message : 'Invalid signature',
        { status: 401 }
      )
    }

    // Handle subscription events
    if (event.type.startsWith('customer.subscription.')) {
      const result = await handleSubscriptionWebhook(event)
      if (!result.success) {
        throw new Error(result.error)
      }
      return NextResponse.json({ success: true })
    }

    // Handle invoice and payment events
    const result = await handleStripeWebhook(event)
    
    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    )
  }
} 