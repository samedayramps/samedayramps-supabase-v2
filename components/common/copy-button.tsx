'use client'

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/components/hooks/use-toast"

interface CopyButtonProps {
  value: string
  className?: string
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast({
        description: "Copied to clipboard"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard"
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className || "h-6 w-6"}
      onClick={handleCopy}
    >
      <Copy className="h-3 w-3" />
    </Button>
  )
} 