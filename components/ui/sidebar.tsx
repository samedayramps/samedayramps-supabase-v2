"use client"

import * as React from "react"
import { PanelLeft, Menu } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isMobile = useMobile()

  React.useEffect(() => {
    if (!isMobile) {
      setIsOpen(false)
    }
  }, [isMobile])

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed right-4 top-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "relative hidden h-full flex-col border-r bg-background transition-all duration-300 ease-in-out md:flex",
        isOpen ? "w-[280px]" : "w-[52px]",
        className
      )}
    >
      <div className="flex h-16 items-center justify-end px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="h-8 w-8 transition-colors hover:bg-accent"
            >
              <PanelLeft
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  !isOpen && "rotate-180"
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {isOpen ? "Collapse sidebar" : "Expand sidebar"}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-1 flex-col gap-6 overflow-hidden", className)}>
      {children}
    </div>
  )
}

export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "text-xs font-medium uppercase tracking-wider text-muted-foreground/70",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SidebarGroupContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>
}

export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex flex-col space-y-1", className)}>{children}</div>
}

export function SidebarMenuItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("min-h-[32px]", className)}>{children}</div>
}

export function SidebarMenuButton({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-x-3 font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export function SidebarTrigger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-[32px] w-full cursor-pointer items-center justify-between rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}
