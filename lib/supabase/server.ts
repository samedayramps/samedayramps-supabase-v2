import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from '@/types/database.types'

export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
} 