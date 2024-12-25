"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="h-full px-4 py-6 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
} 