'use client'

import { ImageCard } from './image-card'
import { LoadingCard } from './loading-card'
import type { GeneratedImage } from '@/lib/types'
import { Sparkles } from 'lucide-react'

interface ImageGalleryProps {
  images: GeneratedImage[]
  isLoading?: boolean
  loadingPrompt?: string
}

export function ImageGallery({ images, isLoading, loadingPrompt }: ImageGalleryProps) {
  if (images.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          AI Image Generator & Editor
        </h2>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          Create stunning images from text descriptions or upload an image to edit it with AI. 
          Type your prompt below to get started.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/50">
            <span className="text-primary font-medium">Generate</span>
            <span className="text-xs text-center">Create from text</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/50">
            <span className="text-primary font-medium">Edit</span>
            <span className="text-xs text-center">Transform images</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/50">
            <span className="text-primary font-medium">Download</span>
            <span className="text-xs text-center">Save your work</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && loadingPrompt && (
            <LoadingCard prompt={loadingPrompt} />
          )}
          {images.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      </div>
    </div>
  )
}
