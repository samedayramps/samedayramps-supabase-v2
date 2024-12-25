"use client"

import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { getSettings } from "@/lib/queries/settings"
import { calculateDistance } from "@/lib/services/distance"
import { calculatePricing } from "@/lib/services/pricing"
import { useState } from "react"
import { useToast } from "@/components/hooks/use-toast"
import { Calculator } from "lucide-react"
import { ComponentSelector } from "./component-selector"

type CalculatedPricing = {
  monthlyRate: number
  setupFee: number
  pricePerFoot: number
}

type Component = Tables<"components">

interface RampCalculatorProps {
  customerAddress: string
  initialValues?: {
    components?: { component: Component; quantity: number }[]
  }
  onCalculate?: (pricing: CalculatedPricing & { 
    distance: number;
    components: { component: Component; quantity: number }[];
    totalLength: number;
  }) => void
  className?: string
}

export function RampCalculator({ 
  customerAddress, 
  initialValues,
  onCalculate,
  className 
}: RampCalculatorProps) {
  const { toast } = useToast()
  const [selectedComponents, setSelectedComponents] = useState<{ component: Component; quantity: number }[]>(
    initialValues?.components || []
  )
  const [distance, setDistance] = useState<number | null>(null)
  const [pricing, setPricing] = useState<CalculatedPricing | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const calculateTotalLength = (components: { component: Component; quantity: number }[]) => {
    return components.reduce((total, { component, quantity }) => {
      if (component.type === 'RAMP') {
        return total + (component.length * quantity)
      }
      return total
    }, 0)
  }

  const handleComponentsChange = (components: { component: Component; quantity: number }[]) => {
    setSelectedComponents(components)
  }

  const handleCalculate = async () => {
    if (!customerAddress) {
      toast({
        variant: "destructive",
        title: "Missing Address",
        description: "Customer address is required for distance calculation"
      })
      return
    }

    if (selectedComponents.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Components",
        description: "Please select at least one component"
      })
      return
    }

    setIsLoading(true)
    try {
      const settings = await getSettings()
      const calculatedDistance = await calculateDistance(customerAddress)
      setDistance(calculatedDistance)

      const totalLength = calculateTotalLength(selectedComponents)
      const numComponents = selectedComponents.reduce((total, { quantity }) => total + quantity, 0)

      const calculatedPricing = calculatePricing({
        rampLength: totalLength,
        numComponents,
        distance: calculatedDistance,
        settings
      })

      // Calculate price per foot
      const pricePerFoot = calculatedPricing.monthlyRate / totalLength

      const pricingWithPerFoot = {
        ...calculatedPricing,
        pricePerFoot
      }

      setPricing(pricingWithPerFoot)
      onCalculate?.({
        ...pricingWithPerFoot,
        distance: calculatedDistance,
        components: selectedComponents,
        totalLength
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate pricing"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b bg-muted/50 p-4">
        <Calculator className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Ramp Calculator</h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Component Selector */}
        <ComponentSelector
          onComponentsChange={handleComponentsChange}
          className="bg-muted/50"
        />

        {/* Calculate Button */}
        <div className="flex w-full md:justify-end">
          <Button 
            onClick={handleCalculate} 
            disabled={isLoading || selectedComponents.length === 0}
            size="lg"
            className="w-full md:w-auto min-w-[120px]"
          >
            {isLoading ? "Calculating..." : "Calculate"}
          </Button>
        </div>

        {/* Results */}
        {pricing && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Monthly Rate</span>
                <p className="text-2xl font-bold">${pricing.monthlyRate.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Setup Fee</span>
                <p className="text-2xl font-bold">${pricing.setupFee.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Price per Foot</span>
                <p className="text-2xl font-bold">${pricing.pricePerFoot.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/ft</span></p>
              </div>
              {distance !== null && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <p className="text-2xl font-bold">{distance.toFixed(1)}<span className="text-sm font-normal text-muted-foreground"> miles</span></p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 