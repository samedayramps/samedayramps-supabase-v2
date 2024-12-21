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

  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current) return

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "US" },
      fields: ["address_components", "formatted_address", "geometry"],
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
      google.maps.event.clearInstanceListeners(autocompleteRef.current!)
    }
  }, [isScriptLoaded, onChange])

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setIsScriptLoaded(true)}
      />
      <FormControl>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={className}
        />
      </FormControl>
    </>
  )
} 