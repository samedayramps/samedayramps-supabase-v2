"use client"

import { type Tables } from "@/types/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { calculateJobProgress } from "@/lib/queries/job-progress"
import { formatCurrency } from "@/lib/utils"
import { CalendarDays, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

type JobProgressProps = {
  lead?: Tables<"leads"> | null
  quote?: Tables<"quotes"> | null
  agreement?: Tables<"agreements"> | null
  installation?: Tables<"installations"> | null
  invoice?: Tables<"invoices"> | null
}

export function JobProgress(props: JobProgressProps) {
  const progress = calculateJobProgress(props)
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Job Progress</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{progress.daysInProgress} days in progress</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Current Stage</div>
            <div className="text-2xl font-bold">
              {progress.stages[progress.currentStage]?.label || "Not Started"}
            </div>
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

        {/* Progress Timeline */}
        <div className="relative flex flex-col gap-2">
          {/* Progress Line */}
          <div 
            className="absolute left-3 top-4 h-[calc(100%-2rem)] w-px bg-border"
            aria-hidden="true"
          />
          
          {progress.stages.map((stage, index) => {
            const isCurrentStage = index === progress.currentStage
            
            return (
              <div 
                key={stage.key}
                className={cn(
                  "relative flex items-start gap-4 rounded-lg border p-4",
                  (stage.isComplete || stage.isInProgress) && "bg-muted/50"
                )}
              >
                {/* Stage Indicator */}
                <div 
                  className={cn(
                    "mt-1 h-6 w-6 rounded-full border-2",
                    stage.isComplete ? "bg-primary border-primary" :
                    stage.isInProgress ? "bg-background border-primary" :
                    "bg-muted border-muted-foreground/25"
                  )}
                />
                
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{stage.label}</div>
                    {stage.date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(stage.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {stage.description}
                  </div>

                  {/* Stage Details */}
                  {stage.details && (
                    <div className="mt-2 text-sm">
                      {stage.key === 'lead' && (
                        <>
                          {stage.details.mobilityType && (
                            <div>Mobility: {stage.details.mobilityType}</div>
                          )}
                          {stage.details.timeline && (
                            <div>Timeline: {stage.details.timeline}</div>
                          )}
                        </>
                      )}
                      {stage.key === 'quote' && (
                        <>
                          <div>Monthly Rate: {formatCurrency(stage.details.monthlyRate)}</div>
                          <div>Setup Fee: {formatCurrency(stage.details.setupFee)}</div>
                          {stage.details.validUntil && (
                            <div>Valid Until: {new Date(stage.details.validUntil).toLocaleDateString()}</div>
                          )}
                        </>
                      )}
                      {stage.key === 'installation' && stage.details.installedBy && (
                        <div>Installed By: {stage.details.installedBy}</div>
                      )}
                      {stage.key === 'invoice' && (
                        <>
                          <div>Amount: {formatCurrency(stage.details.amount)}</div>
                          {stage.details.paymentDate && (
                            <div>Paid On: {new Date(stage.details.paymentDate).toLocaleDateString()}</div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Next Action */}
        {progress.nextAction && (
          <div className="rounded-lg bg-primary/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{progress.nextAction.label}</div>
                <div className="text-sm text-muted-foreground">
                  {progress.nextAction.description}
                </div>
              </div>
              {progress.nextAction.href && (
                <Link href={progress.nextAction.href}>
                  <Button size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 