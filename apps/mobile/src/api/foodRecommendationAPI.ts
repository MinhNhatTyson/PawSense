import { apiFetch } from '../utils/apiFetch'

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

export const foodRecommendationAPI = {
  async analyze(input: FoodRecommendationInput): Promise<FoodRecommendationResult> {
    const res = await apiFetch('/food-recommendation/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to generate food recommendations')
    return json
  },
}