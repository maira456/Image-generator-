import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const prompt = formData.get('prompt') as string
    const imageFiles = formData.getAll('images') as File[]

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!imageFiles || imageFiles.length === 0) {
      return Response.json({ error: 'At least one image is required' }, { status: 400 })
    }

    if (imageFiles.length > 10) {
      return Response.json({ error: 'Maximum 10 images allowed' }, { status: 400 })
    }

    // Process each image individually for best results
    const processedImages: Array<{ base64: string; mediaType: string; originalIndex: number }> = []

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i]
      
      try {
        const imageBuffer = await imageFile.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString('base64')

        const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: string; mimeType: string }> = [
          {
            type: 'image',
            image: base64Image,
            mimeType: imageFile.type,
          },
          {
            type: 'text',
            text: `Edit this image: ${prompt}. Keep the main subject intact and only change the background as instructed.`,
          },
        ]

        const result = await generateText({
          model: google('gemini-2.0-flash-exp-image-generation'),
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

        if (result.files) {
          for (const file of result.files) {
            if (file.mediaType?.startsWith('image/')) {
              processedImages.push({
                base64: file.base64 as string,
                mediaType: file.mediaType,
                originalIndex: i,
              })
            }
          }
        }
      } catch (imageError) {
        console.error(`Error processing image ${i + 1}:`, imageError)
        // Continue with other images even if one fails
      }
    }

    if (processedImages.length === 0) {
      return Response.json(
        { error: 'Failed to process any images. Try a different prompt or images.' },
        { status: 500 }
      )
    }

    return Response.json({
      images: processedImages,
      processedCount: processedImages.length,
      totalCount: imageFiles.length,
    })
  } catch (error) {
    console.error('Bulk edit error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to process images' },
      { status: 500 }
    )
  }
}
