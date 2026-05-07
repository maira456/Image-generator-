'use client'

import { Download, Sparkles, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { GeneratedImage } from '@/lib/types'

interface ImageCardProps {
  image: GeneratedImage
}

export function ImageCard({ image }: ImageCardProps) {
  const handleDownload = () => {
    // Create a download link for the base64 image
    const link = document.createElement('a')
    link.href = `data:${image.mediaType};base64,${image.base64}`
    link.download = `ai-generated-${image.id}.${image.mediaType.split('/')[1]}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="group relative overflow-hidden bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="aspect-square relative">
        <img
          src={`data:${image.mediaType};base64,${image.base64}`}
          alt={image.prompt}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {image.isEdit ? (
                  <>
                    <Pencil className="w-3 h-3" />
                    <span>Edited</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Generated</span>
                  </>
                )}
              </div>
              <Button
                onClick={handleDownload}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Prompt preview */}
      <div className="p-3 border-t border-border">
        <p className="text-sm text-muted-foreground line-clamp-2">{image.prompt}</p>
      </div>
    </Card>
  )
}
