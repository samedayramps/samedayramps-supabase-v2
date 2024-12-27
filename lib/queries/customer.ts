import { createClient } from "@/utils/supabase/server"
import { type Tables } from "@/types/database.types"

// Define base types for the main entities
type CustomerBasicInfo = Pick<Tables<"customers">, 
  | "id" 
  | "first_name" 
  | "last_name" 
  | "email"
>

type QuoteBasicInfo = Pick<Tables<"quotes">,
  | "monthly_rental_rate"
  | "rental_type"
>

// Define the exact type that the SubscriptionsTable component expects
type SubscriptionDetails = {
  agreement: {
    quote: {
      monthly_rental_rate: number
      rental_type: string
      lead: {
        customer: {
          id: string
          first_name: string
          last_name: string
          email: string | null
        } | null
      } | null
    } | null
  } | null
} & Tables<"subscriptions">

// Separate function to transform subscription data into the expected format
function transformSubscriptionData(rawData: any): SubscriptionDetails {
  return {
    ...rawData,
    agreement: rawData.agreement ? {
      quote: rawData.agreement.quote ? {
        monthly_rental_rate: rawData.agreement.quote.monthly_rental_rate,
        rental_type: rawData.agreement.quote.rental_type,
        lead: rawData.agreement.quote.lead ? {
          customer: rawData.agreement.quote.lead.customer
        } : null
      } : null
    } : null
  }
}

// Split the query into separate functions to reduce complexity
async function fetchCustomerBasicInfo(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("customers")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      created_at,
      updated_at
    `)
    .eq('id', customerId)
    .single()

  if (error) throw new Error(`Error fetching customer: ${error.message}`)
  return data
}

async function fetchCustomerAddresses(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("addresses")
    .select('*')
    .eq('customer_id', customerId)

  if (error) throw new Error(`Error fetching addresses: ${error.message}`)
  return data
}

async function fetchCustomerLeads(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leads")
    .select('*')
    .eq('customer_id', customerId)

  if (error) throw new Error(`Error fetching leads: ${error.message}`)
  return data
}

async function fetchCustomerQuotes(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("quotes")
    .select(`
      id,
      address_id,
      customer_id,
      lead_id,
      monthly_rental_rate,
      setup_fee,
      rental_type,
      quote_status,
      created_at,
      updated_at,
      flat_rate,
      install_date,
      removal_date,
      valid_until,
      notes
    `)
    .eq('customer_id', customerId)

  if (error) throw new Error(`Error fetching quotes: ${error.message}`)
  return data
}

// Split subscription fetching into its own function with proper typing
async function fetchSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetails> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      agreement:agreements!inner(
        quote:quotes!inner(
          monthly_rental_rate,
          rental_type,
          lead:leads!inner(
            customer:customers(
              id,
              first_name,
              last_name,
              email
            )
          )
        )
      )
    `)
    .eq('id', subscriptionId)
    .single()

  if (error) throw new Error(`Error fetching subscription details: ${error.message}`)
  if (!data) throw new Error(`No subscription found with id: ${subscriptionId}`)
  
  return transformSubscriptionData(data)
}

async function fetchCustomerAgreements(customerId: string) {
  const supabase = createClient()
  
  // First, fetch agreements with minimal subscription data
  const { data: agreements, error: agreementsError } = await supabase
    .from("agreements")
    .select(`
      id,
      address_id,
      customer_id,
      quote_id,
      agreement_status,
      created_at,
      signed_date,
      updated_at,
      notes,
      quote:quotes(
        id,
        monthly_rental_rate,
        setup_fee,
        rental_type
      ),
      installation:installations(
        id,
        agreement_id,
        installation_date,
        installation_photos,
        installed_by,
        sign_off,
        created_at,
        updated_at
      ),
      invoices(*),
      subscriptions!inner(id)
    `)
    .eq('customer_id', customerId)

  if (agreementsError) throw new Error(`Error fetching agreements: ${agreementsError.message}`)
  if (!agreements) return []

  // Fetch subscription details in parallel and transform the data
  const agreementsWithDetails = await Promise.all(
    agreements.map(async (agreement) => {
      if (!agreement.subscriptions?.length) {
        return { ...agreement, subscriptions: [] }
      }

      const subscriptions = await Promise.all(
        agreement.subscriptions.map(sub => fetchSubscriptionDetails(sub.id))
      )

      return {
        ...agreement,
        subscriptions
      }
    })
  )

  return agreementsWithDetails
}

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
  quotes: Tables<"quotes">[]
  agreements: (Tables<"agreements"> & {
    quote: Pick<Tables<"quotes">, 
      | "id"
      | "monthly_rental_rate"
      | "setup_fee"
      | "rental_type"
    > | null
    installation: Tables<"installations">[]
    invoices: Tables<"invoices">[]
    subscriptions: SubscriptionDetails[]
  })[]
}

export async function getCustomerWithDetails(customerId: string): Promise<CustomerWithDetails | null> {
  try {
    // Fetch all data in parallel
    const [customer, addresses, leads, quotes, agreements] = await Promise.all([
      fetchCustomerBasicInfo(customerId),
      fetchCustomerAddresses(customerId),
      fetchCustomerLeads(customerId),
      fetchCustomerQuotes(customerId),
      fetchCustomerAgreements(customerId),
    ])

    if (!customer) return null

    return {
      ...customer,
      addresses,
      leads,
      quotes,
      agreements,
    }
  } catch (error) {
    console.error('Error fetching customer details:', error)
    throw error
  }
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