import { storage } from '../utils/storage'
import { API_URL } from '../config'

export type BodyArea = 'SKIN' | 'EYE' | 'EAR'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface MatchedDisease {
  id: string
  name: string
  severity: string
  description: string
  recoveryPeriod: string
}

export interface PossibleImageDisease {
  name: string
  confidence: number
  reasoning: string
  matched: MatchedDisease | null
}

export interface ImageDiagnosisResult {
  bodyArea: BodyArea
  riskLevel: RiskLevel
  possibleDiseases: PossibleImageDisease[]
  recommendedNextSteps: string[]
  urgentWarning: string | null
}

export interface CatContext {
  breed?: string
  gender?: string
  ageYears?: number
  ageMonths?: number
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
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
    formData.append('images', blob, `scan-photo-${index}.${ext}`)
  } else {
    const ext = uri.split('.').pop() ?? 'jpg'
    formData.append('images', {
      uri,
      name: `scan-photo-${index}.${ext}`,
      type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    } as any)
  }
}

export const imageDiagnosisAPI = {
  async analyze(
    bodyArea: BodyArea,
    imageUris: string[],
    catContext?: CatContext
  ): Promise<ImageDiagnosisResult> {
    const headers = await getHeaders()
    const formData = new FormData()

    formData.append('bodyArea', bodyArea)
    if (catContext) formData.append('catContext', JSON.stringify(catContext))

    for (let i = 0; i < imageUris.length; i++) {
      await appendImageToFormData(formData, imageUris[i]!, i)
    }

    const res = await fetch(`${API_URL}/image-diagnosis/analyze`, {
      method: 'POST',
      headers: { ...headers },
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to analyze image')
    return json
  },
}