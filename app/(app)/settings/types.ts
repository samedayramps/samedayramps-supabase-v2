import { type Tables } from "@/types/database.types"

export type Setting = Tables<"settings">

export type SettingKey = 
  | 'base_setup_fee'
  | 'price_per_foot'
  | 'price_per_mile'
  | 'component_install_fee'
  | 'warehouse_address'
  | 'warehouse_lat'
  | 'warehouse_lng'

export type SettingCategory = 'pricing' | 'location'

export interface PricingSettings {
  baseSetupFee: number
  pricePerFoot: number
  pricePerMile: number
  componentInstallFee: number
}

export interface LocationSettings {
  warehouseAddress: string
  warehouseLat: number
  warehouseLng: number
}

export type Settings = PricingSettings & LocationSettings 