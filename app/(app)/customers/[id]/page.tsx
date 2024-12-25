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
import { Edit } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { Notes } from "@/components/customer/notes-drawer"
import { CustomerHeader } from "@/components/customer/customer-header"

interface CustomerPageProps {
  params: {
    id: string
  }
}

export default async function CustomerPage({ params }: CustomerPageProps) {
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

  const breadcrumbs = [
    { label: "Customers", href: "/customers" },
    { label: `${customer.first_name} ${customer.last_name}` }
  ]

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <CustomerHeader 
        customer={customer}
        actions={
          <Link href={`/customers/${customer.id}/edit`}>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <JobProgress 
        lead={latestLead}
        quote={latestQuote}
        agreement={latestAgreement}
        installation={latestInstallation}
        customer={customer}
      />

      <Notes customerId={customer.id} />

      <div className="overflow-hidden">
        <Tabs defaultValue="leads">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
            <TabsTrigger value="installations">Installations</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          <div className="mt-4 overflow-x-auto">
            <TabsContent value="leads">
              <LeadsTable data={customer.leads || []} />
            </TabsContent>
            <TabsContent value="quotes">
              <QuotesTable data={customer.quotes || []} />
            </TabsContent>
            <TabsContent value="agreements">
              <AgreementsTable data={customer.agreements || []} />
            </TabsContent>
            <TabsContent value="installations">
              <InstallationsTable data={installations} />
            </TabsContent>
            <TabsContent value="invoices">
              <InvoicesTable data={invoices} />
            </TabsContent>
            <TabsContent value="subscriptions">
              <SubscriptionsTable data={subscriptions} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
} 