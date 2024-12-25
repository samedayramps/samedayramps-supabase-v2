"use client"

import { Notes } from "@/components/customer/notes-drawer"

interface CustomerLayoutProps {
  children: React.ReactNode
  params: {
    id: string
  }
}

export default function CustomerLayout({ children, params }: CustomerLayoutProps) {
  return (
    <>
      {children}
      <Notes customerId={params.id} variant="drawer" />
    </>
  )
} 