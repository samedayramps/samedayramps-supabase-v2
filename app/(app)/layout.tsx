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
      <Header>
        <MobileNav />
      </Header>
      <div className="flex flex-1">
        <Sidebar className="w-64 flex-none">
          <Nav />
        </Sidebar>
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 