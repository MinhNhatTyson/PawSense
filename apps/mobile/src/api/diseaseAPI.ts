import { apiFetch } from '../utils/apiFetch'

export interface DiseaseSummary {
  id: string
  name: string
  severity: string
}

export const diseaseAPI = {
  async list(take = 100): Promise<DiseaseSummary[]> {
    const params = new URLSearchParams({ take: String(take) })
    const res = await apiFetch(`/diseases?${params}`)
    if (!res.ok) throw new Error('Failed to load diseases')
    const json = await res.json()
    return (json.data ?? []).map((d: any) => ({ id: d.id, name: d.name, severity: d.severity }))
  },

  async search(query: string): Promise<DiseaseSummary[]> {
    const params = new URLSearchParams({ q: query })
    const res = await apiFetch(`/diseases/search?${params}`)
    if (!res.ok) throw new Error('Search failed')
    const json = await res.json()
    return (json ?? []).map((d: any) => ({ id: d.id, name: d.name, severity: d.severity }))
  },
}