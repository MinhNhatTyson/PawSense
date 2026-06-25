import { Router } from 'express'
import multer from 'multer'
import {
  createCatBreed,
  getCatBreed,
  listCatBreeds,
  searchCatBreeds,
  updateCatBreed,
  deleteCatBreed,
} from '../controllers/CatBreed.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

const upload = multer({ storage: multer.memoryStorage() })

export const catBreedRouter: Router = Router()

catBreedRouter.use(authenticate)

catBreedRouter.post('/', requireVet, upload.array('images', 10), createCatBreed)
catBreedRouter.get('/', listCatBreeds)
catBreedRouter.get('/search', searchCatBreeds)
catBreedRouter.get('/:id', getCatBreed)
catBreedRouter.put('/:id', requireVet, upload.array('images', 10), updateCatBreed)
catBreedRouter.delete('/:id', requireVet, deleteCatBreed)