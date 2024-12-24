import { createClient } from "@/utils/supabase/server"
import { type Tables } from "@/types/database.types"

// Define complete types that match component expectations
type Quote = Pick<Tables<"quotes">, 
  | "id"
  | "address_id"
  | "customer_id"
  | "lead_id"
  | "monthly_rental_rate"
  | "setup_fee"
  | "rental_type"
  | "quote_status"
  | "created_at"
  | "updated_at"
  | "flat_rate"
  | "install_date"
  | "removal_date"
  | "valid_until"
  | "notes"
>

type Agreement = Pick<Tables<"agreements">,
  | "id"
  | "address_id"
  | "customer_id"
  | "quote_id"
  | "agreement_status"
  | "created_at"
  | "signed_date"
  | "updated_at"
  | "notes"
>

type Installation = Pick<Tables<"installations">,
  | "id"
  | "agreement_id"
  | "installation_date"
  | "installation_photos"
  | "installed_by"
  | "sign_off"
  | "created_at"
  | "updated_at"
>

// Match the type expected by SubscriptionsTable
type Subscription = Tables<"subscriptions"> & {
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
  quotes: Quote[]
  agreements: (Agreement & {
    quote: Quote | null
    installation: Installation[]
    invoices: Tables<"invoices">[]
    subscriptions: Subscription[]
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
      ),
      agreements(
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

  return customer as CustomerWithDetails
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