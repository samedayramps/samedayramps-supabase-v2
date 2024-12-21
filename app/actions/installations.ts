"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { type Tables } from "@/types/database.types"

export async function deleteInstallation(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('installations')
      .delete()
      .match({ id })

    if (error) throw error

    revalidatePath('/installations')
  } catch (error) {
    console.error('Error deleting installation:', error)
    throw new Error('Failed to delete installation')
  }
}

type InstallationData = {
  agreement_id: string
  installation_date: string | null
  installed_by: string | null
  sign_off: boolean
  installation_photos?: string[] | null
}

export async function createInstallation(data: InstallationData) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('installations')
      .insert({
        ...data,
        installation_photos: data.installation_photos || null,
      })

    if (error) throw error

    revalidatePath('/installations')
    return { success: true }
  } catch (error) {
    console.error('Error creating installation:', error)
    return { error: 'Failed to create installation' }
  }
}

export async function updateInstallation(id: string, data: InstallationData): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('installations')
      .update({
        ...data,
        installation_photos: data.installation_photos || null,
      })
      .match({ id })

    if (error) throw error

    revalidatePath('/installations')
    redirect('/installations')
  } catch (error) {
    console.error('Error updating installation:', error)
    throw new Error('Failed to update installation')
  }
} 