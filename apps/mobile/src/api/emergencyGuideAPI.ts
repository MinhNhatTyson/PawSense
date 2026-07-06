import { storage } from '../utils/storage'
import { API_URL } from '../config'

export type Urgency = 'CRITICAL' | 'URGENT'

export interface EmergencyGuide {
  id: string
  title: string
  category: string
  urgency: Urgency
  summary: string
  emergencySymptoms: string[]
  firstAidSteps: string[]
  doNots: string[]
  whenToSeekVet: string
  imageUrl?: string | null
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const emergencyGuideAPI = {
  async list(params?: { search?: string; category?: string; urgency?: Urgency }): Promise<EmergencyGuide[]> {
    const headers = await getHeaders()
    const query = new URLSearchParams({ status: 'APPROVED' })
    if (params?.search) query.set('search', params.search)
    if (params?.category) query.set('category', params.category)
    if (params?.urgency) query.set('urgency', params.urgency)

    const res = await fetch(`${API_URL}/emergency-guides?${query}`, { headers })
    if (!res.ok) throw new Error('Failed to load emergency guides')
    return res.json()
  },

  async getById(id: string): Promise<EmergencyGuide> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/emergency-guides/${id}`, { headers })
    if (!res.ok) throw new Error('Emergency guide not found')
    return res.json()
  },
}