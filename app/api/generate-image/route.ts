import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const prompt = formData.get('prompt') as string
    const imageFile = formData.get('image') as File | null

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Build the content array for the model
    const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: string; mimeType: string }> = []

    // If an image is provided, include it for editing
    if (imageFile) {
      const imageBuffer = await imageFile.arrayBuffer()
      const base64Image = Buffer.from(imageBuffer).toString('base64')
      content.push({
        type: 'image',
        image: base64Image,
        mimeType: imageFile.type,
      })
    }

    // Add the text prompt
    content.push({
      type: 'text',
      text: imageFile
        ? `Edit this image according to the following instructions: ${prompt}`
        : prompt,
    })

    const result = await generateText({
      model: google('gemini-2.0-flash-exp', {
        useSearchGrounding: false,
      }),
      providerOptions: {
        google: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      },
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    })

    const images: Array<{ base64: string; mediaType: string }> = []
    if (result.files) {
      for (const file of result.files) {
        if (file.mediaType?.startsWith('image/')) {
          images.push({
            base64: file.base64 as string,
            mediaType: file.mediaType,
          })
        }
      }
    }

    return Response.json({
      text: result.text,
      images,
      usage: result.usage,
      finishReason: result.finishReason,
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}
