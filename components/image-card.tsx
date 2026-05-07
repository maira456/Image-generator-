"use client"

import { Download, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ImageCardProps {
  imageData: string
  mimeType: string
  prompt: string
  timestamp: number
}

export function ImageCard({ imageData, mimeType, prompt, timestamp }: ImageCardProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = `data:${mimeType};base64,${imageData}`
    link.download = `ai-image-${timestamp}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="overflow-hidden bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative group">
        <img
          src={`data:${mimeType};base64,${imageData}`}
          alt={prompt}
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
        <Button
          onClick={handleDownload}
          size="lg"
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download
        </Button>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
        </div>
      </div>
    </Card>
  )
}
