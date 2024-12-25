'use client'

import { useState } from "react"
import { type Tables } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/hooks/use-toast"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MessageSquarePlus, Save, X } from "lucide-react"
import { formatDate } from "@/lib/utils"

type Note = Tables<"notes">

interface NotesDrawerProps {
  customerId: string
  userId: string
  className?: string
}

export function NotesDrawer({ customerId, userId, className }: NotesDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch notes"
      })
      return
    }

    setNotes(data)
  }

  const handleOpen = async (open: boolean) => {
    setIsOpen(open)
    if (open) {
      await fetchNotes()
    }
  }

  const handleSave = async () => {
    if (!newNote.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Note content cannot be empty"
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("notes")
        .insert({
          content: newNote,
          customer_id: customerId,
          created_by: userId
        })

      if (error) throw error

      await fetchNotes()
      setNewNote("")
      toast({
        title: "Success",
        description: "Note added successfully"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save note"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[80vh] sm:h-[70vh] p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5" />
              <h2 className="font-semibold">Customer Notes</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {/* New Note Input */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add Note</Label>
                    <Textarea
                      placeholder="Type your note here..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading || !newNote.trim()}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Note
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Notes List */}
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id} className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(note.created_at)}
                      </p>
                      <p className="whitespace-pre-wrap">{note.content}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 