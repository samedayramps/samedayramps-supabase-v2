import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Nav } from "@/components/layout/nav"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="sticky top-0 z-50">
        <Header>
          <MobileNav />
        </Header>
      </div>
      <div className="flex flex-1">
        <Sidebar className="hidden md:flex w-64 flex-shrink-0 border-r">
          <Nav className="flex-1 px-4 py-6" />
        </Sidebar>
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 