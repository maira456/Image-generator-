"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Wand2, ImageIcon, Trash2 } from "lucide-react"
import { PromptInput } from "@/components/prompt-input"
import { ChatMessage } from "@/components/chat-message"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (prompt: string, image: File | null) => {
    setError(null)
    
    // Create preview for user message if image is attached
    let imagePreview: string | undefined
    if (image) {
      imagePreview = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(image)
      })
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: {
        text: prompt,
        image: image ? {
          data: "",
          mimeType: image.type,
          preview: imagePreview
        } : undefined
      },
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("prompt", prompt)
      if (image) {
        formData.append("image", image)
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image")
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: {
          text: data.text || "Here's your generated image!",
          image: data.image,
        },
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">AI Image Generator</h1>
              <p className="text-xs text-muted-foreground">Powered by Gemini</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Wand2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2 text-balance">
                Create stunning images with AI
              </h2>
              <p className="text-muted-foreground max-w-md mb-8 text-balance">
                Describe what you want to see, or upload an image to edit it with AI-powered transformations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-foreground text-sm">Generate</h3>
                    <p className="text-xs text-muted-foreground">Create new images from text descriptions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-foreground text-sm">Edit</h3>
                    <p className="text-xs text-muted-foreground">Transform existing images with prompts</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="space-y-6 pb-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  type={message.type}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary-foreground animate-pulse" />
                  </div>
                  <div className="bg-muted text-muted-foreground px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  )
}
