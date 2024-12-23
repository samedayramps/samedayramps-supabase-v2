import { createClient } from "@/utils/supabase/server"
import { type Tables } from "@/types/database.types"

export type CustomerWithDetails = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string | null
  addresses: Tables<"addresses">[]
  leads: Tables<"leads">[]
  quotes: (Tables<"quotes"> & {
    lead: {
      customer: Pick<Tables<"customers">, 
        | "id"
        | "first_name" 
        | "last_name"
      > | null
    } | null
  })[]
  agreements: (Tables<"agreements"> & {
    quote: {
      monthly_rental_rate: number
      setup_fee: number
      rental_type: string
      lead: {
        customer: Pick<Tables<"customers">, 
          | "id"
          | "first_name" 
          | "last_name" 
          | "email"
        > | null
      } | null
    } | null
    installation: Tables<"installations">[]
    invoices: Tables<"invoices">[]
    subscriptions: (Tables<"subscriptions"> & {
      agreement: {
        quote: {
          monthly_rental_rate: number
          rental_type: string
          lead: {
            customer: Pick<Tables<"customers">, 
              | "id"
              | "first_name" 
              | "last_name" 
              | "email"
            > | null
          } | null
        } | null
      } | null
    })[]
  })[]
}

export async function getCustomerWithDetails(customerId: string) {
  const supabase = await createClient()
  
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select(`
      *,
      addresses(*),
      leads(*),
      quotes(
        *,
        lead:leads(
          customer:customers(
            id,
            first_name,
            last_name
          )
        )
      ),
      agreements(
        *,
        quote:quotes(
          monthly_rental_rate,
          setup_fee,
          rental_type,
          lead:leads(
            customer:customers(
              id,
              first_name,
              last_name,
              email
            )
          )
        ),
        installation:installations(*),
        invoices(*),
        subscriptions(
          *,
          agreement:agreements(
            quote:quotes(
              monthly_rental_rate,
              rental_type,
              lead:leads(
                customer:customers(
                  id,
                  first_name,
                  last_name,
                  email
                )
              )
            )
          )
        )
      )
    `)
    .eq('id', customerId)
    .single()

  if (customerError) {
    throw new Error(`Error fetching customer: ${customerError.message}`)
  }

  if (!customer) {
    return null
  }

  return customer as unknown as CustomerWithDetails
}

export function extractRelatedData(customer: CustomerWithDetails) {
  // Get the most recent job data
  const latestLead = customer.leads?.[0]
  const latestQuote = customer.quotes?.[0]
  const latestAgreement = customer.agreements?.[0]
  const latestInstallation = latestAgreement?.installation?.[0]

  // Extract all installations from agreements
  const installations = customer.agreements
    .flatMap(agreement => agreement.installation || [])

  // Extract all invoices from agreements
  const invoices = customer.agreements
    .flatMap(agreement => agreement.invoices || [])

  // Extract all subscriptions from agreements
  const subscriptions = customer.agreements
    .flatMap(agreement => agreement.subscriptions || [])

  return {
    latestLead,
    latestQuote,
    latestAgreement,
    latestInstallation,
    installations,
    invoices,
    subscriptions
  }
} 