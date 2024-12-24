'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/hooks/use-user'
import { addNote } from '@/lib/queries/notes'

interface NotesFormProps {
  customerId: string
  onNoteAdded?: () => void
}

export function NotesForm({ customerId, onNoteAdded }: NotesFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsSubmitting(true)
      await addNote(customerId, content, user.id)
      setContent('')
      onNoteAdded?.()
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note..."
        className="min-h-[100px]"
      />
      <Button type="submit" disabled={!content.trim() || isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Note'}
      </Button>
    </form>
  )
} 