'use client'

import { useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { ImageGallery } from '@/components/image-gallery'
import { PromptInput } from '@/components/prompt-input'
import type { GeneratedImage, GenerationResult } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function Home() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPrompt, setLoadingPrompt] = useState<string>('')
  const { toast } = useToast()

  const handleGenerate = useCallback(async (prompt: string, attachedImage: File | null) => {
    setIsLoading(true)
    setLoadingPrompt(prompt)
    
    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      if (attachedImage) {
        formData.append('image', attachedImage)
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const result: GenerationResult = await response.json()

      if (result.images && result.images.length > 0) {
        const newImages: GeneratedImage[] = result.images.map((img, index) => ({
          id: `${Date.now()}-${index}`,
          base64: img.base64,
          mediaType: img.mediaType,
          prompt,
          timestamp: new Date(),
          isEdit: !!attachedImage,
          sourceImageUrl: attachedImage ? URL.createObjectURL(attachedImage) : undefined,
        }))

        setImages((prev) => [...newImages, ...prev])

        toast({
          title: attachedImage ? 'Image edited successfully' : 'Image generated successfully',
          description: result.text || `Created ${newImages.length} ${newImages.length === 1 ? 'image' : 'images'}`,
        })
      } else {
        toast({
          title: 'No image generated',
          description: result.text || 'The model did not return any images. Try a different prompt.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setLoadingPrompt('')
    }
  }, [toast])

  const handleClear = useCallback(() => {
    setImages([])
    toast({
      title: 'Gallery cleared',
      description: 'All images have been removed',
    })
  }, [toast])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header imageCount={images.length} onClear={handleClear} />
      
      <main className="flex-1 flex flex-col">
        <ImageGallery images={images} isLoading={isLoading} loadingPrompt={loadingPrompt} />
      </main>
      
      <PromptInput onSubmit={handleGenerate} isLoading={isLoading} />
      <Toaster />
    </div>
  )
}
