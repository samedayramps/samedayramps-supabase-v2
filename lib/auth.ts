"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function auth() {
  const cookieStore = cookies()
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
} 