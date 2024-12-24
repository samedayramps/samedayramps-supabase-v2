'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { type Tables } from "@/types/database.types"

export async function getSettings() {
  const cookieStore = cookies()
  const supabase = await createClient()

  const { data: settings, error } = await supabase
    .from("settings")
    .select()
    .order("key")

  if (error) {
    throw new Error(`Error fetching settings: ${error.message}`)
  }

  return settings
}

export async function updateSetting(key: string, value: string | number | boolean) {
  const cookieStore = cookies()
  const supabase = await createClient()

  const { error } = await supabase
    .from("settings")
    .update({ value })
    .eq("key", key)

  if (error) {
    throw new Error(`Error updating setting: ${error.message}`)
  }
} 