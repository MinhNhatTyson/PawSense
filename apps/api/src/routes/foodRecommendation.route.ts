import { Router } from 'express'
import { analyzeFoodRecommendation } from '../controllers/FoodRecommendation.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export const foodRecommendationRouter: Router = Router()

// Open to any authenticated user — primarily used by mobile Pet Owners
foodRecommendationRouter.use(authenticate)
foodRecommendationRouter.post('/analyze', analyzeFoodRecommendation)