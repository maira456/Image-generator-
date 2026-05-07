'use client'

import { Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  imageCount: number
  onClear: () => void
}

export function Header({ imageCount, onClear }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-lg">AI Image Studio</h1>
            <p className="text-xs text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {imageCount > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                {imageCount} {imageCount === 1 ? 'image' : 'images'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-muted-foreground hover:text-destructive gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
