'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { getNotes, deleteNote } from '@/lib/queries/notes'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { ConfirmDialog } from '@/components/common/confirm-dialog'

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
  onNoteDeleted?: () => void
}

export function NotesList({ customerId, maxHeight = '400px', onNoteDeleted }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const { user } = useUser()

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

  const handleDelete = async (noteId: string) => {
    if (!user) return
    
    try {
      setDeleting(noteId)
      await deleteNote(noteId)
      setNotes(notes.filter(note => note.id !== noteId))
      onNoteDeleted?.()
    } catch (error) {
      console.error('Error deleting note:', error)
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  if (loading) {
    return <div>Loading notes...</div>
  }

  if (notes.length === 0) {
    return <div className="text-muted-foreground">No notes yet</div>
  }

  return (
    <>
      <ScrollArea className={`pr-4 ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="group flex items-start justify-between space-x-2">
              <div className="flex-1 space-y-1">
                <div className="text-sm text-muted-foreground">
                  {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')} by{' '}
                  {note.created_by.first_name} {note.created_by.last_name}
                </div>
                <div className="text-sm whitespace-pre-wrap">{note.content}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setConfirmDelete(note.id)}
                disabled={deleting === note.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
} 