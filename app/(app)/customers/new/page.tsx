import { CustomerForm } from "@/components/forms/customer-form"

export default function NewCustomerPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Customer</h1>
      <CustomerForm />
    </div>
  )
} 