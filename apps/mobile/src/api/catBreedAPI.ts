import { storage } from '../utils/storage'

const API_URL = 'http://localhost:3000/api'

export interface CatBreedSummary {
  id: string
  name: string
  origin: string
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const catBreedAPI = {
  async list(take = 100): Promise<CatBreedSummary[]> {
    const headers = await getHeaders()
    const params = new URLSearchParams({ take: String(take) })
    const res = await fetch(`${API_URL}/cat-breeds?${params}`, { headers })
    if (!res.ok) throw new Error('Failed to load cat breeds')
    const json = await res.json()
    return (json.data ?? []).map((b: any) => ({ id: b.id, name: b.name, origin: b.origin }))
  },

  async search(query: string): Promise<CatBreedSummary[]> {
    const headers = await getHeaders()
    const params = new URLSearchParams({ q: query })
    const res = await fetch(`${API_URL}/cat-breeds/search?${params}`, { headers })
    if (!res.ok) throw new Error('Search failed')
    const json = await res.json()
    return (json ?? []).map((b: any) => ({ id: b.id, name: b.name, origin: b.origin }))
  },
}