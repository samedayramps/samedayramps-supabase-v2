"use client"

import { useState, useEffect } from "react"
import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/hooks/use-toast"
import { Package, Pencil, Save, X } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type Component = Tables<"components">

interface EditableComponent extends Component {
  isEditing?: boolean
}

export function ComponentSettings() {
  const [components, setComponents] = useState<EditableComponent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchComponents()
  }, [])

  const fetchComponents = async () => {
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .order("type", { ascending: true })
      .order("length", { ascending: true })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch components"
      })
      return
    }

    setComponents(data)
    setIsLoading(false)
  }

  const handleEdit = (id: string) => {
    setComponents(components.map(component => 
      component.id === id 
        ? { ...component, isEditing: true }
        : component
    ))
  }

  const handleCancelEdit = (id: string) => {
    setComponents(components.map(component =>
      component.id === id
        ? { ...component, isEditing: false }
        : component
    ))
  }

  const handleSave = async (component: EditableComponent) => {
    const { id, name, length, width, price_per_day, price_per_month, notes } = component
    
    const { error } = await supabase
      .from("components")
      .update({
        name,
        length,
        width,
        price_per_day,
        price_per_month,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update component"
      })
      return
    }

    setComponents(components.map(c =>
      c.id === id
        ? { ...component, isEditing: false }
        : c
    ))

    toast({
      title: "Success",
      description: "Component updated successfully"
    })
  }

  const handleInputChange = (id: string, field: keyof Component, value: string) => {
    setComponents(components.map(component =>
      component.id === id
        ? { 
            ...component, 
            [field]: field === 'name' || field === 'notes' 
              ? value 
              : Number(value)
          }
        : component
    ))
  }

  const ComponentCard = ({ component }: { component: EditableComponent }) => (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {component.isEditing ? (
            <Input
              value={component.name}
              onChange={(e) => handleInputChange(component.id, 'name', e.target.value)}
              className="font-medium"
            />
          ) : (
            <h3 className="font-medium">{component.name}</h3>
          )}
        </div>
        <div>
          {component.isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSave(component)}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCancelEdit(component.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(component.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Length (ft)</Label>
          {component.isEditing ? (
            <Input
              type="number"
              value={component.length}
              onChange={(e) => handleInputChange(component.id, 'length', e.target.value)}
            />
          ) : (
            <p className="text-sm">{component.length}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Width (ft)</Label>
          {component.isEditing ? (
            <Input
              type="number"
              value={component.width || ''}
              onChange={(e) => handleInputChange(component.id, 'width', e.target.value)}
            />
          ) : (
            <p className="text-sm">{component.width || 'N/A'}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Daily Rate</Label>
          {component.isEditing ? (
            <Input
              type="number"
              value={component.price_per_day}
              onChange={(e) => handleInputChange(component.id, 'price_per_day', e.target.value)}
            />
          ) : (
            <p className="text-sm">${component.price_per_day.toFixed(2)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Monthly Rate</Label>
          {component.isEditing ? (
            <Input
              type="number"
              value={component.price_per_month}
              onChange={(e) => handleInputChange(component.id, 'price_per_month', e.target.value)}
            />
          ) : (
            <p className="text-sm">${component.price_per_month.toFixed(2)}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Notes</Label>
          {component.isEditing ? (
            <Input
              value={component.notes || ''}
              onChange={(e) => handleInputChange(component.id, 'notes', e.target.value)}
            />
          ) : (
            <p className="text-sm">{component.notes || 'No notes'}</p>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Component Management</h2>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {/* Ramp Sections */}
        <AccordionItem value="ramps" className="border rounded-lg">
          <AccordionTrigger className="px-4">
            <h3 className="text-base font-medium">Ramp Sections</h3>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4">
              {components
                .filter(component => component.type === 'RAMP')
                .map(component => (
                  <ComponentCard key={component.id} component={component} />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Landings */}
        <AccordionItem value="landings" className="border rounded-lg">
          <AccordionTrigger className="px-4">
            <h3 className="text-base font-medium">Landings</h3>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4">
              {components
                .filter(component => component.type === 'LANDING')
                .map(component => (
                  <ComponentCard key={component.id} component={component} />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
} 