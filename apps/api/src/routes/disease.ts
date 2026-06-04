import { Router } from 'express'
import multer from 'multer'
import {
  createDisease,
  getDisease,
  listDiseases,
  searchDiseases,
  updateDisease,
  deleteDisease,
} from '../controllers/disease.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

const upload = multer({ storage: multer.memoryStorage() })

export const diseaseRouter: Router = Router()

// Apply authentication middleware to all disease routes
diseaseRouter.use(authenticate)

// Create disease (VET only)
diseaseRouter.post('/', requireVet, upload.single('image'), createDisease)

// List diseases (paginated with search/filter)
diseaseRouter.get('/', listDiseases)

// Search diseases
diseaseRouter.get('/search', searchDiseases)

// Get disease details
diseaseRouter.get('/:id', getDisease)

// Update disease (VET only)
diseaseRouter.put('/:id', requireVet, upload.single('image'), updateDisease)

// Delete disease (VET only)
diseaseRouter.delete('/:id', requireVet, deleteDisease)