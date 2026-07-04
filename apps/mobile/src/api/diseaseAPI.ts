import { storage } from '../utils/storage'

const API_URL = 'http://localhost:3000/api'

export interface DiseaseSummary {
  id: string
  name: string
  severity: string
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const diseaseAPI = {
  async list(take = 100): Promise<DiseaseSummary[]> {
    const headers = await getHeaders()
    const params = new URLSearchParams({ take: String(take) })
    const res = await fetch(`${API_URL}/diseases?${params}`, { headers })
    if (!res.ok) throw new Error('Failed to load diseases')
    const json = await res.json()
    return (json.data ?? []).map((d: any) => ({ id: d.id, name: d.name, severity: d.severity }))
  },

  async search(query: string): Promise<DiseaseSummary[]> {
    const headers = await getHeaders()
    const params = new URLSearchParams({ q: query })
    const res = await fetch(`${API_URL}/diseases/search?${params}`, { headers })
    if (!res.ok) throw new Error('Search failed')
    const json = await res.json()
    return (json ?? []).map((d: any) => ({ id: d.id, name: d.name, severity: d.severity }))
  },
}