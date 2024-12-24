import { CustomerInfo } from "@/components/customer/customer-info"
import { JobProgress } from "@/components/customer/job-progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadsTable } from "@/components/tables/leads-table"
import { QuotesTable } from "@/components/tables/quotes-table"
import { AgreementsTable } from "@/components/tables/agreements-table"
import { InstallationsTable } from "@/components/tables/installations-table"
import { InvoicesTable } from "@/components/tables/invoices-table"
import { SubscriptionsTable } from "@/components/tables/subscriptions-table"
import { notFound } from "next/navigation"
import { getCustomerWithDetails, extractRelatedData } from "@/lib/queries/customer"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import Link from "next/link"

export default async function CustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await getCustomerWithDetails(params.id)

  if (!customer) {
    notFound()
  }

  const {
    latestLead,
    latestQuote,
    latestAgreement,
    latestInstallation,
    installations,
    invoices,
    subscriptions
  } = extractRelatedData(customer)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Details</h1>
        <Link href={`/customers/${customer.id}/call`}>
          <Button>
            <Phone className="h-4 w-4 mr-2" />
            Call Customer
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CustomerInfo customer={customer} />
        <JobProgress 
          lead={latestLead}
          quote={latestQuote}
          agreement={latestAgreement}
          installation={latestInstallation}
          customer={customer}
        />
      </div>

      <Tabs defaultValue="leads" className="mt-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="installations">Installations</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="leads" className="mt-6">
          <LeadsTable data={customer.leads || []} />
        </TabsContent>
        <TabsContent value="quotes" className="mt-6">
          <QuotesTable data={customer.quotes || []} />
        </TabsContent>
        <TabsContent value="agreements" className="mt-6">
          <AgreementsTable data={customer.agreements || []} />
        </TabsContent>
        <TabsContent value="installations" className="mt-6">
          <InstallationsTable data={installations} />
        </TabsContent>
        <TabsContent value="invoices" className="mt-6">
          <InvoicesTable data={invoices} />
        </TabsContent>
        <TabsContent value="subscriptions" className="mt-6">
          <SubscriptionsTable data={subscriptions} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 