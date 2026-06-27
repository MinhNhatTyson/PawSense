import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export type FoodCategory = 'KITTEN' | 'ADULT' | 'SENIOR' | 'PRESCRIPTION'
export type FoodType = 'DRY' | 'WET' | 'SEMI_MOIST' | 'RAW' | 'SUPPLEMENT'

export interface CatFood {
  id: string
  name: string
  brand: string
  category: FoodCategory
  foodType: FoodType
  description: string
  ingredients: string[]
  protein: number | null
  fat: number | null
  fiber: number | null
  moisture: number | null
  calories: number | null
  ageMinMonths: number | null
  ageMaxMonths: number | null
  weightRange: string | null
  allergens: string[]
  prescriptionRequired: boolean
  vetNotes: string | null
  imageUrl: string | null
  foodTreatments?: {
    id: string
    foodId: string
    treatmentId: string
    treatment: {
      id: string
      name: string
      estimatedDuration?: string
      successRate?: number
    }
  }[]
  createdAt: string
  updatedAt: string
}

export interface CatFoodListResponse {
  data: CatFood[]
  pagination: { total: number; skip: number; take: number; hasMore: boolean }
}

export type CatFoodInput = {
  name: string
  brand: string
  category: FoodCategory
  foodType: FoodType
  description: string
  ingredients?: string[]
  protein?: number
  fat?: number
  fiber?: number
  moisture?: number
  calories?: number
  ageMinMonths?: number
  ageMaxMonths?: number
  weightRange?: string
  allergens?: string[]
  prescriptionRequired?: boolean
  vetNotes?: string
  treatmentIds?: string[]
}

const buildFormData = (data: Partial<CatFoodInput>, imageFile?: File): FormData => {
  const fd = new FormData()
  const appendIfDefined = (key: string, value: unknown) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) fd.append(key, JSON.stringify(value))
      else fd.append(key, String(value))
    }
  }
  appendIfDefined('name', data.name)
  appendIfDefined('brand', data.brand)
  appendIfDefined('category', data.category)
  appendIfDefined('foodType', data.foodType)
  appendIfDefined('description', data.description)
  appendIfDefined('ingredients', data.ingredients)
  appendIfDefined('protein', data.protein)
  appendIfDefined('fat', data.fat)
  appendIfDefined('fiber', data.fiber)
  appendIfDefined('moisture', data.moisture)
  appendIfDefined('calories', data.calories)
  appendIfDefined('ageMinMonths', data.ageMinMonths)
  appendIfDefined('ageMaxMonths', data.ageMaxMonths)
  appendIfDefined('weightRange', data.weightRange)
  appendIfDefined('allergens', data.allergens)
  if (data.prescriptionRequired !== undefined)
    fd.append('prescriptionRequired', String(data.prescriptionRequired))
  appendIfDefined('vetNotes', data.vetNotes)
  appendIfDefined('treatmentIds', data.treatmentIds)
  if (imageFile) fd.append('image', imageFile)
  return fd
}

export const catFoodAPI = {
  create: async (data: CatFoodInput, imageFile?: File) =>
    apiClient.post<CatFood>('/cat-foods', buildFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getById: async (id: string) => apiClient.get<CatFood>(`/cat-foods/${id}`),

  list: async (skip = 0, take = 12, search?: string, category?: string, foodType?: string) =>
    apiClient.get<CatFoodListResponse>('/cat-foods', {
      params: { skip, take, search, category, foodType },
    }),

  search: async (query: string) =>
    apiClient.get<CatFood[]>('/cat-foods/search', { params: { q: query } }),

  update: async (id: string, data: Partial<CatFoodInput>, imageFile?: File) =>
    apiClient.put<CatFood>(`/cat-foods/${id}`, buildFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: async (id: string) => apiClient.delete(`/cat-foods/${id}`),
}