"use client"

import { type Tables } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { calculateJobProgress } from "@/lib/queries/job-progress"
import { formatCurrency } from "@/lib/utils"
import { CalendarDays, Clock, ArrowRight, ChevronDown, Phone } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type JobProgressProps = {
  lead?: Tables<"leads"> | null
  quote?: Tables<"quotes"> | null
  agreement?: Tables<"agreements"> | null
  installation?: Tables<"installations"> | null
  invoice?: Tables<"invoices"> | null
  customer: Tables<"customers">
}

export function JobProgress(props: JobProgressProps) {
  const progress = calculateJobProgress(props)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)

  const toggleStage = (stageKey: string) => {
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
            variant={progress.stages[progress.currentStage]?.variant || "outline"}
            className="mt-1"
          >
            {progress.stages[progress.currentStage]?.status || "Not Started"}
          </Badge>
        </div>
      </div>

      {/* Progress Stages */}
      <div className="flex flex-col gap-2">
        {progress.stages.map((stage, index) => {
          const isExpanded = expandedStage === stage.key
          const isCurrentStage = index === progress.currentStage
          
          return (
            <Collapsible
              key={stage.key}
              open={isExpanded}
              onOpenChange={() => toggleStage(stage.key)}
            >
              <div 
                className={cn(
                  "rounded-lg border transition-all ease-in-out duration-200",
                  stage.isComplete && "bg-primary/5 border-primary/20",
                  stage.isInProgress && "bg-warning/5 border-warning/20",
                  !stage.isComplete && !stage.isInProgress && "bg-muted/5 border-muted",
                  "hover:bg-accent/5 cursor-pointer"
                )}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    {/* Status Indicator */}
                    <div 
                      className={cn(
                        "h-3 w-3 rounded-full transition-all ease-in-out duration-200",
                        stage.isComplete && "bg-primary",
                        stage.isInProgress && "bg-warning",
                        !stage.isComplete && !stage.isInProgress && "bg-muted-foreground/25"
                      )}
                    />
                    
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">{stage.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {stage.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {stage.date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(stage.date).toLocaleDateString()}
                      </div>
                    )}
                    <div 
                      className={cn(
                        "transform transition-transform ease-in-out duration-200",
                        isExpanded && "rotate-180"
                      )}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CollapsibleTrigger>

                {/* Expandable Details */}
                <CollapsibleContent 
                  className={cn(
                    "overflow-hidden transition-all ease-in-out duration-200",
                    "data-[state=open]:animate-[accordion-down_200ms_ease-in-out]",
                    "data-[state=closed]:animate-[accordion-up_200ms_ease-in-out]"
                  )}
                >
                  <div className="border-t p-4 text-sm space-y-2">
                    {stage.key === 'lead' && stage.details && (
                      <>
                        {stage.details.mobilityType && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mobility Type:</span>
                            <span>{stage.details.mobilityType}</span>
                          </div>
                        )}
                        {stage.details.timeline && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Timeline:</span>
                            <span>{stage.details.timeline}</span>
                          </div>
                        )}
                        <div className="mt-4 flex justify-end">
                          <Link href={`/customers/${props.customer.id}/call`}>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-2" />
                              Call Customer
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                    {stage.key === 'quote' && stage.details && (
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
                    {stage.key === 'installation' && stage.details?.installedBy && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Installed By:</span>
                        <span>{stage.details.installedBy}</span>
                      </div>
                    )}
                    {stage.key === 'invoice' && stage.details && (
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
          )
        })}
      </div>
    </div>
  )
} 