export interface GeneratedImage {
  id: string
  base64: string
  mediaType: string
  prompt: string
  timestamp: Date
  isEdit: boolean
  sourceImageUrl?: string
}

export interface GenerationResult {
  text: string | null
  images: Array<{ base64: string; mediaType: string }>
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason?: string
}
