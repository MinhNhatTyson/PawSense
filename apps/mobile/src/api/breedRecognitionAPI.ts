import { storage } from '../utils/storage'
import { API_URL } from '../config'

export interface MatchedBreed {
  id: string
  name: string
  origin: string
  weightRange: string
  lifespan: string
  imageUrls: string[]
}

export interface BreedRecognitionResult {
  breedName: string
  confidence: number
  description: string
  characteristics: string[]
  temperament: string[]
  careInstructions: string[]
  isMixedOrUnclear: boolean
  matchedBreed: MatchedBreed | null
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Same web/native FormData handling pattern used in catProfileAPI.ts
async function appendImageToFormData(formData: FormData, uri: string): Promise<void> {
  if (uri.startsWith('blob:') || uri.startsWith('data:')) {
    const response = await fetch(uri)
    const blob = await response.blob()
    const mimeType = blob.type || 'image/jpeg'
    const ext = mimeType.split('/')[1] ?? 'jpg'
    formData.append('image', blob, `cat-scan.${ext}`)
  } else {
    const ext = uri.split('.').pop() ?? 'jpg'
    formData.append('image', {
      uri,
      name: `cat-scan.${ext}`,
      type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    } as any)
  }
}

export const breedRecognitionAPI = {
  async analyze(imageUri: string): Promise<BreedRecognitionResult> {
    const headers = await getHeaders()
    const formData = new FormData()
    await appendImageToFormData(formData, imageUri)

    const res = await fetch(`${API_URL}/breed-recognition/analyze`, {
      method: 'POST',
      headers: { ...headers },
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to analyze image')
    return json
  },
}