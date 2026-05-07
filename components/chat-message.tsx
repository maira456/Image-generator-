"use client"

import { User, Sparkles, Download, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatMessageProps {
  type: "user" | "assistant"
  content: {
    text: string
    image?: {
      data: string
      mimeType: string
      preview?: string
    }
  }
  timestamp: number
}

export function ChatMessage({ type, content, timestamp }: ChatMessageProps) {
  const handleDownload = () => {
    if (!content.image) return
    const link = document.createElement("a")
    link.href = `data:${content.image.mimeType};base64,${content.image.data}`
    link.download = `ai-image-${timestamp}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={`flex gap-4 ${type === "user" ? "justify-end" : "justify-start"}`}>
      {type === "assistant" && (
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-2xl ${type === "user" ? "order-first" : ""}`}>
        {type === "user" ? (
          <div className="flex flex-col items-end gap-2">
            {content.image?.preview && (
              <div className="bg-muted rounded-lg p-2 inline-flex items-center gap-2">
                <img
                  src={content.image.preview}
                  alt="Attached image"
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs">Editing</span>
                </div>
              </div>
            )}
            <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-sm">
              <p className="text-sm">{content.text}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {content.text && (
              <div className="bg-muted text-foreground px-4 py-3 rounded-2xl rounded-tl-sm">
                <p className="text-sm">{content.text}</p>
              </div>
            )}
            {content.image && (
              <div className="relative group overflow-hidden rounded-2xl shadow-lg bg-card">
                <img
                  src={`data:${content.image.mimeType};base64,${content.image.data}`}
                  alt="Generated image"
                  className="w-full h-auto max-w-lg"
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
            )}
          </div>
        )}
      </div>
      
      {type === "user" && (
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  )
}
