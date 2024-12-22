'use client'

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardCheck,
  Wrench,
  Receipt,
  CreditCard,
} from "lucide-react"

export const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Leads",
    icon: Users,
    href: "/leads",
    color: "text-violet-500",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/customers",
    color: "text-blue-500",
  },
  {
    label: "Quotes",
    icon: FileText,
    href: "/quotes",
    color: "text-pink-700",
  },
  {
    label: "Agreements",
    icon: ClipboardCheck,
    href: "/agreements",
    color: "text-orange-700",
  },
  {
    label: "Installations",
    icon: Wrench,
    href: "/installations",
    color: "text-emerald-500",
  },
  {
    label: "Invoices",
    icon: Receipt,
    href: "/invoices",
    color: "text-green-700",
  },
  {
    label: "Subscriptions",
    icon: CreditCard,
    href: "/subscriptions",
    color: "text-purple-700",
  },
] as const

export function Nav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("space-y-1", className)}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center p-3 w-full text-sm font-medium rounded-lg transition",
            "hover:text-primary hover:bg-primary/10",
            pathname === route.href
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          )}
        >
          <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
          {route.label}
        </Link>
      ))}
    </nav>
  )
} 