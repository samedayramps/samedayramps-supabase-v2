"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Settings, Package, DollarSign } from "lucide-react"

const tabs = [
  {
    title: "General",
    href: "/settings",
    icon: Settings,
    description: "General application settings"
  },
  {
    title: "Components",
    href: "/settings/components",
    icon: Package,
    description: "Manage ramp sections and landings"
  },
  {
    title: "Pricing",
    href: "/settings/pricing",
    icon: DollarSign,
    description: "Configure pricing and fees"
  }
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 border-b">
        <nav className="-mb-px flex space-x-8" aria-label="Settings">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium transition-colors hover:text-foreground",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-muted"
                )}
              >
                <tab.icon className={cn(
                  "mr-3 h-4 w-4",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )} />
                {tab.title}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 