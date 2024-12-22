"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { type Tables } from "@/types/database.types"
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function cancelSubscription(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  try {
    // Get the subscription details
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('id', id)
      .single()

    if (fetchError || !subscription?.stripe_subscription_id) {
      throw new Error('Subscription not found')
    }

    // Cancel the subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.cancel(
      subscription.stripe_subscription_id
    )

    // Update the subscription status in the database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: stripeSubscription.status,
        canceled_at: new Date(stripeSubscription.canceled_at! * 1000).toISOString(),
        ended_at: stripeSubscription.ended_at 
          ? new Date(stripeSubscription.ended_at * 1000).toISOString()
          : null
      })
      .eq('id', id)

    if (updateError) throw updateError

    revalidatePath('/subscriptions')
    return { success: true }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cancel subscription' 
    }
  }
}

export async function updateSubscription(
  id: string, 
  data: Partial<Tables<"subscriptions">>
): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update(data)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/subscriptions')
    redirect('/subscriptions')
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw new Error('Failed to update subscription')
  }
}

// This function is called by the Stripe webhook handler when subscription-related events occur
export async function handleSubscriptionWebhook(
  event: Stripe.Event
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        
        // Get the agreement ID from the subscription metadata
        const agreementId = subscription.metadata.agreementId
        if (!agreementId) {
          throw new Error('Agreement ID not found in subscription metadata')
        }

        // Update or create subscription record
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            agreement_id: agreementId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at: subscription.cancel_at 
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            trial_start: subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            metadata: subscription.metadata
          }, {
            onConflict: 'stripe_subscription_id'
          })

        if (upsertError) throw upsertError
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        
        // Update subscription status to canceled
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: deletedSubscription.status,
            canceled_at: new Date(deletedSubscription.canceled_at! * 1000).toISOString(),
            ended_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', deletedSubscription.id)

        if (updateError) throw updateError
        break
    }

    revalidatePath('/subscriptions')
    return { success: true }
  } catch (error) {
    console.error('Error handling subscription webhook:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to handle subscription webhook' 
    }
  }
} 