import Link from 'next/link'
import { FrownIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FrownIcon className="w-10 h-10 text-muted-foreground" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested quote.</p>
      <Link
        href="/quotes"
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go Back
      </Link>
    </main>
  )
} 