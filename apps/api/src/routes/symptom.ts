import { Router } from 'express'
import {
  createSymptom,
  getSymptom,
  listSymptoms,
  searchSymptoms,
  updateSymptom,
  deleteSymptom,
  linkDiseases,
  unlinkDisease,
} from '../controllers/Symptom.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

export const symptomRouter: Router = Router()

symptomRouter.use(authenticate)

// CRUD
symptomRouter.post('/', requireVet, createSymptom)
symptomRouter.get('/', listSymptoms)
symptomRouter.get('/search', searchSymptoms)
symptomRouter.get('/:id', getSymptom)
symptomRouter.put('/:id', requireVet, updateSymptom)
symptomRouter.delete('/:id', requireVet, deleteSymptom)

// Link management
symptomRouter.post('/:id/diseases', requireVet, linkDiseases)
symptomRouter.delete('/:id/diseases/:diseaseId', requireVet, unlinkDisease)