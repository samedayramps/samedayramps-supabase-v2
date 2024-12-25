"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Settings, 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  ClipboardList,
  ClipboardCheck,
  CreditCard,
  UserCircle
} from "lucide-react"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

const mainNav = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    description: "Overview of your business"
  },
  {
    title: "Leads",
    href: "/leads",
    icon: Users,
    description: "Manage potential customers"
  },
  {
    title: "Customers",
    href: "/customers",
    icon: UserCircle,
    description: "View and manage customers"
  },
  {
    title: "Quotes",
    href: "/quotes",
    icon: FileText,
    description: "View and create quotes"
  },
  {
    title: "Agreements",
    href: "/agreements",
    icon: ClipboardCheck,
    description: "Manage service agreements"
  },
  {
    title: "Installations",
    href: "/installations",
    icon: Calendar,
    description: "Schedule and track installations"
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: ClipboardList,
    description: "Manage billing and payments"
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
    description: "Manage recurring payments"
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Configure application settings"
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <ShadcnSidebar className={cn("border-r bg-background", className)}>
        <SidebarContent className="pt-6">
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="px-6">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex h-10 items-center gap-x-3 rounded-md px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ShadcnSidebar>
    </TooltipProvider>
  )
} 