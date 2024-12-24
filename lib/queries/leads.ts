'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function updateLeadNotes(id: string, notes: string) {
  const cookieStore = cookies()
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update({ notes })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
} 