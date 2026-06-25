import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface CatBreed {
  id: string
  name: string
  origin: string
  description: string
  physicalAppearance: string
  weightRange: string
  lifespan: string
  temperament: string[]
  personality: string
  imageUrls: string[]
  createdAt: string
  updatedAt: string
}

export interface CatBreedListResponse {
  data: CatBreed[]
  pagination: { total: number; skip: number; take: number; hasMore: boolean }
}

export const catBreedAPI = {
  create: async (
    data: {
      name: string
      origin: string
      description: string
      physicalAppearance: string
      weightRange: string
      lifespan: string
      temperament: string[]
      personality: string
    },
    imageFiles?: File[]
  ) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('origin', data.origin)
    formData.append('description', data.description)
    formData.append('physicalAppearance', data.physicalAppearance)
    formData.append('weightRange', data.weightRange)
    formData.append('lifespan', data.lifespan)
    formData.append('temperament', JSON.stringify(data.temperament))
    formData.append('personality', data.personality)
    if (imageFiles) {
      imageFiles.forEach((file) => formData.append('images', file))
    }
    return apiClient.post<CatBreed>('/cat-breeds', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getById: async (id: string) => apiClient.get<CatBreed>(`/cat-breeds/${id}`),

  list: async (skip = 0, take = 12, search?: string) =>
    apiClient.get<CatBreedListResponse>('/cat-breeds', {
      params: { skip, take, search },
    }),

  search: async (query: string) =>
    apiClient.get<CatBreed[]>('/cat-breeds/search', { params: { q: query } }),

  update: async (
    id: string,
    data: {
      name?: string
      origin?: string
      description?: string
      physicalAppearance?: string
      weightRange?: string
      lifespan?: string
      temperament?: string[]
      personality?: string
      existingImageUrls?: string[]
    },
    imageFiles?: File[]
  ) => {
    const formData = new FormData()
    if (data.name !== undefined) formData.append('name', data.name)
    if (data.origin !== undefined) formData.append('origin', data.origin)
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.physicalAppearance !== undefined) formData.append('physicalAppearance', data.physicalAppearance)
    if (data.weightRange !== undefined) formData.append('weightRange', data.weightRange)
    if (data.lifespan !== undefined) formData.append('lifespan', data.lifespan)
    if (data.temperament !== undefined) formData.append('temperament', JSON.stringify(data.temperament))
    if (data.personality !== undefined) formData.append('personality', data.personality)
    if (data.existingImageUrls !== undefined)
      formData.append('existingImageUrls', JSON.stringify(data.existingImageUrls))
    if (imageFiles) {
      imageFiles.forEach((file) => formData.append('images', file))
    }
    return apiClient.put<CatBreed>(`/cat-breeds/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  delete: async (id: string) => apiClient.delete(`/cat-breeds/${id}`),
}