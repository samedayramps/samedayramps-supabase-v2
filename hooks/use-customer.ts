import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { type Database } from "@/types/database.types"

type Customer = Database["public"]["Tables"]["customers"]["Row"] & {
  addresses: Database["public"]["Tables"]["addresses"]["Row"][]
}

export function useCustomer(customerId: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCustomer() {
      if (!customerId) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("customers")
          .select(`
            *,
            addresses(*)
          `)
          .eq("id", customerId)
          .single()

        if (error) throw error
        setCustomer(data)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId])

  return { customer, loading, error }
} 