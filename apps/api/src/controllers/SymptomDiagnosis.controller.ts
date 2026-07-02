import type { Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are a veterinary triage assistant helping a pet owner understand a cat's symptoms. You are NOT a replacement for a licensed veterinarian and must never present a diagnosis as certain.

Respond with ONLY a raw JSON object — no markdown code fences, no preamble, no explanation — matching exactly this schema:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "possibleDiseases": [
    { "name": string, "likelihood": number, "reasoning": string }
  ],
  "suggestedActions": string[],
  "recommendedMedicines": string[],
  "urgentWarning": string | null
}

Rules:
- "possibleDiseases": 2-5 entries ordered by likelihood (0-100) descending. Use common, real veterinary condition names (e.g. "Feline Lower Urinary Tract Disease", "Upper Respiratory Infection"), not vague guesses.
- "riskLevel" reflects how urgently the animal needs veterinary attention based on the symptoms described.
- "suggestedActions": 3-6 concrete, safe next steps the owner can take right now (e.g. monitor water intake, isolate from other pets, book a vet visit within 24h).
- "recommendedMedicines": generic medicine names that a vet might reasonably prescribe for these conditions — NEVER include dosages, and NEVER imply the owner should self-administer without veterinary guidance. Return an empty array if none are appropriate to mention.
- "urgentWarning": if riskLevel is "HIGH" or "CRITICAL", set this to a short, direct sentence telling the owner to seek in-person veterinary or emergency care immediately. Otherwise null.
- Always err on the side of caution when symptoms could indicate an emergency (e.g. straining to urinate in male cats, difficulty breathing, seizures, collapse).`

interface AiDiagnosisResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  possibleDiseases: { name: string; likelihood: number; reasoning: string }[]
  suggestedActions: string[]
  recommendedMedicines: string[]
  urgentWarning: string | null
}

export async function analyzeSymptoms(req: AuthRequest, res: Response) {
  const { symptoms, behaviorChanges, catContext } = req.body as {
    symptoms?: string
    behaviorChanges?: string
    catContext?: string
  }

  const parsedSymptoms: string[] = symptoms ? JSON.parse(symptoms) : []

  if (parsedSymptoms.length === 0 && !behaviorChanges?.trim()) {
    res.status(400).json({ error: 'Please describe at least one symptom or behavior change' })
    return
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? []
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

  const userTextParts = [
    contextLines.length > 0 ? `Cat context:\n${contextLines.join('\n')}` : null,
    parsedSymptoms.length > 0 ? `Reported symptoms: ${parsedSymptoms.join(', ')}` : null,
    behaviorChanges?.trim() ? `Behavior changes noted by owner: ${behaviorChanges.trim()}` : null,
    files.length > 0 ? `${files.length} photo(s) of the affected area are attached.` : null,
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

  let aiResult: AiDiagnosisResult

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contentBlocks }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from AI model')
    }

    const cleaned = textBlock.text.replace(/```json|```/g, '').trim()
    aiResult = JSON.parse(cleaned)
  } catch (err) {
    console.error('Symptom diagnosis AI error:', err)
    res.status(502).json({ error: 'Failed to analyze symptoms. Please try again.' })
    return
  }

  const riskLevel: AiDiagnosisResult['riskLevel'] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(
    aiResult.riskLevel
  )
    ? aiResult.riskLevel
    : 'MEDIUM'

  // ── Cross-reference predicted diseases against the verified library ────────
  const possibleDiseases = await Promise.all(
    (aiResult.possibleDiseases ?? []).slice(0, 5).map(async (d) => {
      const matched = await prisma.disease.findFirst({
        where: { name: { contains: d.name, mode: 'insensitive' } },
        include: {
          diseaseMedicines: { include: { medicine: true } },
        },
      })

      return {
        name: d.name,
        likelihood: Math.max(0, Math.min(100, Math.round(d.likelihood ?? 0))),
        reasoning: d.reasoning ?? '',
        matched: matched
          ? {
              id: matched.id,
              name: matched.name,
              severity: matched.severity,
              description: matched.description,
              recoveryPeriod: matched.recoveryPeriod,
              linkedMedicines: matched.diseaseMedicines.map((dm) => ({
                id: dm.medicine.id,
                name: dm.medicine.name,
                dosage: dm.medicine.dosage,
              })),
            }
          : null,
      }
    })
  )

  // ── Cross-reference recommended medicine names, plus anything linked to matched diseases ──
  const medicineNameSet = new Set<string>(
    (aiResult.recommendedMedicines ?? []).map((m) => m.toLowerCase())
  )
  for (const pd of possibleDiseases) {
    for (const lm of pd.matched?.linkedMedicines ?? []) {
      medicineNameSet.add(lm.name.toLowerCase())
    }
  }

  const recommendedMedicines = await Promise.all(
    Array.from(medicineNameSet).map(async (name) => {
      const matched = await prisma.medicine.findFirst({
        where: { name: { contains: name, mode: 'insensitive' } },
      })
      return {
        name: matched?.name ?? name,
        matched: matched
          ? {
              id: matched.id,
              name: matched.name,
              dosage: matched.dosage,
              manufacturer: matched.manufacturer,
            }
          : null,
      }
    })
  )

  res.json({
    riskLevel,
    possibleDiseases,
    suggestedActions: (aiResult.suggestedActions ?? []).slice(0, 6),
    recommendedMedicines,
    urgentWarning: riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? aiResult.urgentWarning ?? null : null,
  })
}