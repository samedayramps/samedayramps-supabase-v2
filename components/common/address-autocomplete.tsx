"use client"

import { Input } from "@/components/ui/input"
import { FormControl } from "@/components/ui/form"
import { useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from 'use-debounce'
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
  const [scriptError, setScriptError] = useState<string | null>(null)
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
      }
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error)
      setScriptError('Failed to initialize address autocomplete')
    }
  }, [isScriptLoaded, onChange])

  const debouncedOnChange = useDebouncedCallback((value: string) => {
    onChange(value)
  }, 300)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    debouncedOnChange(newValue)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Only call onBlur if we're not clicking on the suggestions dropdown
    const isClickingAutocomplete = document.querySelector('.pac-container')?.contains(e.relatedTarget as Node)
    if (!isClickingAutocomplete && onBlur) {
      onBlur()
    }
  }

  if (scriptError) {
    return (
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={scriptError}
        className={className}
      />
    )
  }

  return (
    <FormControl>
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
    </FormControl>
  )
} 