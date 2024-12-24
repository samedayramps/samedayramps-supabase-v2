'use server'

import { getSettings } from "@/lib/queries/settings"

export async function calculateDistance(customerAddress: string): Promise<number> {
  const settings = await getSettings()
  const warehouseAddress = settings.find(s => s.key === 'warehouseAddress')?.value as string

  if (!warehouseAddress || !customerAddress) {
    return 0
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured')
  }

  // First, get coordinates for both addresses
  const warehouseCoords = await getCoordinates(warehouseAddress, apiKey)
  const customerCoords = await getCoordinates(customerAddress, apiKey)

  // Then calculate distance
  const distance = calculateHaversineDistance(
    warehouseCoords.lat,
    warehouseCoords.lng,
    customerCoords.lat,
    customerCoords.lng
  )

  return distance
}

async function getCoordinates(address: string, apiKey: string) {
  const encodedAddress = encodeURIComponent(address)
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
  )
  const data = await response.json()

  if (!data.results?.[0]?.geometry?.location) {
    throw new Error(`Could not geocode address: ${address}`)
  }

  return {
    lat: data.results[0].geometry.location.lat,
    lng: data.results[0].geometry.location.lng
  }
}

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959.87433 // Earth's radius in miles

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
} 