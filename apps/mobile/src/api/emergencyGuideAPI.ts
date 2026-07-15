import { apiFetch } from '../utils/apiFetch'

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

export const emergencyGuideAPI = {
  async list(params?: { search?: string; category?: string; urgency?: Urgency }): Promise<EmergencyGuide[]> {
    const query = new URLSearchParams({ status: 'APPROVED' })
    if (params?.search) query.set('search', params.search)
    if (params?.category) query.set('category', params.category)
    if (params?.urgency) query.set('urgency', params.urgency)

    const res = await apiFetch(`/emergency-guides?${query}`)
    if (!res.ok) throw new Error('Failed to load emergency guides')
    return res.json()
  },

  async getById(id: string): Promise<EmergencyGuide> {
    const res = await apiFetch(`/emergency-guides/${id}`)
    if (!res.ok) throw new Error('Emergency guide not found')
    return res.json()
  },
}