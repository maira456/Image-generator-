'use client'

import { useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { ImageGallery } from '@/components/image-gallery'
import { PromptInput } from '@/components/prompt-input'
import { BulkUpload } from '@/components/bulk-upload'
import type { GeneratedImage, GenerationResult } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { Wand2, Images } from 'lucide-react'

type Mode = 'single' | 'bulk'

export default function Home() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPrompt, setLoadingPrompt] = useState<string>('')
  const [mode, setMode] = useState<Mode>('single')
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

  const handleBulkEdit = useCallback(async (prompt: string, imageFiles: File[]) => {
    setIsLoading(true)
    setLoadingPrompt(`Processing ${imageFiles.length} images: ${prompt}`)
    
    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      imageFiles.forEach((file) => {
        formData.append('images', file)
      })

      const response = await fetch('/api/bulk-edit', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process images')
      }

      const result = await response.json()

      if (result.images && result.images.length > 0) {
        const newImages: GeneratedImage[] = result.images.map((img: { base64: string; mediaType: string; originalIndex: number }, index: number) => ({
          id: `bulk-${Date.now()}-${index}`,
          base64: img.base64,
          mediaType: img.mediaType,
          prompt: `Background: ${prompt}`,
          timestamp: new Date(),
          isEdit: true,
        }))

        setImages((prev) => [...newImages, ...prev])

        toast({
          title: 'Bulk edit completed',
          description: `Successfully processed ${result.processedCount} of ${result.totalCount} images`,
        })
      } else {
        toast({
          title: 'No images processed',
          description: 'Failed to process any images. Try different images or prompt.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Bulk edit error:', error)
      toast({
        title: 'Bulk edit failed',
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
        {/* Mode Tabs */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="inline-flex bg-secondary rounded-xl p-1">
            <button
              onClick={() => setMode('single')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                mode === 'single'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Wand2 className="w-4 h-4" />
              Generate / Edit
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                mode === 'bulk'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Images className="w-4 h-4" />
              Bulk Background
            </button>
          </div>
        </div>

        {mode === 'bulk' ? (
          <div className="flex-1 flex flex-col p-6">
            <div className="max-w-2xl mx-auto w-full">
              <BulkUpload onSubmit={handleBulkEdit} isLoading={isLoading} />
            </div>
            {images.length > 0 && (
              <div className="mt-6">
                <ImageGallery images={images} isLoading={false} loadingPrompt="" />
              </div>
            )}
          </div>
        ) : (
          <>
            <ImageGallery images={images} isLoading={isLoading} loadingPrompt={loadingPrompt} />
          </>
        )}
      </main>
      
      {mode === 'single' && (
        <PromptInput onSubmit={handleGenerate} isLoading={isLoading} />
      )}
      <Toaster />
    </div>
  )
}
