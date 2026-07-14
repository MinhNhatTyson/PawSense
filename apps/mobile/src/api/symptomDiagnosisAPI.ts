import { apiFetch } from '../utils/apiFetch'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface MatchedDisease {
  id: string
  name: string
  severity: string
  description: string
  recoveryPeriod: string
  linkedMedicines: { id: string; name: string; dosage: string }[]
}

export interface PossibleDisease {
  name: string
  likelihood: number
  reasoning: string
  matched: MatchedDisease | null
}

export interface MatchedMedicine {
  id: string
  name: string
  dosage: string
  manufacturer: string | null
}

export interface RecommendedMedicine {
  name: string
  matched: MatchedMedicine | null
}

export interface DiagnosisResult {
  riskLevel: RiskLevel
  possibleDiseases: PossibleDisease[]
  suggestedActions: string[]
  recommendedMedicines: RecommendedMedicine[]
  urgentWarning: string | null
}

export interface CatContext {
  breed?: string
  gender?: string
  ageYears?: number
  ageMonths?: number
}

// Same web/native FormData handling pattern used in catProfileAPI.ts / breedRecognitionAPI.ts
async function appendImageToFormData(
  formData: FormData,
  uri: string,
  index: number
): Promise<void> {
  if (uri.startsWith('blob:') || uri.startsWith('data:')) {
    const response = await fetch(uri)
    const blob = await response.blob()
    const mimeType = blob.type || 'image/jpeg'
    const ext = mimeType.split('/')[1] ?? 'jpg'
    formData.append('images', blob, `symptom-photo-${index}.${ext}`)
  } else {
    const ext = uri.split('.').pop() ?? 'jpg'
    formData.append('images', {
      uri,
      name: `symptom-photo-${index}.${ext}`,
      type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    } as any)
  }
}

export const symptomDiagnosisAPI = {
  async analyze(
    symptoms: string[],
    behaviorChanges: string,
    imageUris: string[],
    catContext?: CatContext
  ): Promise<DiagnosisResult> {
    const formData = new FormData()

    formData.append('symptoms', JSON.stringify(symptoms))
    if (behaviorChanges.trim()) formData.append('behaviorChanges', behaviorChanges.trim())
    if (catContext) formData.append('catContext', JSON.stringify(catContext))

    for (let i = 0; i < imageUris.length; i++) {
      await appendImageToFormData(formData, imageUris[i]!, i)
    }

    const res = await apiFetch('/symptom-diagnosis/analyze', {
      method: 'POST',
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to analyze symptoms')
    return json
  },
}