"use client"

import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSettings } from "@/lib/queries/settings"
import { calculateDistance } from "@/lib/services/distance"
import { calculatePricing } from "@/lib/services/pricing"
import { useState } from "react"
import { useToast } from "@/components/hooks/use-toast"
import { Calculator, Ruler, Blocks } from "lucide-react"

type CalculatedPricing = {
  monthlyRate: number
  setupFee: number
  pricePerFoot: number
}

interface RampCalculatorProps {
  customerAddress: string
  initialValues?: {
    rampLength?: number
    numComponents?: number
  }
  onCalculate?: (pricing: CalculatedPricing & { distance: number }) => void
  className?: string
}

export function RampCalculator({ 
  customerAddress, 
  initialValues,
  onCalculate,
  className 
}: RampCalculatorProps) {
  const { toast } = useToast()
  const [rampLength, setRampLength] = useState(initialValues?.rampLength?.toString() || "")
  const [numComponents, setNumComponents] = useState(initialValues?.numComponents?.toString() || "")
  const [distance, setDistance] = useState<number | null>(null)
  const [pricing, setPricing] = useState<CalculatedPricing | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCalculate = async () => {
    if (!customerAddress) {
      toast({
        variant: "destructive",
        title: "Missing Address",
        description: "Customer address is required for distance calculation"
      })
      return
    }

    if (!rampLength || !numComponents) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter both ramp length and number of components"
      })
      return
    }

    setIsLoading(true)
    try {
      const settings = await getSettings()
      const calculatedDistance = await calculateDistance(customerAddress)
      setDistance(calculatedDistance)

      const calculatedPricing = calculatePricing({
        rampLength: Number(rampLength),
        numComponents: Number(numComponents),
        distance: calculatedDistance,
        settings
      })

      // Calculate price per foot
      const pricePerFoot = calculatedPricing.monthlyRate / Number(rampLength)

      const pricingWithPerFoot = {
        ...calculatedPricing,
        pricePerFoot
      }

      setPricing(pricingWithPerFoot)
      onCalculate?.({
        ...pricingWithPerFoot,
        distance: calculatedDistance
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

  const handleRampLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setRampLength(value)
    }
  }

  const handleComponentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setNumComponents(value)
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
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rampLength" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Ramp Length (feet)
            </Label>
            <Input
              id="rampLength"
              type="text"
              inputMode="decimal"
              value={rampLength}
              onChange={handleRampLengthChange}
              placeholder="Enter ramp length"
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numComponents" className="flex items-center gap-2">
              <Blocks className="h-4 w-4" />
              Number of Components
            </Label>
            <Input
              id="numComponents"
              type="text"
              inputMode="numeric"
              value={numComponents}
              onChange={handleComponentsChange}
              placeholder="Enter number of components"
              className="bg-muted/50"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <div className="flex w-full md:justify-end">
          <Button 
            onClick={handleCalculate} 
            disabled={isLoading || !rampLength || !numComponents}
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