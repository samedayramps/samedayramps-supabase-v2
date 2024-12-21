"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { ImageIcon, Loader2, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/hooks/use-toast"

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  onRemove: (url: string) => void
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true)
      
      const newUrls = []
      
      for (const file of acceptedFiles) {
        // Create a unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        
        // Upload the file to Supabase storage
        const { data, error } = await supabase
          .storage
          .from('installation-photos')
          .upload(fileName, file)
          
        if (error) {
          throw error
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('installation-photos')
          .getPublicUrl(data.path)
          
        newUrls.push(publicUrl)
      }
      
      onChange([...value, ...newUrls])
      
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      })
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload images",
      })
    } finally {
      setIsUploading(false)
    }
  }, [value, onChange, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm text-muted-foreground">Drop the files here...</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Drag & drop images here, or click to select
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Max file size: 5MB
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {value.map((url) => (
            <div key={url} className="relative group">
              <div className="aspect-square relative">
                <Image
                  src={url}
                  alt="Installation photo"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition"
                onClick={() => onRemove(url)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 