import { createClient } from "@/utils/supabase/server"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

async function getUpcomingInstallations() {
  const supabase = await createClient()

  const { data: installations } = await supabase
    .from('installations')
    .select(`
      id,
      installation_date,
      sign_off,
      agreement:agreements (
        quote:quotes (
          lead:leads (
            customer:customers (
              first_name,
              last_name
            ),
            addresses (
              formatted_address
            )
          )
        )
      )
    `)
    .eq('sign_off', false)
    .gte('installation_date', new Date().toISOString())
    .order('installation_date', { ascending: true })
    .limit(5)

  return installations || []
}

export async function UpcomingInstallations() {
  const installations = await getUpcomingInstallations()

  return (
    <div className="space-y-8">
      {installations.map((installation) => {
        const customer = installation.agreement?.quote?.lead?.customer
        const address = installation.agreement?.quote?.lead?.addresses?.[0]

        return (
          <div key={installation.id} className="flex items-center">
            <div className="space-y-1">
              <Link 
                href={`/installations/${installation.id}`}
                className="font-medium hover:underline"
              >
                {customer?.first_name} {customer?.last_name}
              </Link>
              <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                <span>{formatDate(installation.installation_date!)}</span>
                <span>•</span>
                <span className="truncate max-w-[200px]">
                  {address?.formatted_address}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 