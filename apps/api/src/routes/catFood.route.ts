import { Router } from 'express'
import multer from 'multer'
import {
  createCatFood, getCatFood, listCatFoods,
  searchCatFoods, updateCatFood, deleteCatFood,
} from '../controllers/CatFood.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

const upload = multer({ storage: multer.memoryStorage() })
export const catFoodRouter: Router = Router()

catFoodRouter.use(authenticate)
catFoodRouter.post('/', requireVet, upload.single('image'), createCatFood)
catFoodRouter.get('/', listCatFoods)
catFoodRouter.get('/search', searchCatFoods)
catFoodRouter.get('/:id', getCatFood)
catFoodRouter.put('/:id', requireVet, upload.single('image'), updateCatFood)
catFoodRouter.delete('/:id', requireVet, deleteCatFood)