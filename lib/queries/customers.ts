'use server'

import { createClient } from "@/utils/supabase/server"
import { type Tables } from "@/types/database.types"

export async function getCustomerWithDetails(id: string) {
  const supabase = createClient()

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select(`
      *,
      addresses (
        *
      ),
      leads (
        *
      )
    `)
    .eq("id", id)
    .single()

  if (customerError) {
    throw new Error(`Error fetching customer: ${customerError.message}`)
  }

  const lead = customer?.leads?.[0] || null

  return {
    customer,
    lead
  }
}

export async function getCustomers() {
  const supabase = createClient()

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select(`
      *,
      addresses (
        *
      ),
      leads (
        *
      )
    `)
    .order("created_at", { ascending: false })

  if (customersError) {
    throw new Error(`Error fetching customers: ${customersError.message}`)
  }

  return customers
} 