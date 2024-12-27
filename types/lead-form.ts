export type Timeline = 'ASAP' | 'THIS_WEEK' | 'THIS_MONTH' | 'FLEXIBLE'

export interface Address {
  formatted_address: string
  street_number: string | null
  street_name: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  lat: number | null
  lng: number | null
  place_id: string | null
}

export interface Customer {
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: Address
}

export interface LeadFormData {
  customer: Customer
  timeline: Timeline
  notes: string | null
}

/**
 * Example usage:
 * 
 * ```typescript
 * const leadData: LeadFormData = {
 *   customer: {
 *     first_name: "John",
 *     last_name: "Doe",
 *     email: "john@example.com",
 *     phone: "1234567890",
 *     address: {
 *       formatted_address: "123 Main St, City, State",
 *       street_number: "123",
 *       street_name: "Main St",
 *       city: "City",
 *       state: "State",
 *       postal_code: "12345",
 *       country: "USA",
 *       lat: 12.345,
 *       lng: -67.890,
 *       place_id: "ChIJ..."
 *     }
 *   },
 *   timeline: "ASAP",
 *   notes: "Additional notes"
 * }
 * ```
 */ 