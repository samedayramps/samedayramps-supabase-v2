import { getLeads } from "@/app/actions/leads";
import { LeadsTable } from "@/components/tables/leads-table";

export default async function LeadsPage() {
  try {
    const leads = await getLeads();

    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Leads</h1>
        <LeadsTable data={leads || []} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching leads:', error);
    // TODO: Add proper error handling UI
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="text-red-500">Failed to load leads</div>
      </div>
    );
  }
} 