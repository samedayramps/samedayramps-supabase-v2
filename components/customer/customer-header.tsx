"use client"

import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CopyButton } from "@/components/common/copy-button"
import { getNotes } from "@/lib/queries/notes"
import { useEffect, useState, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CustomerHeaderProps {
  customer: Tables<"customers"> & {
    addresses?: Tables<"addresses">[]
  }
  actions?: React.ReactNode
}

type Note = {
  id: string
  content: string
  created_at: string
}

export function CustomerHeader({ customer, actions }: CustomerHeaderProps) {
  const address = customer.addresses?.[0]
  const [notes, setNotes] = useState<Note[]>([])
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    async function fetchNotes() {
      try {
        const fetchedNotes = await getNotes(customer.id)
        setNotes(fetchedNotes)
      } catch (error) {
        console.error('Error fetching notes:', error)
      }
    }
    fetchNotes()
  }, [customer.id])

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight
      setContentHeight(Math.min(height + 32, 200)) // Add padding and set max height
    }
  }, [notes])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl truncate">
            {`${customer.first_name} ${customer.last_name}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {customer.email && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex items-center gap-2">
                  <a 
                    href={`mailto:${customer.email}`}
                    className="text-sm hover:text-foreground transition-colors"
                  >
                    {customer.email}
                  </a>
                  <CopyButton value={customer.email} />
                </div>
              </PopoverContent>
            </Popover>
          )}

          {customer.phone && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex items-center gap-2">
                  <a 
                    href={`tel:${customer.phone}`}
                    className="text-sm hover:text-foreground transition-colors"
                  >
                    {customer.phone}
                  </a>
                  <CopyButton value={customer.phone} />
                </div>
              </PopoverContent>
            </Popover>
          )}

          {address && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <div>
                      {[
                        address.street_number,
                        address.street_name,
                      ].filter(Boolean).join(' ')}
                    </div>
                    <div className="text-muted-foreground">
                      {[
                        address.city,
                        address.state,
                        address.postal_code
                      ].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <CopyButton value={address.formatted_address} />
                </div>
              </PopoverContent>
            </Popover>
          )}

          {actions}
        </div>
      </div>

      {notes.length > 0 && (
        <ScrollArea 
          className="rounded-md border bg-muted/5 p-4"
          style={{ height: contentHeight }}
        >
          <p ref={contentRef} className="text-sm text-muted-foreground">
            {notes.map((note, index) => (
              <span key={note.id}>
                {note.content}
                {index < notes.length - 1 && " • "}
              </span>
            ))}
          </p>
        </ScrollArea>
      )}
    </div>
  )
} 