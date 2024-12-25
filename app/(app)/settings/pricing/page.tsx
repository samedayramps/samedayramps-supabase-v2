import { createClient } from "@/utils/supabase/server"
import { SettingsForm } from "../settings-form"

export default async function PricingSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from("settings")
    .select()
    .eq('category', 'pricing')
    .order('name', { ascending: true })

  return <SettingsForm settings={settings || []} />
} 