'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NotesForm } from './notes-form'
import { NotesList } from './notes-list'

interface NotesProps {
  customerId: string
}

export function Notes({ customerId }: NotesProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNoteAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <NotesForm customerId={customerId} onNoteAdded={handleNoteAdded} />
        <NotesList customerId={customerId} key={refreshKey} />
      </CardContent>
    </Card>
  )
} 