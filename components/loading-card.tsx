'use client'

import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface LoadingCardProps {
  prompt: string
}

export function LoadingCard({ prompt }: LoadingCardProps) {
  return (
    <Card className="overflow-hidden bg-card border-border shadow-lg">
      <div className="aspect-square relative bg-secondary/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Loader2 className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground">Generating...</p>
        </div>
      </div>
      <div className="p-3 border-t border-border">
        <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
      </div>
    </Card>
  )
}
