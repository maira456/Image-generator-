'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Images, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BulkUploadProps {
  onSubmit: (prompt: string, images: File[]) => void
  isLoading: boolean
}

export function BulkUpload({ onSubmit, isLoading }: BulkUploadProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'))
    const newFiles = [...selectedImages, ...fileArray].slice(0, 10)
    setSelectedImages(newFiles)
    
    // Generate previews
    const newPreviews: string[] = []
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === newFiles.length) {
          setPreviews([...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }, [selectedImages])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelect(e.target.files)
    }
  }

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    setSelectedImages([])
    setPreviews([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || selectedImages.length === 0 || isLoading) return
    onSubmit(prompt.trim(), selectedImages)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      handleFilesSelect(e.dataTransfer.files)
    }
  }, [handleFilesSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Images className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Bulk Background Change</h3>
          <p className="text-sm text-muted-foreground">Upload up to 10 images and change all backgrounds with one prompt</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            "hover:border-primary hover:bg-primary/5",
            selectedImages.length > 0 ? "border-primary/50 bg-primary/5" : "border-border"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop images here or click to select
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedImages.length}/10 images selected
          </p>
        </div>

        {/* Image Previews */}
        {previews.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Selected Images</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={preview}
                    alt={`Selected ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="mt-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            Background Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the new background (e.g., 'professional studio lighting with white background', 'tropical beach at sunset')"
            disabled={isLoading}
            rows={2}
            className="w-full bg-input border border-border rounded-xl p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!prompt.trim() || selectedImages.length === 0 || isLoading}
          className="w-full mt-4 h-12 rounded-xl font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing {selectedImages.length} images...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Change Backgrounds ({selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'})
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
