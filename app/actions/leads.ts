"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { type Tables } from "@/types/database.types"

export async function deleteLead(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .match({ id })

    if (error) throw error

    revalidatePath('/leads')
  } catch (error) {
    console.error('Error deleting lead:', error)
    throw new Error('Failed to delete lead')
  }
}

export async function createLead(data: any): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('leads')
      .insert(data)

    if (error) throw error

    revalidatePath('/leads')
  } catch (error) {
    console.error('Error creating lead:', error)
    throw new Error('Failed to create lead')
  }
}

type UpdateLeadData = Pick<
  Tables<"leads">,
  | "status" 
  | "mobility_type" 
  | "ramp_length" 
  | "timeline" 
  | "rental_duration"
  | "notes"
>

export async function updateLead(id: string, data: UpdateLeadData): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('leads')
      .update(data)
      .match({ id })

    if (error) throw error

    revalidatePath('/leads')
    redirect('/leads')
  } catch (error) {
    console.error('Error updating lead:', error)
    throw new Error('Failed to update lead')
  }
} 