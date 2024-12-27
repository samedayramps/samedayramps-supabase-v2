"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { type Tables } from "@/types/database.types"

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .match({ id })

    if (error) throw error

    revalidatePath('/customers')
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw new Error('Failed to delete customer')
  }
}

type CustomerData = Pick<
  Tables<"customers">,
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
>

export async function createCustomer(data: CustomerData): Promise<void> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('customers')
      .insert(data)

    if (error) throw error

    revalidatePath('/customers')
    redirect('/customers')
  } catch (error) {
    console.error('Error creating customer:', error)
    throw new Error('Failed to create customer')
  }
}

export async function updateCustomer(id: string, data: CustomerData): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('customers')
      .update(data)
      .match({ id })

    if (error) throw error

    revalidatePath('/customers')
    redirect('/customers')
  } catch (error) {
    console.error('Error updating customer:', error)
    throw new Error('Failed to update customer')
  }
} 