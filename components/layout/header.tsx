import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { AuthHeader } from "@/components/auth/auth-header"
import { cn } from "@/lib/utils"

interface HeaderProps {
  children: React.ReactNode
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile Menu Toggle */}
          {children}
          
          {/* Desktop Logo */}
          <Link 
            href="/" 
            className="hidden items-center space-x-2 md:flex"
            aria-label="Same Day Ramps Dashboard"
          >
            <span className="hidden font-bold sm:inline-block">
              Same Day Ramps
            </span>
          </Link>
        </div>

        {/* Mobile Logo - Centered */}
        <div className="flex flex-1 items-center justify-center md:hidden">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
            aria-label="Same Day Ramps Dashboard"
          >
            <span className="font-bold">Same Day Ramps</span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <AuthHeader />
            <ThemeSwitcher />
          </nav>
        </div>
      </div>
    </header>
  )
} 