import { createClient } from "@/utils/supabase/server"
import { SettingsForm } from "./settings-form"
import { GoogleMapsScript } from "@/components/common/google-maps-script"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from("settings")
    .select()
    .order('category', { ascending: true })

  return (
    <GoogleMapsScript>
      <SettingsForm settings={settings || []} />
    </GoogleMapsScript>
  )
} 