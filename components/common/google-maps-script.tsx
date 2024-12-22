"use client"

import Script from "next/script"
import { createContext, useContext, useState } from "react"

const GoogleMapsContext = createContext<boolean>(false)

export const useGoogleMapsLoaded = () => useContext(GoogleMapsContext)

export function GoogleMapsScript({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <GoogleMapsContext.Provider value={isLoaded}>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setIsLoaded(true)}
        strategy="afterInteractive"
      />
      {children}
    </GoogleMapsContext.Provider>
  )
} 