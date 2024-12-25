'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/hooks/use-toast"
import { createNote } from "@/lib/queries/notes"
import { StickyNote, X } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

function NotesForm({ customerId }: { customerId: string }) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await createNote({
        content: content.trim(),
        customerId,
      })
      setContent("")
      router.refresh()
      toast({
        title: "Success",
        description: "Note added successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note..."
        className="h-10 min-h-0 resize-none py-2"
      />
      <Button 
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="h-10 shrink-0"
      >
        Add Note
      </Button>
    </form>
  )
}

interface NotesDrawerProps {
  customerId: string
  variant?: "default" | "drawer"
}

export function Notes({ customerId, variant = "default" }: NotesDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === "drawer") {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            fixed h-14 w-14 rounded-full shadow-lg 
            hover:scale-105 transition-all duration-300 z-50
            ${isOpen 
              ? 'sm:bottom-[calc(6.5rem+1rem)] bottom-[calc(5.5rem+1rem)] rotate-180' 
              : 'bottom-8'
            }
            right-[max(2rem,calc(50vw-20rem))]
          `}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <StickyNote className="h-6 w-6" />
          )}
        </Button>
        <SheetContent 
          side="bottom" 
          className="h-fit bg-background border-t shadow-lg py-4 sm:py-6"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          showOverlay={false}
        >
          <VisuallyHidden asChild>
            <SheetTitle>Add Note</SheetTitle>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <SheetDescription>Add a note for this customer</SheetDescription>
          </VisuallyHidden>
          <div className="max-w-2xl mx-auto">
            <NotesForm customerId={customerId} />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="space-y-4">
      <NotesForm customerId={customerId} />
    </div>
  )
} 