'use client'

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Nav } from "./nav"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Navigation</SheetTitle>
            <Button
              variant="ghost"
              className="absolute right-4 top-3 h-auto p-2"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetHeader>
          <Nav className="flex-1 px-2 py-4" />
        </div>
      </SheetContent>
    </Sheet>
  )
} 