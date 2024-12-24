'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { settingSchema } from './schema'
import type { SettingKey } from './types'

const UpdateSettingSchema = z.object({
  id: z.string().uuid(),
  value: z.union([z.number(), z.string(), z.boolean()])
})

export type ActionState = {
  errors?: {
    [key in SettingKey]?: string[]
  }
  message?: string
}

interface SettingUpdate {
  id: string
  value: string
}

export async function updateSettingValue(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const validatedFields = UpdateSettingSchema.safeParse({
      id: formData.get('id'),
      value: formData.get('value')
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors as ActionState['errors'],
        message: 'Invalid setting value'
      }
    }

    const { id, value } = validatedFields.data
    const supabase = await createClient()
    
    const { error } = await supabase
      .from("settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return {
        message: `Failed to update setting: ${error.message}`
      }
    }

    revalidatePath('/settings')
    return {
      message: 'Setting updated successfully'
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Failed to update setting'
    }
  }
}

export async function updateSettings(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const errors: string[] = []

    // Get all settings first
    const { data: settings } = await supabase
      .from("settings")
      .select()
      .order('category', { ascending: true })

    if (!settings) {
      return {
        message: 'Failed to fetch settings'
      }
    }

    // Process each setting
    const updates: SettingUpdate[] = []
    const settingsMap = {
      base_setup_fee: settings.find(s => s.key === 'base_setup_fee'),
      price_per_foot: settings.find(s => s.key === 'price_per_foot'),
      price_per_mile: settings.find(s => s.key === 'price_per_mile'),
      component_install_fee: settings.find(s => s.key === 'component_install_fee'),
      warehouse_address: settings.find(s => s.key === 'warehouse_address'),
    }

    // Update main settings
    for (const [key, setting] of Object.entries(settingsMap)) {
      if (setting) {
        const value = formData.get(key)
        if (value !== null) {
          updates.push({
            id: setting.id,
            value: value.toString()
          })
        }
      }
    }

    // Update lat/lng if provided
    const lat = formData.get('warehouse_lat')
    const lng = formData.get('warehouse_lng')
    if (lat && lng) {
      const latSetting = settings.find(s => s.key === 'warehouse_lat')
      const lngSetting = settings.find(s => s.key === 'warehouse_lng')
      
      if (latSetting && lngSetting) {
        updates.push(
          { id: latSetting.id, value: lat.toString() },
          { id: lngSetting.id, value: lng.toString() }
        )
      }
    }

    // Perform all updates in parallel
    const results = await Promise.all(
      updates.map(({ id, value }) => 
        supabase
          .from("settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq('id', id)
      )
    )

    // Check for errors
    results.forEach((result, index) => {
      if (result.error) {
        errors.push(`Failed to update setting ${updates[index].id}: ${result.error.message}`)
      }
    })

    if (errors.length > 0) {
      return {
        message: errors.join('\n')
      }
    }

    revalidatePath('/settings')
    return {
      message: 'All settings updated successfully'
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Failed to update settings'
    }
  }
} 