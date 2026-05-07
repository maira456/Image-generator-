'use client'

import { useState, useRef, useCallback } from 'react'
import { Paperclip, ArrowUp, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PromptInputProps {
  onSubmit: (prompt: string, image: File | null) => void
  isLoading: boolean
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleImageSelect = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      setAttachedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleRemoveImage = () => {
    setAttachedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return
    onSubmit(prompt.trim(), attachedImage)
    setPrompt('')
    handleRemoveImage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageSelect(file)
    }
  }, [handleImageSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4">
      <form 
        onSubmit={handleSubmit}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="max-w-3xl mx-auto"
      >
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Attached"
                className="h-20 w-20 rounded-lg object-cover border border-border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
        )}

        {/* Input Container */}
        <div className="relative flex items-end gap-2 bg-input rounded-2xl border border-border p-2 shadow-lg focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
          {/* Attach Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={cn(
              "shrink-0 h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
              attachedImage && "text-primary"
            )}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={attachedImage ? "Describe how to edit this image..." : "Describe the image you want to create..."}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground py-2.5 px-1 min-h-[44px] max-h-32"
            style={{ 
              height: 'auto',
              overflow: 'hidden'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 128) + 'px'
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            size="icon"
            className={cn(
              "shrink-0 h-10 w-10 rounded-xl transition-all duration-200",
              prompt.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          {attachedImage ? 'Image attached for editing' : 'Type a prompt to generate an image, or attach an image to edit it'}
        </p>
      </form>
    </div>
  )
}
