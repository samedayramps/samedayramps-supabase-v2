"use client"

import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useToast } from "@/components/hooks/use-toast"

interface DataTableRowActionsProps {
  editHref?: string
  deleteAction?: () => Promise<void>
}

export function DataTableRowActions({
  editHref,
  deleteAction,
}: DataTableRowActionsProps) {
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      await deleteAction?.()
      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    } catch (error) {
      console.error('Failed to delete:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {editHref && (
          <DropdownMenuItem asChild>
            <Link href={editHref} className="flex items-center">
              <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Edit
            </Link>
          </DropdownMenuItem>
        )}
        {deleteAction && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="flex items-center text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 