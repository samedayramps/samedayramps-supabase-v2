"use client"

import { Input } from "@/components/ui/input"
import { FormControl } from "@/components/ui/form"
import { useEffect, useRef, useState } from "react"
import Script from "next/script"

interface AddressAutocompleteProps {
  value?: string
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "Enter an address",
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState<string | null>(null)

  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current) return

    try {
      // Initialize Google Places Autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "US" },
        fields: ["address_components", "formatted_address", "geometry", "place_id"],
        types: ["address"],
      })

      // Add listener for place selection
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place?.formatted_address) {
          onChange(place.formatted_address, place)
        }
      })

      return () => {
        // Cleanup
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current)
        }
      }
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error)
      setScriptError('Failed to initialize address autocomplete')
    }
  }, [isScriptLoaded, onChange])

  if (scriptError) {
    return (
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={scriptError}
        className={className}
      />
    )
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setIsScriptLoaded(true)}
        onError={(e) => {
          console.error('Error loading Google Maps script:', e)
          setScriptError('Failed to load address autocomplete')
        }}
      />
      <FormControl>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled || !isScriptLoaded}
          placeholder={!isScriptLoaded ? "Loading..." : placeholder}
          className={className}
        />
      </FormControl>
    </>
  )
} 