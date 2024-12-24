'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { getNotes } from '@/lib/queries/notes'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Note {
  id: string
  content: string
  created_at: string
  created_by: {
    first_name: string
    last_name: string
  }
}

interface NotesListProps {
  customerId: string
  maxHeight?: string
}

export function NotesList({ customerId, maxHeight = '400px' }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes(customerId)
        setNotes(data)
      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [customerId])

  if (loading) {
    return <div>Loading notes...</div>
  }

  if (notes.length === 0) {
    return <div className="text-muted-foreground">No notes yet</div>
  }

  return (
    <ScrollArea className={`pr-4 ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')} by{' '}
              {note.created_by.first_name} {note.created_by.last_name}
            </div>
            <div className="text-sm whitespace-pre-wrap">{note.content}</div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 