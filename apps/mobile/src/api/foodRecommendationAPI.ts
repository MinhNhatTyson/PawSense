import { storage } from '../utils/storage'

const API_URL = 'http://localhost:3000/api'

export type FoodCategory = 'KITTEN' | 'ADULT' | 'SENIOR' | 'PRESCRIPTION'

export interface MatchedFood {
  id: string
  name: string
  brand: string
  category: FoodCategory
  foodType: string
  description: string
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
  imageUrl: string | null
  matchedConditions: string[]
}

export interface FoodRecommendationResult {
  dietaryProfile: string
  recommendedCategory: FoodCategory
  keyNutrientFocus: string[]
  avoidIngredients: string[]
  generalGuidance: string[]
  urgentWarning: string | null
  diagnosedConditions: string[]
  matchedFoods: MatchedFood[]
}

export interface FoodRecommendationInput {
  catProfileId?: string
  breedId?: string
  ageYears?: number
  ageMonths?: number
  weightKg?: number
  healthConditionIds?: string[]
  healthConditionNotes?: string
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const foodRecommendationAPI = {
  async analyze(input: FoodRecommendationInput): Promise<FoodRecommendationResult> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/food-recommendation/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to generate food recommendations')
    return json
  },
}