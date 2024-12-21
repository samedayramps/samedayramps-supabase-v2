"use client"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside className={cn(
      "hidden border-r bg-background md:block",
      className
    )}>
      <ScrollArea className="flex h-full w-full flex-col">
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </ScrollArea>
    </aside>
  )
} 