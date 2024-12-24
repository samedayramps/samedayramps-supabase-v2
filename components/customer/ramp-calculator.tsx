"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSettings } from "@/lib/queries/settings"
import { calculateDistance } from "@/lib/services/distance"
import { calculatePricing } from "@/lib/services/pricing"
import { useState } from "react"
import { useToast } from "@/components/hooks/use-toast"

interface RampCalculatorProps {
  customerAddress: string
}

export function RampCalculator({ customerAddress }: RampCalculatorProps) {
  const { toast } = useToast()
  const [rampLength, setRampLength] = useState("")
  const [numComponents, setNumComponents] = useState("")
  const [distance, setDistance] = useState<number | null>(null)
  const [pricing, setPricing] = useState<{ monthlyRate: number; setupFee: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCalculate = async () => {
    if (!customerAddress) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Customer address is required for distance calculation"
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

      setPricing(calculatedPricing)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to calculate pricing"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rampLength">Ramp Length (feet)</Label>
          <Input
            id="rampLength"
            type="number"
            value={rampLength}
            onChange={(e) => setRampLength(e.target.value)}
            placeholder="Enter ramp length"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numComponents">Number of Components</Label>
          <Input
            id="numComponents"
            type="number"
            value={numComponents}
            onChange={(e) => setNumComponents(e.target.value)}
            placeholder="Enter number of components"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleCalculate} 
          disabled={isLoading || !rampLength || !numComponents}
        >
          {isLoading ? "Calculating..." : "Calculate"}
        </Button>
      </div>

      {pricing && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Rate:</span>
              <span className="font-medium">${pricing.monthlyRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Setup Fee:</span>
              <span className="font-medium">${pricing.setupFee.toFixed(2)}</span>
            </div>
            {distance !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance:</span>
                <span className="font-medium">{distance.toFixed(1)} miles</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
} 