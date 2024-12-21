import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { DollarSign, Users, FileText, Wrench } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { RecentLeads } from "@/components/dashboard/recent-leads"
import { UpcomingInstallations } from "@/components/dashboard/upcoming-installations"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

async function getStats() {
  const supabase = await createClient()

  // Get total customers
  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })

  // Get total revenue and revenue data
  const { data: revenueData } = await supabase
    .from('invoices')
    .select('amount, payment_date')
    .eq('paid', true)
    .gte('payment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('payment_date', { ascending: true })

  const totalRevenue = revenueData?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0

  // Get active installations
  const { count: activeInstallations } = await supabase
    .from('installations')
    .select('*', { count: 'exact', head: true })
    .eq('sign_off', false)

  // Get pending quotes
  const { count: pendingQuotes } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('quote_status', 'PENDING')

  // Get lead sources data
  const { data: leads } = await supabase
    .from('leads')
    .select('notes, created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const leadSources = leads?.reduce((acc, lead) => {
    const source = (lead.notes as any)?.source
    if (!source) return acc
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const leadSourcesData = Object.entries(leadSources || {})
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  // Process revenue data for table
  const dailyRevenue = revenueData?.reduce((acc, invoice) => {
    const date = invoice.payment_date?.split('T')[0]
    if (!date || !invoice.amount) return acc
    acc[date] = (acc[date] || 0) + invoice.amount
    return acc
  }, {} as Record<string, number>)

  const revenueTableData = Object.entries(dailyRevenue || {})
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10) // Show only last 10 days

  return {
    customerCount: customerCount || 0,
    totalRevenue,
    activeInstallations: activeInstallations || 0,
    pendingQuotes: pendingQuotes || 0,
    leadSourcesData,
    revenueData: revenueTableData,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Installations</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInstallations}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.revenueData.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Lead Sources (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.leadSourcesData.map((row) => (
                  <TableRow key={row.source}>
                    <TableCell className="capitalize">{row.source.toLowerCase()}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading leads...</div>}>
              <RecentLeads />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Installations</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading installations...</div>}>
              <UpcomingInstallations />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 