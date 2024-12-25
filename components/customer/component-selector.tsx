"use client"

import { useState, useEffect } from "react"
import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { Plus, Minus, Package } from "lucide-react"

type Component = Tables<"components">

interface ComponentSelectorProps {
  onComponentsChange?: (components: { component: Component; quantity: number }[]) => void
  className?: string
}

export function ComponentSelector({ onComponentsChange, className }: ComponentSelectorProps) {
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponents, setSelectedComponents] = useState<{ component: Component; quantity: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchComponents = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("components")
        .select("*")
        .order("type", { ascending: true })
        .order("length", { ascending: true })

      if (error) {
        console.error("Error fetching components:", error)
        return
      }

      setComponents(data)
      setIsLoading(false)
    }

    fetchComponents()
  }, [])

  const handleAddComponent = (componentId: string) => {
    const component = components.find(c => c.id === componentId)
    if (!component) return

    const existingIndex = selectedComponents.findIndex(sc => sc.component.id === componentId)
    if (existingIndex >= 0) {
      const updated = [...selectedComponents]
      updated[existingIndex].quantity += 1
      setSelectedComponents(updated)
    } else {
      setSelectedComponents([...selectedComponents, { component, quantity: 1 }])
    }

    onComponentsChange?.(selectedComponents)
  }

  const handleRemoveComponent = (componentId: string) => {
    const existingIndex = selectedComponents.findIndex(sc => sc.component.id === componentId)
    if (existingIndex >= 0) {
      const updated = [...selectedComponents]
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1
      } else {
        updated.splice(existingIndex, 1)
      }
      setSelectedComponents(updated)
      onComponentsChange?.(updated)
    }
  }

  const rampComponents = components.filter(c => c.type === 'RAMP')
  const landingComponents = components.filter(c => c.type === 'LANDING')

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b bg-muted/50 p-4">
        <Package className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Component Selection</h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Ramp Sections */}
        <div className="space-y-4">
          <Label>Ramp Sections</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rampComponents.map(component => (
              <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{component.name}</p>
                  <p className="text-sm text-muted-foreground">{component.length}ft</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveComponent(component.id)}
                    disabled={!selectedComponents.some(sc => sc.component.id === component.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">
                    {selectedComponents.find(sc => sc.component.id === component.id)?.quantity || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAddComponent(component.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Landings */}
        <div className="space-y-4">
          <Label>Landings</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {landingComponents.map(component => (
              <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{component.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {component.length}ft x {component.width}ft
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveComponent(component.id)}
                    disabled={!selectedComponents.some(sc => sc.component.id === component.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">
                    {selectedComponents.find(sc => sc.component.id === component.id)?.quantity || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAddComponent(component.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {selectedComponents.length > 0 && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Selected Components</h4>
            <div className="space-y-2">
              {selectedComponents.map(({ component, quantity }) => (
                <div key={component.id} className="flex justify-between text-sm">
                  <span>{component.name}</span>
                  <span>x{quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 