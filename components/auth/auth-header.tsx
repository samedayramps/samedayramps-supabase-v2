import { createClient } from "@/app/supabase/server"
import { UserNav } from "./user-nav"

export async function AuthHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <UserNav user={user} />
} 