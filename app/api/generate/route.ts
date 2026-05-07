import { GoogleGenAI } from "@google/genai"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const prompt = formData.get("prompt") as string
    const imageFile = formData.get("image") as File | null

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    let contents: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = []

    // Add text prompt
    contents.push({ text: prompt })

    // Add image if provided (for editing)
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      const base64 = Buffer.from(bytes).toString("base64")
      contents.push({
        inlineData: {
          mimeType: imageFile.type,
          data: base64,
        },
      })
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: contents,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    })

    // Process response parts
    const result: { text?: string; image?: { data: string; mimeType: string } } = {}

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          result.text = part.text
        } else if (part.inlineData) {
          result.image = {
            data: part.inlineData.data as string,
            mimeType: part.inlineData.mimeType as string,
          }
        }
      }
    }

    if (!result.image) {
      return Response.json(
        { error: "No image was generated. Try a different prompt." },
        { status: 400 }
      )
    }

    return Response.json(result)
  } catch (error) {
    console.error("Generation error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    )
  }
}
