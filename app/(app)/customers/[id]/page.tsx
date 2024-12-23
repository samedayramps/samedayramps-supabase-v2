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
      <div className="grid gap-6 md:grid-cols-2">
        <CustomerInfo customer={customer} />
        <JobProgress 
          lead={latestLead}
          quote={latestQuote}
          agreement={latestAgreement}
          installation={latestInstallation}
        />
      </div>

      <Tabs defaultValue="leads" className="w-full">
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

      <div className="p-6 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(customer, null, 2)}
        </pre>
      </div>
    </div>
  )
} 