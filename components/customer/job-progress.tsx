"use client"

import { type Tables } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { calculateJobProgress, type JobProgressData } from "@/lib/utils/job-progress"
import { formatCurrency } from "@/lib/utils"
import { CalendarDays, Clock, ArrowRight, ChevronDown, Phone } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { LeadInfo } from "./lead-info"

type JobProgressProps = JobProgressData

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

type StageKey = 'lead' | 'quote' | 'agreement' | 'installation' | 'invoice'

function mapVariantToBadge(variant: string): BadgeVariant {
  switch (variant) {
    case 'success':
      return 'default'
    case 'warning':
      return 'secondary'
    case 'destructive':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function JobProgress(props: JobProgressProps) {
  const progress = calculateJobProgress(props)
  const [expandedStage, setExpandedStage] = useState<StageKey | null>(null)

  const toggleStage = (stageKey: StageKey) => {
    setExpandedStage(prev => prev === stageKey ? null : stageKey)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Job Progress</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{progress.daysInProgress} days in progress</span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">Next Action</div>
          {progress.nextAction ? (
            <>
              <div className="text-2xl font-bold">{progress.nextAction.label}</div>
              <div className="text-sm text-muted-foreground">{progress.nextAction.description}</div>
              {progress.nextAction.href && (
                <Link href={progress.nextAction.href} className="mt-2">
                  <Button size="sm">
                    Take Action <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <div className="text-2xl font-bold">Job Complete</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">Status</div>
          <Badge 
            variant={mapVariantToBadge(progress.stages[progress.currentStage as StageKey]?.variant || "outline")}
            className="mt-1"
          >
            {progress.stages[progress.currentStage as StageKey]?.status || "Not Started"}
          </Badge>
        </div>
      </div>

      {/* Progress Stages */}
      <div className="flex flex-col gap-2">
        {(Object.entries(progress.stages) as [StageKey, typeof progress.stages[StageKey]][]).map(([key, stage]) => (
          <Collapsible
            key={key}
            open={expandedStage === key}
            onOpenChange={() => toggleStage(key)}
          >
            <div className={cn(
              "rounded-lg border",
              expandedStage === key ? "bg-muted/50" : "bg-background",
              stage.isComplete ? "border-muted" : "border-border"
            )}>
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={mapVariantToBadge(stage.variant)}
                    className="w-24 justify-center"
                  >
                    {stage.status}
                  </Badge>
                  <span className="font-medium">{stage.label}</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  expandedStage === key ? "rotate-180" : ""
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t p-4">
                  {key === 'lead' && props.lead && (
                    <div className="space-y-4">
                      <LeadInfo lead={props.lead} />
                      <div className="flex justify-end">
                        <Link href={`/customers/${props.customer.id}/call`}>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Customer
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {key === 'quote' && stage.details && (
                    <>
                      {'monthlyRate' in stage.details && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Rate:</span>
                          <span>{formatCurrency(stage.details.monthlyRate)}</span>
                        </div>
                      )}
                      {'setupFee' in stage.details && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Setup Fee:</span>
                          <span>{formatCurrency(stage.details.setupFee)}</span>
                        </div>
                      )}
                      {'validUntil' in stage.details && stage.details.validUntil && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valid Until:</span>
                          <span>{new Date(stage.details.validUntil).toLocaleDateString()}</span>
                        </div>
                      )}
                    </>
                  )}
                  {key === 'installation' && stage.details && 'installedBy' in stage.details && stage.details.installedBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Installed By:</span>
                      <span>{stage.details.installedBy}</span>
                    </div>
                  )}
                  {key === 'invoice' && stage.details && (
                    <>
                      {'amount' in stage.details && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span>{formatCurrency(stage.details.amount)}</span>
                        </div>
                      )}
                      {'paymentDate' in stage.details && stage.details.paymentDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paid On:</span>
                          <span>{new Date(stage.details.paymentDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  )
} 