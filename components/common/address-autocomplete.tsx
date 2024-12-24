"use client"

import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"
import { useGoogleMapsLoaded } from "./google-maps-script"

interface AddressAutocompleteProps {
  value?: string
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({
  value = '',
  onChange,
  onBlur,
  disabled,
  placeholder = "Enter an address",
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const isScriptLoaded = useGoogleMapsLoaded()
  const [inputValue, setInputValue] = useState(value)

  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

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
      const placeChangedListener = autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place?.formatted_address) {
          setInputValue(place.formatted_address)
          onChange(place.formatted_address, place)
        }
      })

      // Prevent form submission on enter
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault()
        }
      }
      inputRef.current.addEventListener('keydown', handleKeyDown)

      return () => {
        // Cleanup
        if (placeChangedListener) {
          google.maps.event.removeListener(placeChangedListener)
        }
        if (inputRef.current) {
          inputRef.current.removeEventListener('keydown', handleKeyDown)
        }
        // Clean up autocomplete
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current)
        }
      }
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error)
    }
  }, [isScriptLoaded, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    // Always call onChange with the new value
    onChange(newValue)
  }

  const handleBlur = () => {
    onBlur?.()
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      disabled={disabled || !isScriptLoaded}
      placeholder={!isScriptLoaded ? "Loading..." : placeholder}
      className={className}
      autoComplete="off"
    />
  )
} 