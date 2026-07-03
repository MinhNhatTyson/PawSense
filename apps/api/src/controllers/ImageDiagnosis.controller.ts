import type { Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const BODY_AREA_LABELS: Record<string, string> = {
  SKIN: 'skin and coat',
  EYE: 'eyes',
  EAR: 'ears',
}

function buildSystemPrompt(bodyAreaLabel: string): string {
  return `You are a veterinary visual triage assistant analyzing photo(s) of a cat's ${bodyAreaLabel} for visible abnormalities. You are NOT a replacement for a licensed veterinarian and must never present a diagnosis as certain — you are estimating from visual signs only.

Respond with ONLY a raw JSON object — no markdown code fences, no preamble, no explanation — matching exactly this schema:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "possibleDiseases": [
    { "name": string, "confidence": number, "reasoning": string }
  ],
  "recommendedNextSteps": string[],
  "urgentWarning": string | null
}

Rules:
- "possibleDiseases": 2-5 entries ordered by confidence (0-100) descending. Use common, real veterinary condition names relevant to the ${bodyAreaLabel} (e.g. for eyes: "Conjunctivitis", "Corneal Ulceration"; for skin: "Flea Allergy Dermatitis", "Ringworm"; for ears: "Otitis Externa", "Ear Mites"). Base "reasoning" strictly on visible signs in the photo(s) — redness, discharge, swelling, hair loss, lesions, discolouration, etc.
- If the image does not clearly show the stated body area, or shows no visible abnormality, say so plainly in the first entry's reasoning and keep confidence low.
- "riskLevel" reflects how urgently the animal needs veterinary attention based on what is visible.
- "recommendedNextSteps": 3-6 concrete, safe next steps the owner can take right now (e.g. keep the area clean and dry, prevent scratching/licking, book a vet visit within 24-48h, seek emergency care).
- "urgentWarning": if riskLevel is "HIGH" or "CRITICAL", set this to a short, direct sentence telling the owner to seek in-person veterinary or emergency care immediately (e.g. signs consistent with a rapidly progressing corneal ulcer or severe infection). Otherwise null.
- Never recommend specific medications or dosages — defer all treatment decisions to a licensed veterinarian.`
}

interface AiImageDiagnosisResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  possibleDiseases: { name: string; confidence: number; reasoning: string }[]
  recommendedNextSteps: string[]
  urgentWarning: string | null
}

export async function analyzeImage(req: AuthRequest, res: Response) {
  const { bodyArea, catContext } = req.body as {
    bodyArea?: string
    catContext?: string
  }

  const normalizedArea = (bodyArea ?? '').toUpperCase()
  if (!['SKIN', 'EYE', 'EAR'].includes(normalizedArea)) {
    res.status(400).json({ error: 'bodyArea must be one of SKIN, EYE, or EAR' })
    return
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  if (files.length === 0) {
    res.status(400).json({ error: 'At least one image is required' })
    return
  }
  if (files.length > 5) {
    res.status(400).json({ error: 'A maximum of 5 images is allowed' })
    return
  }
  for (const file of files) {
    if (!file.mimetype.startsWith('image/')) {
      res.status(400).json({ error: 'All uploaded files must be images' })
      return
    }
  }

  let parsedCatContext: { breed?: string; ageYears?: number; ageMonths?: number; gender?: string } | null = null
  try {
    parsedCatContext = catContext ? JSON.parse(catContext) : null
  } catch {
    parsedCatContext = null
  }

  const contextLines: string[] = []
  if (parsedCatContext) {
    if (parsedCatContext.breed) contextLines.push(`Breed: ${parsedCatContext.breed}`)
    if (parsedCatContext.gender) contextLines.push(`Gender: ${parsedCatContext.gender}`)
    if (parsedCatContext.ageYears != null || parsedCatContext.ageMonths != null) {
      contextLines.push(
        `Age: ${parsedCatContext.ageYears ?? 0} years ${parsedCatContext.ageMonths ?? 0} months`
      )
    }
  }

  const bodyAreaLabel = BODY_AREA_LABELS[normalizedArea]!

  const userTextParts = [
    `Body area photographed: ${bodyAreaLabel}`,
    contextLines.length > 0 ? `Cat context:\n${contextLines.join('\n')}` : null,
    `${files.length} photo(s) of the ${bodyAreaLabel} are attached for analysis.`,
  ].filter(Boolean)

  const contentBlocks: Anthropic.MessageParam['content'] = [
    ...files.map((file) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
        data: file.buffer.toString('base64'),
      },
    })),
    { type: 'text' as const, text: userTextParts.join('\n\n') },
  ]

  let aiResult: AiImageDiagnosisResult

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: buildSystemPrompt(bodyAreaLabel),
      messages: [{ role: 'user', content: contentBlocks }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from AI model')
    }

    const cleaned = textBlock.text.replace(/```json|```/g, '').trim()
    aiResult = JSON.parse(cleaned)
  } catch (err) {
    console.error('Image diagnosis AI error:', err)
    res.status(502).json({ error: 'Failed to analyze image. Please try again.' })
    return
  }

  const riskLevel: AiImageDiagnosisResult['riskLevel'] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(
    aiResult.riskLevel
  )
    ? aiResult.riskLevel
    : 'MEDIUM'

  // ── Cross-reference predicted diseases against the verified library ────────
  const possibleDiseases = await Promise.all(
    (aiResult.possibleDiseases ?? []).slice(0, 5).map(async (d) => {
      const matched = await prisma.disease.findFirst({
        where: { name: { contains: d.name, mode: 'insensitive' } },
      })

      return {
        name: d.name,
        confidence: Math.max(0, Math.min(100, Math.round(d.confidence ?? 0))),
        reasoning: d.reasoning ?? '',
        matched: matched
          ? {
              id: matched.id,
              name: matched.name,
              severity: matched.severity,
              description: matched.description,
              recoveryPeriod: matched.recoveryPeriod,
            }
          : null,
      }
    })
  )

  res.json({
    bodyArea: normalizedArea,
    riskLevel,
    possibleDiseases,
    recommendedNextSteps: (aiResult.recommendedNextSteps ?? []).slice(0, 6),
    urgentWarning: riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? aiResult.urgentWarning ?? null : null,
  })
}