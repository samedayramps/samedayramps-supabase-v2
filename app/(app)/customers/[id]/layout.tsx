"use client"

import { NotesDrawer } from "@/components/customer/notes-drawer"
import { useUser } from "@/hooks/use-user"

interface CustomerLayoutProps {
  children: React.ReactNode
  params: {
    id: string
  }
}

export default function CustomerLayout({ children, params }: CustomerLayoutProps) {
  const { user } = useUser()

  if (!user) {
    return children
  }

  return (
    <>
      {children}
      <NotesDrawer 
        customerId={params.id} 
        userId={user.id}
        className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
      />
    </>
  )
} 