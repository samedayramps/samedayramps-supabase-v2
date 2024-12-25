'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { type Tables } from "@/types/database.types"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

type NoteWithCustomer = Tables<"notes"> & {
  customers: {
    id: string
    first_name: string
    last_name: string
  } | null
}

export async function getNotes(customerId: string) {
  const cookieStore = cookies()
  const supabase = await createClient()

  const { data: notes, error } = await supabase
    .from("notes")
    .select(`
      *,
      customers (
        id,
        first_name,
        last_name
      )
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .returns<NoteWithCustomer[]>()

  if (error) {
    throw new Error(`Error fetching notes: ${error.message}`)
  }

  // Transform the data to match the expected format
  const transformedNotes = notes.map(note => ({
    ...note,
    created_by: {
      first_name: note.customers?.first_name || 'Unknown',
      last_name: note.customers?.last_name || ''
    }
  }))

  return transformedNotes
}

export async function addNote(customerId: string, content: string, userId: string) {
  const cookieStore = cookies()
  const supabase = await createClient()

  const { error } = await supabase
    .from("notes")
    .insert({
      customer_id: customerId,
      content,
      created_by: userId,
      created_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(`Error adding note: ${error.message}`)
  }
}

export async function updateNote(noteId: string, content: string) {
  const cookieStore = cookies()
  const supabase = await createClient()

  const { error } = await supabase
    .from("notes")
    .update({
      content,
      updated_at: new Date().toISOString()
    })
    .eq("id", noteId)

  if (error) {
    throw new Error(`Error updating note: ${error.message}`)
  }
}

export async function deleteNote(noteId: string) {
  const cookieStore = cookies()
  const supabase = await createClient()

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)

  if (error) {
    throw new Error(`Error deleting note: ${error.message}`)
  }
}

interface CreateNoteData {
  content: string
  customerId: string
}

export async function createNote(data: CreateNoteData) {
  const supabase = await createClient()
  const session = await auth()

  if (!session) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("notes")
    .insert({
      content: data.content,
      customer_id: data.customerId,
      created_by: session.user.id,
    })

  if (error) {
    throw new Error(`Error creating note: ${error.message}`)
  }

  revalidatePath(`/customers/${data.customerId}`)
} 