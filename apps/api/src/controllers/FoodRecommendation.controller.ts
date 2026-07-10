import type { Response } from 'express'
import { getGeminiModel, cleanJsonText } from '../lib/gemini.js'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

const SYSTEM_PROMPT = `You are a feline nutrition assistant helping a pet owner choose an appropriate diet for their cat. You are NOT a replacement for a licensed veterinarian and must never present dietary advice as a substitute for prescribed veterinary treatment.

Respond with ONLY a raw JSON object — no markdown code fences, no preamble, no explanation — matching exactly this schema:
{
  "dietaryProfile": string,
  "recommendedCategory": "KITTEN" | "ADULT" | "SENIOR" | "PRESCRIPTION",
  "keyNutrientFocus": string[],
  "avoidIngredients": string[],
  "generalGuidance": string[],
  "urgentWarning": string | null
}

Rules:
- "dietaryProfile": 1-2 sentence summary of the ideal diet type for this cat (e.g. "A low-phosphorus, controlled-protein renal support diet with added omega-3 fatty acids").
- "recommendedCategory": choose "PRESCRIPTION" whenever a health condition is mentioned that typically requires a therapeutic/prescription diet (e.g. kidney disease, diabetes, urinary issues, food allergies). Otherwise choose based on age: KITTEN (<12 months), SENIOR (7+ years), ADULT otherwise.
- "keyNutrientFocus": 3-6 nutrients or dietary features to prioritize (e.g. "low phosphorus", "high moisture content", "omega-3 fatty acids", "limited-ingredient protein source").
- "avoidIngredients": 2-5 ingredients or nutrient excesses to avoid given the breed/age/condition — only if relevant, otherwise return general common irritants.
- "generalGuidance": 3-6 concrete, practical feeding tips (portioning, transition advice, hydration, feeding frequency).
- "urgentWarning": if the health condition described is serious enough that diet alone is not sufficient and a vet must supervise (e.g. kidney disease, diabetes, pancreatitis), set a short direct sentence urging veterinary consultation before changing diet. Otherwise null.
- Never recommend a specific commercial brand or product by name — describe the type of diet needed instead.`

interface AiFoodResult {
  dietaryProfile: string
  recommendedCategory: 'KITTEN' | 'ADULT' | 'SENIOR' | 'PRESCRIPTION'
  keyNutrientFocus: string[]
  avoidIngredients: string[]
  generalGuidance: string[]
  urgentWarning: string | null
}

export async function analyzeFoodRecommendation(req: AuthRequest, res: Response) {
  const ownerId = req.userId!
  const {
    catProfileId,
    breedId,
    ageYears,
    ageMonths,
    weightKg,
    healthConditionIds,
    healthConditionNotes,
  } = req.body as {
    catProfileId?: string
    breedId?: string
    ageYears?: number
    ageMonths?: number
    weightKg?: number
    healthConditionIds?: string[]
    healthConditionNotes?: string
  }

  // ── Resolve source of truth: an existing cat profile overrides manual input ──
  let resolvedBreedId: string | undefined = breedId
  let resolvedAgeYears: number | undefined = ageYears
  let resolvedAgeMonths: number | undefined = ageMonths
  let resolvedWeightKg: number | undefined = weightKg
  let diagnosedDiseaseIds: string[] = []
  let catName: string | undefined

  if (catProfileId) {
    const catProfile = await prisma.catProfile.findUnique({
      where: { id: catProfileId },
      include: { diagnoses: { select: { diseaseId: true } } },
    })
    if (!catProfile || catProfile.ownerId !== ownerId) {
      res.status(404).json({ error: 'Cat profile not found' })
      return
    }
    resolvedBreedId = catProfile.breedId ?? undefined
    resolvedAgeYears = catProfile.ageYears ?? undefined
    resolvedAgeMonths = catProfile.ageMonths ?? undefined
    resolvedWeightKg = catProfile.weightKg ?? undefined
    diagnosedDiseaseIds = catProfile.diagnoses.map((d: { diseaseId: string }) => d.diseaseId)
    catName = catProfile.name
  }

  // Merge vet-recorded diagnoses (from CatDiagnosis) with any ad hoc selections
  // made just for this search — ad hoc selections are NOT persisted as diagnoses,
  // since CatDiagnosis is vet-writable only.
  const mergedDiseaseIds = Array.from(
    new Set([...diagnosedDiseaseIds, ...(healthConditionIds ?? [])])
  )

  const hasAnyInput =
    !!resolvedBreedId ||
    resolvedAgeYears != null ||
    resolvedAgeMonths != null ||
    resolvedWeightKg != null ||
    mergedDiseaseIds.length > 0 ||
    !!healthConditionNotes?.trim()

  if (!hasAnyInput) {
    res.status(400).json({ error: 'Please provide at least breed, age, weight, or a health condition' })
    return
  }

  const [breed, selectedDiseases] = await Promise.all([
    resolvedBreedId ? prisma.catBreed.findUnique({ where: { id: resolvedBreedId } }) : Promise.resolve(null),
    mergedDiseaseIds.length > 0
      ? prisma.disease.findMany({ where: { id: { in: mergedDiseaseIds } }, select: { id: true, name: true } })
      : Promise.resolve([] as { id: string; name: string }[]),
  ])

  const totalAgeMonths =
    resolvedAgeYears != null || resolvedAgeMonths != null
      ? (resolvedAgeYears ?? 0) * 12 + (resolvedAgeMonths ?? 0)
      : null

  const contextLines: string[] = []
  if (catName) contextLines.push(`Cat name: ${catName}`)
  if (breed) contextLines.push(`Breed: ${breed.name}`)
  if (resolvedAgeYears != null || resolvedAgeMonths != null) {
    contextLines.push(`Age: ${resolvedAgeYears ?? 0} years ${resolvedAgeMonths ?? 0} months`)
  }
  if (resolvedWeightKg != null) contextLines.push(`Weight: ${resolvedWeightKg} kg`)
  if (selectedDiseases.length > 0) {
    contextLines.push(`Diagnosed/suspected health conditions: ${selectedDiseases.map((d: { name: string }) => d.name).join(', ')}`)
  }
  if (healthConditionNotes?.trim()) {
    contextLines.push(`Additional notes from owner: ${healthConditionNotes.trim()}`)
  }

  const normalizeAi = (raw: any): AiFoodResult => {
    const toStrArray = (v: any): string[] => {
      if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean)
      return []
    }

    const allowed = new Set(['KITTEN', 'ADULT', 'SENIOR', 'PRESCRIPTION'])
    const cat =
      typeof raw?.recommendedCategory === 'string' && allowed.has(raw.recommendedCategory)
        ? (raw.recommendedCategory as AiFoodResult['recommendedCategory'])
        : 'ADULT'

    const urgent = raw?.urgentWarning
    const urgentWarning = urgent == null || urgent === '' ? null : String(urgent)

    return {
      dietaryProfile: typeof raw?.dietaryProfile === 'string' ? raw.dietaryProfile : '',
      recommendedCategory: cat,
      keyNutrientFocus: toStrArray(raw?.keyNutrientFocus).slice(0, 6),
      avoidIngredients: toStrArray(raw?.avoidIngredients).slice(0, 5),
      generalGuidance: toStrArray(raw?.generalGuidance).slice(0, 6),
      urgentWarning,
    }
  }

  const extractFirstJsonObject = (text: string): string | null => {
    const start = text.indexOf('{')
    if (start === -1) return null

    let depth = 0
    for (let i = start; i < text.length; i++) {
      const ch = text[i]
      if (ch === '{') depth++
      if (ch === '}') {
        depth--
        if (depth === 0) return text.slice(start, i + 1)
      }
    }
    return null
  }

  const fallbackByCategory = async (): Promise<AiFoodResult> => {
    const safeCategory = (() => {
      if (totalAgeMonths == null) return 'ADULT' as const
      if (totalAgeMonths < 12) return 'KITTEN' as const
      if (totalAgeMonths >= 84) return 'SENIOR' as const
      return 'ADULT' as const
    })()

    return {
      dietaryProfile:
        safeCategory === 'KITTEN'
          ? 'A complete, balanced kitten diet formulated for growth with appropriate energy and protein.'
          : safeCategory === 'SENIOR'
            ? 'A complete, balanced senior diet designed to support mobility and healthy digestion.'
            : 'A complete, balanced adult diet designed to meet daily nutrient needs.',
      recommendedCategory: safeCategory,
      keyNutrientFocus:
        safeCategory === 'KITTEN'
          ? ['high-quality protein', 'appropriate calories for growth', 'DHA/omega-3 (if included)']
          : safeCategory === 'SENIOR'
            ? ['joint-support nutrients', 'high digestibility', 'controlled calories']
            : ['balanced protein', 'essential fatty acids', 'digestive support'],
      avoidIngredients: ['excessive fillers', 'unknown ingredients'],
      generalGuidance: [
        'Feed the recommended amount based on the product label and your cat\'s body condition.',
        'Transition to any new diet gradually over 7–10 days to avoid GI upset.',
        'Ensure constant fresh water; wet diets can increase hydration.',
        'Monitor stool consistency and appetite during the transition.',
      ],
      urgentWarning: null,
    }
  }

  let aiResult: AiFoodResult

  try {
    const model = getGeminiModel(SYSTEM_PROMPT)
    const result = await model.generateContent(
      contextLines.join('\n') || 'No specific details provided.'
    )
    aiResult = JSON.parse(cleanJsonText(result.response.text()))
  } catch (err) {
    console.error('Food recommendation AI error:', err)
    res.status(502).json({ error: 'Failed to generate food recommendations. Please try again.' })
    return
  }

  const recommendedCategory: AiFoodResult['recommendedCategory'] = (
    ['KITTEN', 'ADULT', 'SENIOR', 'PRESCRIPTION'] as const
  ).includes(aiResult.recommendedCategory)
    ? aiResult.recommendedCategory
    : 'ADULT'

  // ── Cross-reference: real foods directly linked to the selected disease(s) ──
  // Disease -> DiseaseFood -> CatFood (direct relation — no Treatment detour)
  const conditionFoodMap = new Map<string, Set<string>>() // foodId -> disease names

  if (selectedDiseases.length > 0) {
    const diseaseFoods = await prisma.diseaseFood.findMany({
      where: { diseaseId: { in: selectedDiseases.map((d) => d.id) } },
      include: { disease: { select: { name: true } }, food: true },
    })

    for (const df of diseaseFoods) {
      const existing = conditionFoodMap.get(df.food.id) ?? new Set<string>()
      existing.add((df.disease as { name: string }).name)
      conditionFoodMap.set(df.food.id, existing)
    }

  }


  const conditionFoodIds = Array.from(conditionFoodMap.keys())
  const conditionFoods = conditionFoodIds.length > 0
    ? await prisma.catFood.findMany({ where: { id: { in: conditionFoodIds } } })
    : ([] as Awaited<ReturnType<typeof prisma.catFood.findMany>>)

  // ── Fallback / supplementary: general age-category match ────────────────────
  const generalWhere: Record<string, unknown> = {
    id: { notIn: conditionFoodIds },
  }
  if (recommendedCategory === 'PRESCRIPTION') {
    generalWhere.OR = [{ category: 'PRESCRIPTION' }, { prescriptionRequired: true }]
  } else {
    generalWhere.category = recommendedCategory
  }
  if (totalAgeMonths != null) {
    generalWhere.AND = [
      { OR: [{ ageMinMonths: null }, { ageMinMonths: { lte: totalAgeMonths } }] },
      { OR: [{ ageMaxMonths: null }, { ageMaxMonths: { gte: totalAgeMonths } }] },
    ]
  }

  const generalFoods = await prisma.catFood.findMany({
    where: generalWhere,
    take: 10,
    orderBy: { name: 'asc' },
  })

  const matchedFoods = [
    ...conditionFoods.map((f: any) => ({ food: f, matchedConditions: Array.from(conditionFoodMap.get(f.id) ?? []) })),
    ...generalFoods.map((f: any) => ({ food: f, matchedConditions: [] as string[] })),
  ].slice(0, 12)


  res.json({
    dietaryProfile: aiResult.dietaryProfile ?? '',
    recommendedCategory,
    keyNutrientFocus: (aiResult.keyNutrientFocus ?? []).slice(0, 6),
    avoidIngredients: (aiResult.avoidIngredients ?? []).slice(0, 5),
    generalGuidance: (aiResult.generalGuidance ?? []).slice(0, 6),
    urgentWarning: aiResult.urgentWarning ?? null,
    diagnosedConditions: selectedDiseases.map((d: { name: string }) => d.name),

    matchedFoods: matchedFoods.map(({ food, matchedConditions }) => ({
      id: food.id,
      name: food.name,
      brand: food.brand,
      category: food.category,
      foodType: food.foodType,
      description: food.description,
      protein: food.protein,
      fat: food.fat,
      fiber: food.fiber,
      moisture: food.moisture,
      calories: food.calories,
      ageMinMonths: food.ageMinMonths,
      ageMaxMonths: food.ageMaxMonths,
      weightRange: food.weightRange,
      allergens: food.allergens,
      prescriptionRequired: food.prescriptionRequired,
      imageUrl: food.imageUrl,
      matchedConditions,
    })),
  })
}