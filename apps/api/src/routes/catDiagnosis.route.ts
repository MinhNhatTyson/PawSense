import { Router } from 'express'
import {
  createCatDiagnosis,
  listCatDiagnoses,
  deleteCatDiagnosis,
} from '../controllers/CatDiagnosis.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

export const catDiagnosisRouter: Router = Router()

// Entire router is vet-only — CatDiagnosis is vet-writable only.
// Pet owners read diagnoses via the existing /api/cat-profiles/:id include instead.
catDiagnosisRouter.use(authenticate)
catDiagnosisRouter.use(requireVet)

catDiagnosisRouter.post('/', createCatDiagnosis)
catDiagnosisRouter.get('/', listCatDiagnoses)
catDiagnosisRouter.delete('/:id', deleteCatDiagnosis)