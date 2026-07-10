// after
import type { Response } from 'express'
import { getGeminiModel, cleanJsonText } from '../lib/gemini.js'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

const BREED_ANALYSIS_PROMPT = `You are a feline breed identification expert analyzing a photo of a cat.

Respond with ONLY a raw JSON object — no markdown code fences, no preamble, no explanation — matching exactly this schema:
{
  "breedName": string,
  "confidence": number,          // 0-100, your confidence in this breed identification
  "description": string,         // 2-3 sentence overview of the breed
  "characteristics": string[],   // 4-6 physical characteristics visible in or typical of this breed
  "temperament": string[],       // 4-6 temperament traits
  "careInstructions": string[],  // 4-6 practical care tips specific to this breed/coat type
  "isMixedOrUnclear": boolean    // true if this looks like a mixed breed / domestic shorthair or cannot be confidently identified
}

If the photo does not clearly show a purebred cat, set breedName to the closest general category (e.g. "Domestic Shorthair", "Domestic Longhair", "Mixed Breed"), set isMixedOrUnclear to true, use a lower confidence score, and give general care guidance suited to that coat/body type.
If the image does not contain a cat at all, set breedName to "Unknown" and confidence to 0.`

interface AiBreedResult {
  breedName: string
  confidence: number
  description: string
  characteristics: string[]
  temperament: string[]
  careInstructions: string[]
  isMixedOrUnclear: boolean
}

export async function analyzeBreed(req: AuthRequest, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: 'An image file is required' })
    return
  }

  const mimeType = req.file.mimetype
  if (!mimeType.startsWith('image/')) {
    res.status(400).json({ error: 'Uploaded file must be an image' })
    return
  }
  if (req.file.size > 8 * 1024 * 1024) {
    res.status(400).json({ error: 'Image must be smaller than 8MB' })
    return
  }

  // after
  const base64Image = req.file.buffer.toString('base64')
  let aiResult: AiBreedResult

  try {
    const model = getGeminiModel(BREED_ANALYSIS_PROMPT)
    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64Image } },
    ])

    aiResult = JSON.parse(cleanJsonText(result.response.text()))
  } catch (err) {
    console.error('Breed recognition AI error:', err)
    res.status(502).json({ error: 'Failed to analyze image. Please try again.' })
    return
  }

  // Cross-reference against the vet-curated CatBreed knowledge base for richer,
  // verified data when the AI's guess matches a known breed record.
  const matchedBreed = await prisma.catBreed.findFirst({
    where: { name: { equals: aiResult.breedName, mode: 'insensitive' } },
  })

  res.json({
    breedName: aiResult.breedName,
    confidence: Math.max(0, Math.min(100, Math.round(aiResult.confidence ?? 0))),
    description: aiResult.description ?? '',
    characteristics: aiResult.characteristics ?? [],
    temperament: aiResult.temperament ?? [],
    careInstructions: aiResult.careInstructions ?? [],
    isMixedOrUnclear: !!aiResult.isMixedOrUnclear,
    matchedBreed: matchedBreed
      ? {
          id: matchedBreed.id,
          name: matchedBreed.name,
          origin: matchedBreed.origin,
          weightRange: matchedBreed.weightRange,
          lifespan: matchedBreed.lifespan,
          imageUrls: matchedBreed.imageUrls,
        }
      : null,
  })
}