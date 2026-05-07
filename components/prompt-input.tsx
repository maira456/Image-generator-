"use client"

import { useState, useRef } from "react"
import { Send, Paperclip, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PromptInputProps {
  onSubmit: (prompt: string, image: File | null) => void
  isLoading: boolean
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("")
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setAttachedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setAttachedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return
    onSubmit(prompt, attachedImage)
    setPrompt("")
    removeImage()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 p-3 bg-muted rounded-lg">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Attached image"
              className="w-16 h-16 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Image attached</p>
            <p className="text-xs text-muted-foreground">
              Describe how you want to edit this image
            </p>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {attachedImage ? (
            <ImageIcon className="w-5 h-5 text-primary" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </Button>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={attachedImage ? "Describe the edit you want..." : "Describe the image you want to create..."}
          disabled={isLoading}
          className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base py-2"
        />

        <Button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-3">
        {attachedImage 
          ? "Edit mode: Your image will be modified based on your prompt"
          : "Generate mode: A new image will be created from your prompt"
        }
      </p>
    </form>
  )
}
