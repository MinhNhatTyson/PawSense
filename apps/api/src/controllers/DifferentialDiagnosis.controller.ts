import type { Response } from 'express'
import { getGeminiModel, cleanJsonText } from '../lib/gemini.js'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

const SYSTEM_PROMPT = `You are a veterinary clinical decision support assistant. A veterinarian is presenting observed symptoms in a patient animal. Provide a differential diagnosis.

Respond with ONLY a raw JSON object — no markdown code fences, no preamble, no explanation — matching exactly this schema:
{
  "summary": string,
  "differentialDiagnoses": [
    {
      "rank": number,
      "diseaseName": string,
      "matchedDiseaseId": string | null,
      "confidenceLevel": "HIGH" | "MODERATE" | "LOW",
      "confidenceReasoning": string,
      "matchingSymptoms": string[],
      "missingSymptoms": string[],
      "suggestedTreatments": string[],
      "suggestedMedicines": string[],
      "urgency": "IMMEDIATE" | "URGENT" | "ROUTINE" | "MONITOR",
      "clinicalNotes": string
    }
  ],
  "generalRecommendations": string[],
  "disclaimer": string
}

Rules:
- Cross-reference against the provided PawSense knowledge base — if a matching disease exists, include its ID in matchedDiseaseId. If not in the knowledge base, set matchedDiseaseId to null.
- Rank by clinical likelihood given the presented symptoms.
- Provide specific clinical reasoning, not generic statements.
- Maximum 5 differential diagnoses.
- "disclaimer": a standard veterinary disclaimer noting this is AI-generated and not a substitute for in-person veterinary assessment.`

interface AiDifferentialResult {
  summary: string
  differentialDiagnoses: {
    rank: number
    diseaseName: string
    matchedDiseaseId: string | null
    confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW'
    confidenceReasoning: string
    matchingSymptoms: string[]
    missingSymptoms: string[]
    suggestedTreatments: string[]
    suggestedMedicines: string[]
    urgency: 'IMMEDIATE' | 'URGENT' | 'ROUTINE' | 'MONITOR'
    clinicalNotes: string
  }[]
  generalRecommendations: string[]
  disclaimer: string
}

export async function analyzeDifferentialDiagnosis(req: AuthRequest, res: Response) {
  const { symptomIds } = req.body as { symptomIds?: string[] }

  if (!symptomIds || !Array.isArray(symptomIds) || symptomIds.length < 2) {
    res.status(400).json({ error: 'Please provide at least 2 symptom IDs' })
    return
  }

  const [selectedSymptoms, allDiseases] = await Promise.all([
    prisma.symptom.findMany({ where: { id: { in: symptomIds } } }),
    prisma.disease.findMany({
      select: { id: true, name: true, severity: true, symptoms: true },
      take: 300,
    }),
  ])

  if (selectedSymptoms.length < 2) {
    res.status(400).json({ error: 'Could not find at least 2 matching symptoms' })
    return
  }

  const symptomDescriptions = selectedSymptoms
    .map(
      (s) =>
        `- ${s.name} (${s.commonality.toLowerCase()} commonality, ${s.onsetSpeed.toLowerCase()} onset${
          s.affectedBodyAreas?.length ? `, affects: ${s.affectedBodyAreas.join(', ')}` : ''
        }): ${s.description}`
    )
    .join('\n')

  const knowledgeBaseDiseases = allDiseases
    .map((d) => `- ID:${d.id} | ${d.name} (${d.severity} severity): symptoms include ${d.symptoms.slice(0, 5).join(', ')}`)
    .join('\n')

  const userPrompt = `## Observed Symptoms (${selectedSymptoms.length} total)
${symptomDescriptions}

## PawSense Knowledge Base Diseases (for cross-referencing)
${knowledgeBaseDiseases || 'No diseases currently in knowledge base.'}`

  let aiResult: AiDifferentialResult

  try {
    const model = getGeminiModel(SYSTEM_PROMPT)
    const result = await model.generateContent(userPrompt)
    aiResult = JSON.parse(cleanJsonText(result.response.text()))
  } catch (err) {
    console.error('Differential diagnosis AI error:', err)
    res.status(502).json({ error: 'Failed to run diagnosis. Please try again.' })
    return
  }

  const allowedConfidence = new Set(['HIGH', 'MODERATE', 'LOW'])
  const allowedUrgency = new Set(['IMMEDIATE', 'URGENT', 'ROUTINE', 'MONITOR'])

  const differentialDiagnoses = (aiResult.differentialDiagnoses ?? []).slice(0, 5).map((d, idx) => ({
    rank: d.rank ?? idx + 1,
    diseaseName: d.diseaseName ?? 'Unknown',
    matchedDiseaseId:
      d.matchedDiseaseId && allDiseases.some((dis) => dis.id === d.matchedDiseaseId)
        ? d.matchedDiseaseId
        : null,
    confidenceLevel: allowedConfidence.has(d.confidenceLevel) ? d.confidenceLevel : 'MODERATE',
    confidenceReasoning: d.confidenceReasoning ?? '',
    matchingSymptoms: Array.isArray(d.matchingSymptoms) ? d.matchingSymptoms : [],
    missingSymptoms: Array.isArray(d.missingSymptoms) ? d.missingSymptoms : [],
    suggestedTreatments: Array.isArray(d.suggestedTreatments) ? d.suggestedTreatments : [],
    suggestedMedicines: Array.isArray(d.suggestedMedicines) ? d.suggestedMedicines : [],
    urgency: allowedUrgency.has(d.urgency) ? d.urgency : 'ROUTINE',
    clinicalNotes: d.clinicalNotes ?? '',
  }))

  res.json({
    summary: aiResult.summary ?? '',
    differentialDiagnoses,
    generalRecommendations: (aiResult.generalRecommendations ?? []).slice(0, 8),
    disclaimer:
      aiResult.disclaimer ??
      'This is an AI-generated differential diagnosis for clinical decision support only and does not replace veterinary judgment and physical examination.',
  })
}