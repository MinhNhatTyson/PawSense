import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export type FlagStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED'
export type FlagContentType = 'DISEASE' | 'MEDICINE' | 'EMERGENCY_GUIDE'

export interface ContentFlag {
  id: string
  contentType: FlagContentType
  contentId: string
  reason: string
  status: FlagStatus
  resolverNote?: string
  createdAt: string
  raisedBy: { id: string; email: string; profile?: { fullName?: string } }
  resolvedBy?: { id: string; email: string; profile?: { fullName?: string } }
}

export interface PendingItem {
  id: string
  name: string
  status: 'DRAFT' | 'FLAGGED'
  createdAt: string
  createdBy?: { id: string; email: string; profile?: { fullName?: string } }
  // Disease-specific
  severity?: string
  // Medicine-specific
  dosage?: string
}

export interface PendingContent {
  diseases: PendingItem[]
  medicines: PendingItem[]
}

export const verificationAPI = {
  approveDisease: (id: string) =>
    apiClient.patch(`/verification/diseases/${id}/approve`),

  approveMedicine: (id: string) =>
    apiClient.patch(`/verification/medicines/${id}/approve`),

  approveEmergencyGuide: (id: string) =>                            
    apiClient.patch(`/verification/emergency-guides/${id}/approve`),

  raiseFlag: (data: { contentType: FlagContentType; contentId: string; reason: string }) =>
    apiClient.post<ContentFlag>('/verification/flags', data),

  listFlags: (params?: { status?: FlagStatus; contentType?: FlagContentType }) =>
    apiClient.get<ContentFlag[]>('/verification/flags', { params }),

  resolveFlag: (id: string, resolverNote?: string) =>
    apiClient.patch(`/verification/flags/${id}/resolve`, { resolverNote }),

  dismissFlag: (id: string, resolverNote?: string) =>
    apiClient.patch(`/verification/flags/${id}/dismiss`, { resolverNote }),

  listPending: () =>
    apiClient.get<PendingContent>('/verification/pending'),
}