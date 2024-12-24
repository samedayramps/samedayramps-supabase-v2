import { z } from 'zod'
import type { SettingKey } from './types'

export const settingSchema = z.object({
  id: z.string().uuid(),
  key: z.custom<SettingKey>(),
  name: z.string(),
  description: z.string().nullable(),
  value: z.union([z.number(), z.string(), z.boolean()]),
  category: z.enum(['pricing', 'location']),
  type: z.enum(['number', 'string', 'boolean']),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable()
})

export const settingFormSchema = z.object({
  base_setup_fee: z.number().min(0),
  price_per_foot: z.number().min(0),
  price_per_mile: z.number().min(0),
  component_install_fee: z.number().min(0),
  warehouse_address: z.string().min(1),
})

export type SettingFormValues = z.infer<typeof settingFormSchema> 