import { type Tables } from "@/types/database.types"

interface PricingParams {
  rampLength: number
  numComponents: number
  distance: number
  settings: Tables<"settings">[]
}

interface PricingResult {
  monthlyRate: number
  setupFee: number
}

export function calculatePricing({
  rampLength,
  numComponents,
  distance,
  settings
}: PricingParams): PricingResult {
  // Get settings values
  const baseSetupFee = Number(settings.find(s => s.key === 'baseSetupFee')?.value) || 250
  const pricePerFoot = Number(settings.find(s => s.key === 'pricePerFoot')?.value) || 15
  const pricePerMile = Number(settings.find(s => s.key === 'pricePerMile')?.value) || 2.5
  const componentInstallFee = Number(settings.find(s => s.key === 'componentInstallFee')?.value) || 50

  // Calculate monthly rate
  const monthlyRate = rampLength * pricePerFoot

  // Calculate setup fee
  const setupFee = baseSetupFee + 
    (distance * pricePerMile) + 
    (numComponents * componentInstallFee)

  return {
    monthlyRate,
    setupFee
  }
} 