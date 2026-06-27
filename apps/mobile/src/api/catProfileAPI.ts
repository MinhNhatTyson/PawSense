import { storage } from '../utils/storage'

const API_URL = 'http://localhost:3000/api'

export type CatGender = 'MALE' | 'FEMALE' | 'UNKNOWN'

export interface Vaccination {
  id: string
  catProfileId: string
  vaccineName: string
  dateGiven: string
  nextDueDate?: string | null
  veterinarian?: string | null
  notes?: string | null
  createdAt: string
}

export interface CatProfile {
  id: string
  ownerId: string
  name: string
  gender: CatGender
  birthDate?: string | null
  ageYears?: number | null
  ageMonths?: number | null
  weightKg?: number | null
  breed?: string | null
  color?: string | null
  notes?: string | null
  imageUrls: string[]
  vaccinations: Vaccination[]
  createdAt: string
  updatedAt: string
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const catProfileAPI = {
  async list(): Promise<CatProfile[]> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/cat-profiles`, { headers })
    if (!res.ok) throw new Error('Failed to load cat profiles')
    return res.json()
  },

  async getById(id: string): Promise<CatProfile> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/cat-profiles/${id}`, { headers })
    if (!res.ok) throw new Error('Cat profile not found')
    return res.json()
  },

  async create(
    data: {
      name: string
      gender: CatGender
      ageYears?: number
      ageMonths?: number
      weightKg?: number
      breed?: string
      color?: string
      notes?: string
      vaccinations?: Array<{
        vaccineName: string
        dateGiven: string
        nextDueDate?: string
        veterinarian?: string
        notes?: string
      }>
    },
    imageUris?: string[]
  ): Promise<CatProfile> {
    const headers = await getHeaders()
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('gender', data.gender)
    if (data.ageYears !== undefined) formData.append('ageYears', String(data.ageYears))
    if (data.ageMonths !== undefined) formData.append('ageMonths', String(data.ageMonths))
    if (data.weightKg !== undefined) formData.append('weightKg', String(data.weightKg))
    if (data.breed) formData.append('breed', data.breed)
    if (data.color) formData.append('color', data.color)
    if (data.notes) formData.append('notes', data.notes)
    if (data.vaccinations) formData.append('vaccinations', JSON.stringify(data.vaccinations))

    if (imageUris) {
      imageUris.forEach((uri, idx) => {
        const ext = uri.split('.').pop() ?? 'jpg'
        formData.append('images', {
          uri,
          name: `cat-photo-${idx}.${ext}`,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        } as any)
      })
    }

    const res = await fetch(`${API_URL}/cat-profiles`, {
      method: 'POST',
      headers: { ...headers },
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to create cat profile')
    return json
  },

  async update(
    id: string,
    data: {
      name?: string
      gender?: CatGender
      ageYears?: number
      ageMonths?: number
      weightKg?: number
      breed?: string
      color?: string
      notes?: string
      existingImageUrls?: string[]
      vaccinations?: Array<{
        vaccineName: string
        dateGiven: string
        nextDueDate?: string
        veterinarian?: string
        notes?: string
      }>
    },
    imageUris?: string[]
  ): Promise<CatProfile> {
    const headers = await getHeaders()
    const formData = new FormData()

    if (data.name !== undefined) formData.append('name', data.name)
    if (data.gender !== undefined) formData.append('gender', data.gender)
    if (data.ageYears !== undefined) formData.append('ageYears', String(data.ageYears))
    if (data.ageMonths !== undefined) formData.append('ageMonths', String(data.ageMonths))
    if (data.weightKg !== undefined) formData.append('weightKg', String(data.weightKg))
    if (data.breed !== undefined) formData.append('breed', data.breed)
    if (data.color !== undefined) formData.append('color', data.color)
    if (data.notes !== undefined) formData.append('notes', data.notes)
    if (data.existingImageUrls !== undefined)
      formData.append('existingImageUrls', JSON.stringify(data.existingImageUrls))
    if (data.vaccinations !== undefined)
      formData.append('vaccinations', JSON.stringify(data.vaccinations))

    if (imageUris) {
      imageUris.forEach((uri, idx) => {
        const ext = uri.split('.').pop() ?? 'jpg'
        formData.append('images', {
          uri,
          name: `cat-photo-${idx}.${ext}`,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        } as any)
      })
    }

    const res = await fetch(`${API_URL}/cat-profiles/${id}`, {
      method: 'PUT',
      headers: { ...headers },
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to update cat profile')
    return json
  },

  async delete(id: string): Promise<void> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/cat-profiles/${id}`, {
      method: 'DELETE',
      headers,
    })
    if (!res.ok) throw new Error('Failed to delete cat profile')
  },
}