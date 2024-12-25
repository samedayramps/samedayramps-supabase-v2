'use client'

import { useState } from 'react'
import { CALL_GUIDE_SECTIONS } from '@/lib/constants/call-guide'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface CallGuideProps {
  customerName: string
}

export function CallGuide({ customerName }: CallGuideProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const replaceCustomerName = (text: string) => {
    return text.replace('[Customer Name]', customerName)
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Call Guide</h3>
      <div className="space-y-2">
        {CALL_GUIDE_SECTIONS.map((section) => (
          <Collapsible
            key={section.title}
            open={expandedSections.includes(section.title)}
            onOpenChange={() => toggleSection(section.title)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-background p-4 text-left">
              <h4 className="text-sm font-medium">{section.title}</h4>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  expandedSections.includes(section.title) ? "rotate-180" : ""
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 px-4">
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground">
                        {replaceCustomerName(item.description)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
} 