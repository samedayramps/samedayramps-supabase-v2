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
import { Mail, Phone, MapPin, Edit } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { Notes } from "@/components/customer/notes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CopyButton } from "@/components/common/copy-button"

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

  const address = customer.addresses?.[0]
  const breadcrumbs = [
    { label: "Customers", href: "/customers" },
    { label: `${customer.first_name} ${customer.last_name}` }
  ]

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl truncate">
          {`${customer.first_name} ${customer.last_name}`}
        </h1>

        <div className="flex items-center gap-2">
          {customer.email && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex items-center gap-2">
                  <a 
                    href={`mailto:${customer.email}`}
                    className="text-sm hover:text-foreground transition-colors"
                  >
                    {customer.email}
                  </a>
                  <CopyButton value={customer.email} />
                </div>
              </PopoverContent>
            </Popover>
          )}

          {customer.phone && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex items-center gap-2">
                  <a 
                    href={`tel:${customer.phone}`}
                    className="text-sm hover:text-foreground transition-colors"
                  >
                    {customer.phone}
                  </a>
                  <CopyButton value={customer.phone} />
                </div>
              </PopoverContent>
            </Popover>
          )}

          {address && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <div>
                      {[
                        address.street_number,
                        address.street_name,
                      ].filter(Boolean).join(' ')}
                    </div>
                    <div className="text-muted-foreground">
                      {[
                        address.city,
                        address.state,
                        address.postal_code
                      ].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <CopyButton value={address.formatted_address} />
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Link href={`/customers/${customer.id}/edit`}>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

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